/**
 * @fileOverview Helper para realizar peticiones autenticadas a la WooCommerce REST API con Cache y Resiliencia.
 */

// Cache en memoria persistente durante la vida del proceso Node.js
const MEMORY_CACHE = new Map<string, { data: any; timestamp: number }>();

// TTL (Time To Live) por defecto: 5 minutos
const DEFAULT_TTL = 300 * 1000;

/**
 * Helper para construir una clave de cache única
 */
function getCacheKey(endpoint: string, params: any, method: string): string {
  return `${method}:${endpoint}:${JSON.stringify(params)}`;
}

/**
 * Interfaz de respuesta mejorada
 */
export interface FetchWooResult {
  data: any;
  cacheStatus: 'HIT' | 'MISS' | 'STALE' | 'BYPASS';
}

/**
 * Fetch con esteroides para WooCommerce en Hostinger
 */
export async function fetchWooCommerce(
  endpoint: string, 
  params: Record<string, string> = {}, 
  method: string = 'GET', 
  body?: any,
  options: { ttl?: number; useCache?: boolean } = { useCache: true }
): Promise<FetchWooResult> {
  const apiUrl = process.env.WC_API_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  if (!apiUrl || !consumerKey || !consumerSecret) {
    throw new Error('Faltan credenciales de WooCommerce.');
  }

  const cacheKey = getCacheKey(endpoint, params, method);
  const now = Date.now();
  const ttl = options.ttl ?? DEFAULT_TTL;

  // 1. Intentar HIT de Cache
  if (options.useCache && method === 'GET') {
    const cached = MEMORY_CACHE.get(cacheKey);
    if (cached && (now - cached.timestamp) < ttl) {
      console.log(`[WooCache] HIT: ${endpoint}`);
      return { data: cached.data, cacheStatus: 'HIT' };
    }
  }

  // 2. Preparar Petición
  const cleanApiUrl = apiUrl.startsWith('http') ? apiUrl : `https://${apiUrl}`;
  const url = new URL(`${cleanApiUrl}/wp-json/wc/v3/${endpoint}`);
  
  if (method === 'GET') {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const startTime = performance.now();

  try {
    // 3. Ejecutar Fetch con Timeout (15s)
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000), // Hostinger friendly timeout
      cache: 'no-store'
    });

    const duration = (performance.now() - startTime).toFixed(0);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`[WooFetch] MISS: ${endpoint} - ${duration}ms`);

    // Guardar en cache si es GET
    if (method === 'GET' && options.useCache) {
      MEMORY_CACHE.set(cacheKey, { data, timestamp: now });
    }

    return { data, cacheStatus: 'MISS' };

  } catch (error: any) {
    const duration = (performance.now() - startTime).toFixed(0);
    console.error(`[WooError] ${endpoint} tras ${duration}ms: ${error.message}`);

    // 4. Estrategia Fallback: Si falla, buscar dato STALE en cache
    if (method === 'GET') {
      const staleData = MEMORY_CACHE.get(cacheKey);
      if (staleData) {
        console.warn(`[WooCache] STALE: Sirviendo backup para ${endpoint}`);
        return { data: staleData.data, cacheStatus: 'STALE' };
      }
    }

    throw error;
  }
}

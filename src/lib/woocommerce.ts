/**
 * @fileOverview Núcleo de integración con WooCommerce REST API.
 * Implementa cache en memoria, timeout de seguridad y deduplicación de peticiones.
 */

const CACHE_TTL = 120000; // 2 minutos
const TIMEOUT_MS = 15000; // 15 segundos

const cache = new Map<string, { data: any; timestamp: number }>();
const pending = new Map<string, Promise<any>>();

export async function fetchWooCommerce(endpoint: string, params: Record<string, string> = {}, method: string = 'GET', body?: any) {
  const url = new URL(`${process.env.WC_API_URL}/wp-json/wc/v3/${endpoint}`);
  
  if (method === 'GET') {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const cacheKey = `${method}:${url.toString()}`;

  // 1. Retornar cache si existe y es joven
  const cached = cache.get(cacheKey);
  if (method === 'GET' && cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // 2. Deduplicación (Single-flight)
  if (method === 'GET' && pending.has(cacheKey)) {
    return pending.get(cacheKey);
  }

  const requestPromise = (async () => {
    const auth = Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString('base64');
    
    try {
      const response = await fetch(url.toString(), {
        method,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        cache: 'no-store',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`WooCommerce Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (method === 'GET') {
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }
      return data;
    } finally {
      pending.delete(cacheKey);
    }
  })();

  if (method === 'GET') {
    pending.set(cacheKey, requestPromise);
  }

  return requestPromise;
}

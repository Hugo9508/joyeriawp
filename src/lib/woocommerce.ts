
/**
 * @fileOverview Núcleo de integración blindado con WooCommerce REST API.
 * Credenciales inyectadas directamente para máxima estabilidad en Hostinger.
 * No depende de variables de entorno (.env).
 */

const TTL_MS = 120_000; // 2 minutos para productos
const CATEGORY_TTL_MS = 3600_000; // 1 hora para categorías
const TIMEOUT_MS = 30_000; // 30 segundos de timeout

/**
 * BÓVEDA DE CREDENCIALES (INTERNAL VAULT)
 * Los valores están codificados en Base64 para evitar lectura simple en texto plano,
 * pero se procesan directamente en el servidor.
 */
const VAULT = {
  // https://joyeriabd.a380.com.br
  u: "aHR0cHM6Ly9qb3llcmlhYmQuYTM4MC5jb20uYnI=", 
  // ck_8ccd67db7fcedb02e7d02e6d2f244a8263660c96
  k: "Y2tfOGNjZDY3ZGI3ZmNlZGIwMmU3ZDAyZTZkMmYyNDRhODI2MzY2MGM5Ng==", 
  // cs_145cb75e5f15baa027ada78edab63da876876f38
  s: "Y3NfMTQ1Y2I3NWU1ZjE1YmFhMDI3YWRhNzhlZGFiNjNkYTg3Njg3NmYzOA==" 
};

function decode(val: string) {
  try {
    return Buffer.from(val, 'base64').toString('utf-8');
  } catch (e) {
    console.error("Fallo crítico al decodificar credenciales:", e);
    return "";
  }
}

export const WOO_BASE_URL = decode(VAULT.u);
const WOO_CK = decode(VAULT.k);
const WOO_CS = decode(VAULT.s);

// Cache en memoria para evitar saturación del backend
const memCache = new Map<string, { ts: number; data: any }>();
const pendingRequests = new Map<string, Promise<any>>();

let categorySlugMap: Record<string, number> = {};
let lastCategoryFetch = 0;

/**
 * Normaliza la URL base asegurando el protocolo https.
 */
function cleanBaseUrl(input: string) {
  if (!input) return '';
  const withProto = input.startsWith("http") ? input : `https://${input}`;
  return withProto.replace(/\/+$/, "");
}

/**
 * Genera una query string estable para el cache.
 */
function stableQuery(params: Record<string, string>) {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && String(v).length > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
}

/**
 * Resuelve un slug de categoría a su ID numérico de WooCommerce.
 */
export async function getCategoryIdBySlug(slug: string): Promise<string | null> {
  const now = Date.now();
  if (Object.keys(categorySlugMap).length === 0 || (now - lastCategoryFetch > CATEGORY_TTL_MS)) {
    try {
      const categories = await fetchWooCommerce('products/categories', { per_page: '100', hide_empty: 'true' });
      if (Array.isArray(categories)) {
        const newMap: Record<string, number> = {};
        categories.forEach((cat: any) => {
          newMap[cat.slug] = cat.id;
        });
        categorySlugMap = newMap;
        lastCategoryFetch = now;
      }
    } catch (e: any) {
      console.error("Error al refrescar mapa de categorías:", e.message);
    }
  }
  return categorySlugMap[slug]?.toString() || null;
}

/**
 * Función principal de comunicación con WooCommerce.
 */
export async function fetchWooCommerce(
  endpoint: string,
  params: Record<string, string> = {},
  method: string = "GET",
  body?: any
) {
  const base = cleanBaseUrl(WOO_BASE_URL);
  
  if (!base || !WOO_CK || !WOO_CS) {
    throw new Error("Configuración de WooCommerce no encontrada en la bóveda interna.");
  }

  const url = new URL(`${base}/wp-json/wc/v3/${endpoint}`);

  if (method.toUpperCase() === "GET") {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  const query = stableQuery(Object.fromEntries(url.searchParams.entries()));
  const cacheKey = `${method.toUpperCase()} ${url.origin}${url.pathname}${query ? `?${query}` : ""}`;

  const now = Date.now();
  const cached = memCache.get(cacheKey);

  // Servir desde cache si es fresco (Solo GET)
  if (method.toUpperCase() === "GET" && cached && now - cached.ts <= TTL_MS) {
    return cached.data;
  }

  // Deduplicación de peticiones en vuelo
  if (method.toUpperCase() === "GET" && pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const fetcher = (async () => {
    const auth = Buffer.from(`${WOO_CK}:${WOO_CS}`).toString("base64");
    
    try {
      const response = await fetch(url.toString(), {
        method,
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
          "User-Agent": "AurumLuz-BFF/2.0 (Hostinger Optimized)"
        },
        body: method.toUpperCase() === "GET" ? undefined : body ? JSON.stringify(body) : undefined,
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
        console.error(`WOO_API_ERROR [${response.status}]:`, errorData);
        throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (method.toUpperCase() === "GET") {
        memCache.set(cacheKey, { ts: Date.now(), data });
      }
      
      return data;
    } catch (err: any) {
      console.error(`FETCH_CRITICAL_FAILURE (${endpoint}):`, err.message);
      
      // Fallback: Si falla y tenemos cache aunque esté viejo, lo usamos para no dar 502
      if (method.toUpperCase() === "GET" && cached) {
        console.warn(`Fallback a cache expirado para ${endpoint} tras error de red.`);
        return cached.data;
      }
      
      throw err;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  if (method.toUpperCase() === "GET") {
    pendingRequests.set(cacheKey, fetcher);
  }

  return fetcher;
}

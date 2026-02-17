/**
 * @fileOverview Núcleo de integración blindado con WooCommerce REST API.
 * Las credenciales están inyectadas directamente para evitar fallos de lectura de variables en Hostinger.
 */

const TTL_MS = 120_000; // 2 minutos para productos
const CATEGORY_TTL_MS = 3600_000; // 1 hora para categorías
const TIMEOUT_MS = 15_000; // 15 segundos de timeout para evitar bloqueos del proceso Node

/**
 * Bóveda de Credenciales Directa (Codificada en Base64 para privacidad básica)
 * No depende de process.env para evitar errores 503 por falta de variables en runtime.
 */
const VAULT = {
  u: "aHR0cHM6Ly9qb3llcmlhYmQuYTM4MC5jb20uYnI=", // https://joyeriabd.a380.com.br
  k: "Y2tfOGNjZDY3ZGI3ZmNlZGIwMmU3ZDAyZTZkMmYyNDRhODI2MzY2MGM5Ng==", // ck_8ccd67...
  s: "Y3NfMTQ1Y2I3NWVmMTViYWEwMjdhZGE3OGVkYWI2M2RhODc2ODc2ZjM4" // cs_145cb7...
};

function decode(val: string) {
  try {
    return Buffer.from(val, 'base64').toString('utf-8');
  } catch (e) {
    return "";
  }
}

// Valores finales inyectados en la RAM al arrancar
export const WOO_BASE_URL = decode(VAULT.u);
const WOO_CK = decode(VAULT.k);
const WOO_CS = decode(VAULT.s);

const memCache = new Map<string, { ts: number; data: any }>();
const pendingRequests = new Map<string, Promise<any>>();

let categorySlugMap: Record<string, number> = {};
let lastCategoryFetch = 0;

function cleanBaseUrl(input: string) {
  if (!input) return '';
  const withProto = input.startsWith("http") ? input : `https://${input}`;
  return withProto.replace(/\/+$/, "");
}

function stableQuery(params: Record<string, string>) {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && String(v).length > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
}

/**
 * Resuelve el ID de una categoría a partir de su slug usando un mapa en memoria.
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
    } catch (e) {
      console.error("Error al refrescar mapa de categorías:", e.message);
    }
  }
  return categorySlugMap[slug]?.toString() || null;
}

/**
 * Función centralizada de comunicación con WooCommerce con Cache L1 y resiliencia.
 */
export async function fetchWooCommerce(
  endpoint: string,
  params: Record<string, string> = {},
  method: string = "GET",
  body?: any
) {
  const apiUrl = WOO_BASE_URL;
  const consumerKey = WOO_CK;
  const consumerSecret = WOO_CS;

  if (!apiUrl || !consumerKey || !consumerSecret) {
    throw new Error("CRITICAL_AUTH_ERROR: Las credenciales internas están incompletas.");
  }

  const base = cleanBaseUrl(apiUrl);
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

  // Cache L1: Retorno inmediato si el dato es fresco
  if (method.toUpperCase() === "GET" && cached && now - cached.ts <= TTL_MS) {
    return cached.data;
  }

  // Single-flight: Evita peticiones duplicadas en vuelo
  if (method.toUpperCase() === "GET" && pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const fetcher = (async () => {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    try {
      const response = await fetch(url.toString(), {
        method,
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json"
        },
        body: method.toUpperCase() === "GET" ? undefined : body ? JSON.stringify(body) : undefined,
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`WOO_API_FAIL: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (method.toUpperCase() === "GET") {
        memCache.set(cacheKey, { ts: Date.now(), data });
      }
      
      return data;
    } catch (err: any) {
      // Fallback a datos STALE si el backend falla o hay timeout
      if (method.toUpperCase() === "GET" && cached) {
        console.warn(`Fallback a datos STALE para ${endpoint} debido a error: ${err.message}`);
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
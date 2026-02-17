
/**
 * @fileOverview Núcleo de integración resiliente con WooCommerce REST API.
 * Implementa Single-Flight, Cache L1 y Bóveda de Credenciales Directa para Hostinger.
 */

const TTL_MS = 120_000; // 2 minutos para productos
const CATEGORY_TTL_MS = 3600_000; // 1 hora para categorías
const TIMEOUT_MS = 15_000; // 15 segundos de timeout

// Bóveda Interna Primaria (Prioridad 1)
// Estas credenciales son las finales extraídas de tu panel de Hostinger.
const INTERNAL_VAULT = {
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

export async function fetchWooCommerce(
  endpoint: string,
  params: Record<string, string> = {},
  method: string = "GET",
  body?: any
) {
  // CONFIGURACIÓN DIRECTA: Consumimos de la bóveda interna para máxima estabilidad en Hostinger
  const apiUrl = process.env.WC_API_URL || decode(INTERNAL_VAULT.u);
  const consumerKey = process.env.WC_CONSUMER_KEY || decode(INTERNAL_VAULT.k);
  const consumerSecret = process.env.WC_CONSUMER_SECRET || decode(INTERNAL_VAULT.s);

  if (!apiUrl || !consumerKey || !consumerSecret) {
    throw new Error("VAULT_INCOMPLETE: Credenciales de WooCommerce no encontradas.");
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

  if (method.toUpperCase() === "GET" && cached && now - cached.ts <= TTL_MS) {
    return cached.data;
  }

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
        throw new Error(`WOO_ERROR: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (method.toUpperCase() === "GET") {
        memCache.set(cacheKey, { ts: Date.now(), data });
      }
      
      return data;
    } catch (err: any) {
      if (method.toUpperCase() === "GET" && cached) {
        console.warn(`Fallback a STALE data para ${endpoint} debido a: ${err.message}`);
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

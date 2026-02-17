/**
 * @fileOverview Núcleo de integración resiliente con WooCommerce REST API.
 * Implementa Single-Flight, Cache L1 y Timeouts para Hostinger.
 */

const TTL_MS = 120_000; // 2 min (fresco)
const STALE_TTL_MS = 600_000; // 10 min (fallback)
const TIMEOUT_MS = 15_000;

// Cache en memoria y deduplicación de peticiones (Single-Flight)
const memCache = new Map<string, { ts: number; data: any }>();
const pendingRequests = new Map<string, Promise<any>>();

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

export async function fetchWooCommerce(
  endpoint: string,
  params: Record<string, string> = {},
  method: string = "GET",
  body?: any
) {
  // Soporte para ambos nombres de variables (Hostinger config)
  const apiUrl = process.env.WC_API_URL || process.env.WOOCOMMERCE_API_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY || process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET || process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!apiUrl || !consumerKey || !consumerSecret) {
    console.error("DEBUG: Faltan credenciales en .env");
    throw new Error("CONFIG_MISSING: Faltan credenciales de WooCommerce en el servidor.");
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

  // 1. HIT: Si el dato está en cache y es reciente
  if (method.toUpperCase() === "GET" && cached && now - cached.ts <= TTL_MS) {
    return cached.data;
  }

  // 2. SINGLE-FLIGHT: Si ya hay una petición idéntica en curso, esperamos a esa
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
          "Content-Type": "application/json",
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
      // 3. STALE: Si hay error o timeout pero tenemos cache guardado (hasta 10 min)
      if (method.toUpperCase() === "GET" && cached && now - cached.ts <= STALE_TTL_MS) {
        console.warn(`WARN: Usando cache expirado para ${cacheKey} debido a error: ${err.message}`);
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

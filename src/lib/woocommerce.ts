/**
 * @fileOverview Helper para realizar peticiones autenticadas a la WooCommerce REST API desde el servidor,
 * con timeout + cache en memoria + fallback STALE + Single-Flight (deduplicación).
 */

const TTL_MS = 120_000; // 2 min (fresh)
const STALE_TTL_MS = 600_000; // 10 min (fallback)
const TIMEOUT_MS = 15_000;

const memCache = new Map<string, { ts: number; data: any }>();
const pendingRequests = new Map<string, Promise<FetchWooResult>>();

function cleanBaseUrl(input: string) {
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

export interface FetchWooResult {
  data: any;
  status: 'HIT' | 'MISS' | 'STALE' | 'BYPASS';
}

export async function fetchWooCommerce(
  endpoint: string,
  params: Record<string, string> = {},
  method: string = "GET",
  body?: any
): Promise<FetchWooResult> {
  // Soporte para ambos nombres de variables (Hostinger vs Local)
  const apiUrl = process.env.WOOCOMMERCE_API_URL || process.env.WC_API_URL;
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET;

  if (!apiUrl || !consumerKey || !consumerSecret) {
    const missing = [];
    if (!apiUrl) missing.push("API_URL");
    if (!consumerKey) missing.push("CONSUMER_KEY");
    if (!consumerSecret) missing.push("CONSUMER_SECRET");
    throw new Error(`Faltan credenciales de WooCommerce en Hostinger: ${missing.join(", ")}`);
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
  
  // 1. HIT: Cache fresco
  if (method.toUpperCase() === "GET" && cached && now - cached.ts <= TTL_MS) {
    return { data: cached.data, status: 'HIT' };
  }

  // 2. Single-Flight: Si ya hay una petición idéntica en curso, esperamos a esa
  if (method.toUpperCase() === "GET" && pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const fetchPromise = (async (): Promise<FetchWooResult> => {
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
        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      if (method.toUpperCase() === "GET") {
        memCache.set(cacheKey, { ts: now, data });
      }
      
      return { data, status: 'MISS' };
    } catch (err: any) {
      // 3. STALE: Fallback si falla Woo pero tenemos algo en cache (hasta 10 min)
      if (method.toUpperCase() === "GET" && cached && now - cached.ts <= STALE_TTL_MS) {
        return { data: cached.data, status: 'STALE' };
      }
      throw err;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  if (method.toUpperCase() === "GET") {
    pendingRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
}

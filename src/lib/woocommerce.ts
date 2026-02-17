/**
 * @fileOverview Helper para realizar peticiones autenticadas a la WooCommerce REST API desde el servidor,
 * con timeout + cache en memoria + fallback STALE.
 */

const TTL_MS = 120_000; // 2 min (fresh)
const STALE_TTL_MS = 600_000; // 10 min (fallback)
const TIMEOUT_MS = 15_000;

const memCache = new Map<string, { ts: number; data: any }>();

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
  const apiUrl = process.env.WC_API_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  if (!apiUrl || !consumerKey || !consumerSecret) {
    throw new Error("Faltan credenciales de WooCommerce en las variables de entorno del servidor.");
  }

  const base = cleanBaseUrl(apiUrl);
  const url = new URL(`${base}/wp-json/wc/v3/${endpoint}`);

  if (method.toUpperCase() === "GET") {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  // Cache key estable (endpoint + params ordenados)
  const query = stableQuery(Object.fromEntries(url.searchParams.entries()));
  const cacheKey = `${method.toUpperCase()} ${url.origin}${url.pathname}${query ? `?${query}` : ""}`;

  const now = Date.now();
  const cached = memCache.get(cacheKey);
  
  // 1. HIT: Cache fresco
  if (method.toUpperCase() === "GET" && cached && now - cached.ts <= TTL_MS) {
    console.log(`[WooCommerce Cache] HIT: ${endpoint}`);
    return { data: cached.data, status: 'HIT' };
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  try {
    // 2. MISS: Petición real con Timeout
    const startTime = performance.now();
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
    const duration = (performance.now() - startTime).toFixed(0);
    console.log(`[WooCommerce Fetch] MISS: ${endpoint} - ${duration}ms`);

    if (method.toUpperCase() === "GET") {
      memCache.set(cacheKey, { ts: now, data });
    }
    
    return { data, status: 'MISS' };
  } catch (err: any) {
    // 3. STALE: Fallback a cache antiguo si falla la red o hay timeout
    if (method.toUpperCase() === "GET" && cached && now - cached.ts <= STALE_TTL_MS) {
      console.warn(`[WooCommerce Cache] STALE: Serving fallback for ${endpoint} due to error: ${err.message}`);
      return { data: cached.data, status: 'STALE' };
    }
    throw err;
  }
}

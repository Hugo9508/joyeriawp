/**
 * @fileOverview Núcleo de integración resiliente con WooCommerce REST API.
 * Implementa Single-Flight, Cache L1 y Bóveda de Credenciales Enmascaradas.
 */

const TTL_MS = 120_000; 
const CATEGORY_TTL_MS = 3600_000; 
const TIMEOUT_MS = 15_000;

// Bóveda de Respaldo (Enmascarada en Base64 para protección básica)
// Nota: En producción, Hostinger leerá esto instantáneamente desde la RAM.
const INTERNAL_VAULT = {
  // Para actualizar: btoa("tu_dato") en la consola del navegador y pega aquí el resultado
  u: "aHR0cHM6Ly9qb3llcmlhYmQuYTM4MC5jb20uYnI=", // URL: https://joyeriabd.a380.com.br
  k: "Y2tfMGI0ZWRjMmZmOWZkNzVjNDU3ZjM4MGFkMzliNGFiMDIzYjA0Nzg2Mg==", // Coloca aquí tu Key en Base64
  s: "Y3NfY2ExNjBiZDI4OGJkMzAwZDQ5YzFiM2UwYjFmMDUyYmYyMjgxYWYzOA=="  // Coloca aquí tu Secret en Base64
};

function decode(val: string) {
  try {
    return Buffer.from(val, 'base64').toString('utf-8');
  } catch (e) {
    return "";
  }
}

// Cache en memoria
const memCache = new Map<string, { ts: number; data: any }>();
const pendingRequests = new Map<string, Promise<any>>();

// Diccionario de categorías para resolución instantánea
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
      const categories = await fetchWooCommerce('products/categories', { per_page: '100' });
      if (Array.isArray(categories)) {
        const newMap: Record<string, number> = {};
        categories.forEach((cat: any) => {
          newMap[cat.slug] = cat.id;
        });
        categorySlugMap = newMap;
        lastCategoryFetch = now;
      }
    } catch (e) {
      console.error("Error al refrescar mapa de categorías:", e);
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
  // 1. Intentar variables de entorno
  let apiUrl = process.env.WC_API_URL || process.env.WOOCOMMERCE_API_URL;
  let consumerKey = process.env.WC_CONSUMER_KEY || process.env.WOOCOMMERCE_CONSUMER_KEY;
  let consumerSecret = process.env.WC_CONSUMER_SECRET || process.env.WOOCOMMERCE_CONSUMER_SECRET;

  // 2. Fallback a Bóveda Interna si las variables no existen o están vacías
  if (!apiUrl || apiUrl.length < 5) apiUrl = decode(INTERNAL_VAULT.u);
  if (!consumerKey) consumerKey = decode(INTERNAL_VAULT.k);
  if (!consumerSecret) consumerSecret = decode(INTERNAL_VAULT.s);

  if (!apiUrl || !consumerKey || !consumerSecret) {
    throw new Error("CONFIG_MISSING: No se detectaron credenciales ni en ENV ni en Vault.");
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
      if (method.toUpperCase() === "GET" && cached) return cached.data;
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
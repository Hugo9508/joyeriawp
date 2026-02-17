/**
 * @fileOverview Núcleo de integración resiliente con WooCommerce REST API.
 * Implementa Single-Flight, Cache L1 y Bóveda de Credenciales Directa.
 */

const TTL_MS = 120_000; 
const CATEGORY_TTL_MS = 3600_000; 
const TIMEOUT_MS = 15_000;

// Bóveda Interna Primaria (Prioridad 1)
// Las credenciales se consumen directamente desde aquí para evitar fallos de lectura de .env en hosting compartido.
const INTERNAL_VAULT = {
  // URL: https://joyeriabd.a380.com.br
  u: "aHR0cHM6Ly9qb3llcmlhYmQuYTM4MC5jb20uYnI=", 
  // Key: ck_0b4edc2ff9fd75c457f380ad39b4ab023b047862
  k: "Y2tfMGI0ZWRjMmZmOWZkNzVjNDU3ZjM4MGFkMzliNGFiMDIzYjA0Nzg2Mg==", 
  // Secret: cs_ca160bd288bd300d49c1b3e0b1f052bf2281af3a
  s: "Y3NfY2ExNjBiZDI4OGJkMzAwZDQ5YzFiM2UwYjFmMDUyYmYyMjgxYWYzOA=="  
};

function decode(val: string) {
  try {
    return Buffer.from(val, 'base64').toString('utf-8');
  } catch (e) {
    return "";
  }
}

// Cache en memoria para evitar colisiones (Single-Flight)
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
  // CONFIGURACIÓN DIRECTA: Consumimos de la bóveda interna ignorando el .env para máxima estabilidad
  const apiUrl = decode(INTERNAL_VAULT.u);
  const consumerKey = decode(INTERNAL_VAULT.k);
  const consumerSecret = decode(INTERNAL_VAULT.s);

  if (!apiUrl || !consumerKey || !consumerSecret) {
    throw new Error("VAULT_INCOMPLETE: Las credenciales internas no están configuradas correctamente.");
  }

  const base = cleanBaseUrl(apiUrl);
  const url = new URL(`${base}/wp-json/wc/v3/${endpoint}`);

  if (method.toUpperCase() === "GET") {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  // Generar key de cache estable
  const query = stableQuery(Object.fromEntries(url.searchParams.entries()));
  const cacheKey = `${method.toUpperCase()} ${url.origin}${url.pathname}${query ? `?${query}` : ""}`;

  const now = Date.now();
  const cached = memCache.get(cacheKey);

  // 1. HIT de Cache L1
  if (method.toUpperCase() === "GET" && cached && now - cached.ts <= TTL_MS) {
    return cached.data;
  }

  // 2. Single-Flight: Deduplicación de peticiones en curso
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
          "Cache-Control": "no-cache"
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
      // Fallback a Cache Stale si el backend falla o hay timeout
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
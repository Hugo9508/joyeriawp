/**
 * Helper para realizar peticiones autenticadas a la WooCommerce REST API desde el servidor.
 */
export async function fetchWooCommerce(endpoint: string, params: Record<string, string> = {}, method: string = 'GET', body?: any) {
  const apiUrl = process.env.WC_API_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  if (!apiUrl || !consumerKey || !consumerSecret) {
    throw new Error('Faltan credenciales de WooCommerce en las variables de entorno del servidor.');
  }

  const cleanApiUrl = apiUrl.startsWith('http') ? apiUrl : `https://${apiUrl}`;
  const url = new URL(`${cleanApiUrl}/wp-json/wc/v3/${endpoint}`);
  
  if (method === 'GET') {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await fetch(url.toString(), {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Error en la API WooCommerce: ${errorData.message || response.statusText}`);
  }

  return response.json();
}

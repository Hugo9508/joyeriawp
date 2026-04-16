/**
 * @fileOverview Configuración centralizada de la Boutique.
 * Aquí se gestionan los parámetros de conexión con el ecosistema n8n.
 */

export const appSettings = {
  // Datos de la tienda
  whatsAppNumber: "59895435644",
  chatAgentName: "Alma",

  // n8n Alma Agent (Flujo 1) — el chat web se comunica SOLO con este endpoint
  almaWebhookUrl: "https://n8n.axion380.com.br/webhook/alma-agent",

  // Legacy: webhook anterior (WhatsApp flow) — se mantiene por retrocompatibilidad
  n8nWebhookUrl: "https://n8n.axion380.com.br/webhook/jaflujodev",

  // URL de la boutique
  siteUrl: "https://joyeria.a380.com.br",

  // Mercado Pago Checkout — webhook n8n que crea la preferencia de pago
  checkoutWebhookUrl: "https://n8n.axion380.com.br/webhook/ja-checkout",
};

/** Decodifica un valor Base64 (usado para secretos hardcoded). */
const _d = (b: string) => Buffer.from(b, 'base64').toString('utf-8');

/**
 * Server-side only — NUNCA importar en componentes cliente.
 * Prioridad: process.env > fallback codificado.
 */
export const serverSettings = {
  difyApiKey:
    process.env.DIFY_API_KEY || _d('YXBwLUtzSUI0bDZmRVVuazVhSUtFM3M2WGdORA=='),
  difyBaseUrl:
    process.env.DIFY_BASE_URL || _d('aHR0cHM6Ly9hcGkuZGlmeS5haS92MQ=='),
  n8nEventWebhookUrl:
    process.env.N8N_EVENT_WEBHOOK_URL || _d('aHR0cHM6Ly9uOG4uYXhpb24zODAuY29tLmJyL3dlYmhvb2svZGlmeS1ldmVudHM='),
};

/**
 * @fileOverview Configuración centralizada de la Boutique.
 * Aquí se gestionan los parámetros de conexión con el ecosistema n8n.
 */

export const appSettings = {
  // Datos de la tienda
  whatsAppNumber: "59895435644",
  chatAgentName: "Alma",

  // Integración con n8n (Web -> WhatsApp) — legacy, se mantiene para flujo WhatsApp
  n8nWebhookUrl: "https://n8n.axion380.com.br/webhook/jaflujodev",

  // URL de la boutique para recibir respuestas (n8n -> Web)
  siteUrl: "https://joyeria.a380.com.br"
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

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

/**
 * Server-side only — NUNCA importar en componentes cliente.
 * Las variables sensibles se leen de process.env (.env.local).
 */
export const serverSettings = {
  difyApiKey: process.env.DIFY_API_KEY || '',
  difyBaseUrl: process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1',
  n8nEventWebhookUrl: process.env.N8N_EVENT_WEBHOOK_URL || '',
};

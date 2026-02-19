/**
 * @fileOverview Configuración centralizada de la Boutique.
 * Aquí se gestionan los parámetros de conexión con el ecosistema n8n.
 */

export const appSettings = {
  // Datos de la tienda
  whatsAppNumber: "59895435644",
  chatAgentName: "Maya",
  
  // Integración con n8n (Web -> WhatsApp)
  // Nueva URL validada: jaflujodev
  n8nWebhookUrl: "https://n8n.axion380.com.br/webhook/jaflujodev",
  
  // URL de la boutique para recibir respuestas (n8n -> Web)
  siteUrl: "https://joyeria.a380.com.br"
};

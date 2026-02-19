/**
 * @fileOverview Configuración centralizada de la Boutique.
 * Aquí se gestionan los parámetros de conexión con el ecosistema n8n.
 */

export const appSettings = {
  // Datos de la tienda
  whatsAppNumber: "59895435644",
  chatAgentName: "Maya",
  
  // Integración con n8n (Web -> WhatsApp)
  // URL verificada desde el historial y capturas
  n8nWebhookUrl: "https://n8n.axion380.com.br/webhook/d801ab84-eb6e-4b8c-a04a-03fdc7a126a0",
  
  // URL de la boutique para recibir respuestas (n8n -> Web)
  siteUrl: "https://joyeria.a380.com.br"
};

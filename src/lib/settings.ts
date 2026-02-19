/**
 * @fileOverview Configuración centralizada de la Boutique.
 * Aquí se gestionan los parámetros de conexión con el ecosistema n8n.
 */

export const appSettings = {
  // Datos de la tienda
  whatsAppNumber: "59895435644",
  chatAgentName: "Maya",
  
  // Integración con n8n (Web -> WhatsApp)
  // Esta es la URL donde n8n recibe las consultas de los clientes
  n8nWebhookUrl: "https://n8n.axion380.com.br/webhook/d801ab84-eb6e-4b8c-a04a-03fdc7a126a0",
  
  // URL base de la aplicación para Sockets y Webhooks
  siteUrl: "https://joyeria.a380.com.br"
};

# 💬 Configuración Técnica: Ecosistema de Chat (Web ↔ WhatsApp)

Este documento detalla la arquitectura de comunicación actualizada para el flujo **jaflujodev**.

---

## 1. Flujo: Web Boutique → WhatsApp (Consultas del Cliente)

La web envía un POST al Webhook de n8n.

### Parámetros de Conexión
- **URL de Destino:** `https://n8n.axion380.com.br/webhook/jaflujodev`
- **Método HTTP:** `POST`
- **Seguridad:** Timeout de 30 segundos y User-Agent personalizado.

### Formato del JSON (Payload enviado por la Web)
```json
{
  "event": "web_message",
  "instance": "Maya",
  "data": {
    "text": "Mensaje del cliente",
    "senderName": "Nombre",
    "senderPhone": "099123456",
    "storeNumber": "59895435644"
  },
  "metadata": {
    "platform": "web_boutique",
    "timestamp": "2026-02-18T..."
  }
}
```

---

## 2. Flujo: WhatsApp → Web Boutique (Respuestas del Asesor)

n8n debe responder a la web para que el cliente vea el mensaje en el widget.

### Endpoint de Recepción
- **URL:** `https://joyeria.a380.com.br/api/webhook`
- **Método HTTP:** `POST`

### Formato esperado por la Web
```json
{
  "text": "Respuesta desde WhatsApp",
  "senderName": "Maya",
  "phoneNumber": "59895435644"
}
```

---

## 3. Resolución de Problemas (Troubleshooting)

1. **Error 404 en el Chat**: n8n rechazó la conexión. Verifique que el flujo **jaflujodev** esté en modo **ACTIVE** (Switch ON).
2. **Timeout**: Si Hostinger no llega a n8n en 30 segundos, el mensaje fallará. Revise la latencia del servidor n8n.
3. **Credenciales WooCommerce**: Se mantienen seguras en la bóveda interna (`src/lib/woocommerce.ts`) usando codificación Base64 procesada solo en el servidor.

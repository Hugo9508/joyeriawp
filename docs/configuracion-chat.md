
# 💬 Configuración Técnica: Ecosistema de Chat (Web ↔ WhatsApp)

Este documento detalla la arquitectura de comunicación entre la boutique Joyería Alianza, n8n y la Evolution API para asegurar la trazabilidad y estabilidad del servicio.

---

## 1. Flujo: Web Boutique → WhatsApp (Consultas del Cliente)

Cuando un cliente escribe en el chat de la web, la aplicación ejecuta una **Server Action** optimizada para entornos de hosting compartido.

### Parámetros de Conexión
- **URL de Destino (n8n):** `https://n8n.axion380.com.br/webhook/d801ab84-eb6e-4b8c-a04a-03fdc7a126a0`
- **Método HTTP:** `POST`
- **Seguridad:** Timeout estricto de 15 segundos y encabezado `User-Agent` personalizado para evitar bloqueos de firewall.

### Formato del JSON (Payload enviado por la Web)
La web envía el siguiente objeto estructurado:
```json
{
  "storePhoneNumber": "59895435644",
  "text": "Mensaje del cliente",
  "senderName": "Nombre del Cliente",
  "senderPhone": "099123456",
  "metadata": {
    "platform": "web_boutique",
    "timestamp": "2026-02-18T..."
  }
}
```

---

## 2. Flujo: WhatsApp → Web Boutique (Respuestas del Asesor)

Para que las respuestas enviadas desde WhatsApp aparezcan en el chat web del cliente, n8n debe realizar una petición al Webhook de la boutique.

### Endpoint de Recepción
- **URL:** `https://joyeria.a380.com.br/api/webhook`
- **Método HTTP:** `POST`

### Formato esperado por la Web (Payload enviado por n8n)
n8n debe enviar un JSON con esta estructura mínima para ser procesado correctamente:
```json
{
  "text": "Respuesta del asesor (vendedor)",
  "senderName": "Maya",
  "phoneNumber": "59895435644"
}
```

---

## 3. Detalles de Implementación UI/UX

### A. Identificación del Cliente (Onboarding)
- **Validación de Teléfono:** El sistema solo permite números de Uruguay (9 dígitos, comenzando por `0`).
- **Persistencia:** Los datos se almacenan en `localStorage` (`alianza_user_info`) para que el cliente no tenga que re-identificarse en la misma sesión.

### B. Comunicación en Tiempo Real (Socket.io)
- La interfaz está configurada para escuchar el evento `new_message` a través de un cliente de Socket.io apuntando al dominio principal.
- **Filtro de Seguridad:** El chat solo muestra mensajes entrantes si el remitente coincide con el número configurado de la tienda para evitar "cruces" de mensajes entre usuarios.

### C. Modo de Simulación (Diagnóstico)
- **Ruta:** `/admin/settings`
- Permite probar la recepción de mensajes disparando un `CustomEvent` interno que emula la llegada de un mensaje desde el Webhook de n8n.

---

## 4. Guía de Resolución de Problemas (Troubleshooting)

1.  **Error 404 en el Webhook de n8n:** 
    - Asegúrese de que el flujo de n8n esté **ACTIVO** (Switch ON en la esquina superior derecha de n8n).
    - Si está probando el flujo manualmente (sin activar), n8n requiere usar `/webhook-test/` en lugar de `/webhook/`.
2.  **Mensajes no llegan a n8n:** 
    - Verifique la pestaña de "Ejecuciones" en n8n para ver si hay errores de formato.
    - La boutique mostrará un mensaje de error visual si el servidor de n8n no responde en 15 segundos.
3.  **El chat no muestra respuestas:** 
    - Verifique que n8n esté enviando el POST a la URL correcta (`/api/webhook`).
    - Revise los logs de Hostinger para confirmar que la petición POST está llegando al servidor.

---
*Documentación técnica generada para Joyería Alianza - Axion380.*

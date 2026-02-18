
# 📘 RUNBOOK MAESTRO: Joyeria Alianza (Producción Hostinger)

Este documento es la guía técnica definitiva para el despliegue y la interconexión del ecosistema.

---

## 1. Configuración de n8n (El Cerebro)

Para que el chat funcione en ambos sentidos, configure su flujo de n8n con estos parámetros:

### A. De la Web a WhatsApp (Consultas del cliente)
- **URL del Webhook en n8n:** `https://n8n.axion380.com.br/webhook/d801ab84-eb6e-4b8c-a04a-03fdc7a126a0`
- **Formato enviado por la Web:**
  ```json
  {
    "storePhoneNumber": "59895435644",
    "text": "Mensaje...",
    "senderName": "Nombre Cliente",
    "senderPhone": "099xxxxxx"
  }
  ```

### B. De WhatsApp a la Web (Respuestas del vendedor)
- **Nodo de salida en n8n:** "HTTP Request" (POST).
- **URL de destino:** `https://joyeria.a380.com.br/api/webhook`
- **Cuerpo del mensaje (JSON):**
  ```json
  {
    "text": "Respuesta del vendedor",
    "senderName": "Maya",
    "phoneNumber": "59895435644"
  }
  ```

---

## 2. Despliegue en Hostinger

### Requisitos de Entorno
1. **Versión de Node:** Seleccione **20.x LTS** en el panel de Hostinger.
2. **Dominio:** Asegúrese de que `https://joyeria.a380.com.br` esté apuntando correctamente a la carpeta de la aplicación.

### Variables de Entorno (Opcionales si usa el Vault interno)
Si desea sobrescribir la configuración de WooCommerce sin tocar el código, añada estas variables en el panel de Hostinger:
- `WC_API_URL`: `https://joyeriabd.a380.com.br`
- `WC_CONSUMER_KEY`: `ck_...`
- `WC_CONSUMER_SECRET`: `cs_...`

---

## 3. Verificación de Salud (Health Check)

Una vez desplegado, visite estas URLs para confirmar que el servidor responde:
1. `https://joyeria.a380.com.br/api/health` -> Debe mostrar `{"status":"ok"}`.
2. `https://joyeria.a380.com.br/api/webhook` -> Debe mostrar el mensaje de bienvenida del Webhook.
3. `https://joyeria.a380.com.br/api/products` -> Debe mostrar el listado de joyas de WooCommerce.

---

## 4. Resolución de problemas comunes

- **Error 503:** El proceso de Node se detuvo. Revise los logs en Hostinger; usualmente es por falta de memoria o puerto incorrecto.
- **Error 404 en Webhook:** n8n está disparando a una URL vieja. Asegúrese de que n8n use `/api/webhook` y no `/api/chat/webhook`.
- **Imágenes no cargan:** Verifique que el dominio de WordPress esté autorizado en `next.config.ts`.

---
*Documentación optimizada para Joyeria Alianza - Axion380.*

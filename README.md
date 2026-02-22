
# 💎 Joyeria Alianza (Headless Boutique)

Proyecto de alta joyería basado en **Next.js 15** (Frontend) y **WooCommerce** (Backend).

## 🚀 Requisitos de Despliegue (Hostinger)

> [!IMPORTANT]
> **VERSIÓN DE NODE:** Debe usar exclusivamente **Node 20.x LTS**. El uso de Node 22 o superior causará fallos en el despliegue debido a incompatibilidades con el entorno de Hostinger.

### Solución al error EBADENGINE
Si ves el error `npm warn EBADENGINE`, significa que Hostinger o tu terminal están usando Node 22. 
**Para solucionarlo:**
1. Ve al hPanel de Hostinger.
2. Navega a `Sitios Web` -> `Administrar` -> `Aplicación Node.js`.
3. Busca la opción **Versión de Node.js** y selecciona **20.x**.
4. Guarda los cambios y haz clic en **Reinstalar dependencias**.

### Variables de Entorno Requeridas
Configure estas variables en el panel de Hostinger (Node.js App -> Environment Variables):

| Variable | Descripción | Valor Ejemplo |
| :--- | :--- | :--- |
| `WC_API_URL` | URL de tu WordPress | `https://joyeriabd.a380.com.br` |
| `WC_CONSUMER_KEY` | Key de WooCommerce | `ck_...` |
| `WC_CONSUMER_SECRET` | Secret de WooCommerce | `cs_...` |
| `NEXT_PUBLIC_SITE_URL` | URL de la tienda | `https://joyeria.a380.com.br` |
| `ADMIN_PASSWORD` | Clave del panel admin | `tu-clave-segura` |
| `DIFY_API_KEY` | API Key de tu app Dify (Alma) | `app-XXXXXXXXXXXX` |
| `DIFY_BASE_URL` | URL base de la API de Dify | `https://api.dify.ai/v1` |
| `N8N_EVENT_WEBHOOK_URL` | Webhook n8n para eventos Dify (handoff, CRM) | `https://n8n.axion380.com.br/webhook/dify-events` |

## 💬 Chat Web con IA (Alma — Dify)

El chat web del sitio se conecta **directamente** con la API de Dify (sin pasar por n8n):

```
Chat Widget → POST /api/dify-chat → Dify API (/v1/chat-messages)
                                       ↓ (si detecta handoff)
                                     n8n webhook (notifica vendedor por WhatsApp)
```

- **Agente:** Alma (asesora de ventas de Joyería Alianza)
- **Endpoint:** `POST /api/dify-chat` — recibe `{ query, user, conversationId }`
- **Handoff automático:** cuando Alma detecta señales de compra, notifica a n8n vía `N8N_EVENT_WEBHOOK_URL`
- **Config Dify:** las 3 variables `DIFY_*` se configuran en Hostinger (Node.js App → Environment Variables)

## 🛠️ Comandos Locales
- `npm install`: Instalar dependencias.
- `npm run dev`: Iniciar modo desarrollo.
- `npm run build`: Generar versión de producción.

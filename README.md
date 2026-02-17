
# 💎 AurumLuz Digital (Headless Boutique)

Proyecto de alta joyería basado en **Next.js 15** (Frontend) y **WooCommerce** (Backend).

## 🚀 Requisitos de Despliegue (Hostinger)

> [!IMPORTANT]
> **VERSIÓN DE NODE:** Debe usar exclusivamente **Node 20.x LTS**. El uso de Node 22 o superior causará fallos en el despliegue debido a incompatibilidades con el entorno de Hostinger.

### Variables de Entorno Requeridas
Configure estas variables en el panel de Hostinger (Node.js App -> Environment Variables):

| Variable | Descripción | Valor Ejemplo |
| :--- | :--- | :--- |
| `WC_API_URL` | URL de tu WordPress | `https://joyeriabd.a380.com.br` |
| `WC_CONSUMER_KEY` | Key de WooCommerce | `ck_...` |
| `WC_CONSUMER_SECRET` | Secret de WooCommerce | `cs_...` |
| `NEXT_PUBLIC_SITE_URL` | URL de la tienda | `https://joyeria.a380.com.br` |
| `ADMIN_PASSWORD` | Clave del panel admin | `tu-clave-segura` |

## 🛠️ Comandos Locales
- `npm install`: Instalar dependencias.
- `npm run dev`: Iniciar modo desarrollo.
- `npm run build`: Generar versión de producción.

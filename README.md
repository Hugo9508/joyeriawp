# Aurum Luz - Joyería Digital (Headless WooCommerce)

Este proyecto es el frontend profesional de **Aurum Luz**, conectado vía REST API a un backend de WooCommerce en Hostinger.

## Configuración de Despliegue (Hostinger Node.js App)

1. **En Hostinger hPanel:**
   - Crea una **Node.js Web App**.
   - Conecta este repositorio `Hugo9508/joyeriawp`.
   - Configura las **Variables de Entorno** en el panel de Hostinger:
     - `WC_API_URL`: `https://joyeriabd.a380.com.br`
     - `WC_CONSUMER_KEY`: Tu Key de WordPress.
     - `WC_CONSUMER_SECRET`: Tu Secret de WordPress.
     - `NEXT_PUBLIC_SITE_URL`: `https://joyeria.a380.com.br`
   - Ejecuta `npm run build` y luego inicia la aplicación.

## Estructura del Proyecto
- **Next.js 15 (App Router)**
- **Tailwind CSS + ShadCN UI**
- **WooCommerce REST API Integration**

Desarrollado con ❤️ para Aurum Luz.
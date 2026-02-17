# Aurum Luz - Joyería Digital (Headless WooCommerce)

Este proyecto es el frontend profesional de **Aurum Luz**, conectado vía REST API a un backend de WooCommerce en Hostinger.

## Configuración de Despliegue (Hostinger Node.js App)

Para que la tienda funcione correctamente, debes configurar las siguientes **Variables de Entorno** en el panel de Hostinger (sección "Variables de entorno"):

| Nombre | Valor sugerido / Ejemplo |
| :--- | :--- |
| `WC_API_URL` | `https://joyeriabd.a380.com.br` |
| `WC_CONSUMER_KEY` | (Tu clave ck_ generada en WordPress) |
| `WC_CONSUMER_SECRET` | (Tu clave cs_ generada en WordPress) |
| `NEXT_PUBLIC_SITE_URL` | `https://joyeria.a380.com.br` |

## Instrucciones de Despliegue en Hostinger

1. **Preset del Framework:** Selecciona `Next.js`.
2. **Versión de Node:** Selecciona `20.x` o `22.x`.
3. **Comando de Compilación (Build):** `npm run build`
4. **Comando de Inicio (Start):** `npm run start`

## Estructura del Proyecto
- **Next.js 15 (App Router)**: Máximo rendimiento y SEO.
- **Headless Architecture**: Los datos viven en WordPress, la UI en Next.js.
- **WhatsApp Integration**: Consultas directas con SKU y link de producto.

Desarrollado con ❤️ para Aurum Luz por Axion380.

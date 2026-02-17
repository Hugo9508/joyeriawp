
# 📘 RUNBOOK MAESTRO: Joyeria Alianza (Headless WooCommerce)

Este documento es la guía técnica definitiva para el despliegue, mantenimiento y escalabilidad del ecosistema **Joyeria Alianza**.

---

## 1. Arquitectura del Sistema
El proyecto utiliza un patrón **BFF (Backend for Frontend)** donde Next.js actúa como proxy seguro para WooCommerce.

### Diagrama de Flujo
```text
[ Usuario / Browser ] 
        ↕ (HTTPS)
[ Next.js Frontend (Hostinger Node App) ] 
    • Server Components: Renderizado directo (SEO/SSR)
    • Route Handlers (/api/*): Proxy Seguro (BFF) + Cache L1
        ↕ (HTTPS + Basic Auth - Server to Server)
[ WooCommerce REST API (WordPress Subdomain) ]
    • Gestión de catálogo, stock e imágenes.
```

### Componentes y Responsabilidades
| Componente | Responsabilidad | Secretos Manejados |
| :--- | :--- | :--- |
| **Frontend (Next.js)** | Interfaz de usuario, SEO, PRERENDERING. | Ninguno en el cliente. |
| **BFF (/api/*)** | Proxy seguro, cache in-memory, ocultar llaves. | `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`. |
| **Backend (WP/WC)** | Base de datos de productos y gestión. | Llaves de la API REST. |

---

## 2. Inventario de Endpoints (BFF)
Estos puntos de acceso internos garantizan que las llaves nunca salgan del servidor:
- `GET /api/products`: Listado de productos (soporta `category`, `search`, `page`).
- `GET /api/categories`: Listado de categorías activas (con cache de larga duración).
- `GET /api/products/[id]`: Detalle técnico de una pieza.

---

## 3. Preparación del Despliegue en Hostinger

### REGLA DE ORO: Versión de Node
- **Versión Requerida:** `Node 20.x LTS`.
- **Prohibido:** No usar Node 22 (causa error `EBADENGINE`).
- **Configuración:** En el hPanel de Hostinger, ve a `Aplicación Node.js` -> `Versión de Node` y selecciona `20.x`.

### Variables de Entorno (Environment Variables)
Configura estas variables en el panel de Hostinger para que el servidor las reconozca:
- `WC_API_URL`: `https://joyeriabd.a380.com.br` (El backend de WordPress).
- `WC_CONSUMER_KEY`: `ck_...` (Tu Consumer Key).
- `WC_CONSUMER_SECRET`: `cs_...` (Tu Consumer Secret).
- `NEXT_PUBLIC_SITE_URL`: `https://joyeria.a380.com.br` (Tu dominio público).

---

## 4. Validación Post-Deploy
1. **Verificar SSL:** Ambas URLs deben cargar con `https`.
2. **Prueba de API:** Accede a `https://joyeria.a380.com.br/api/products`. Debes ver un JSON.
3. **Prueba SEO:** `Ver código fuente` en el inicio; los nombres de productos deben aparecer en el HTML inicial.
4. **Logs:** Si ves un error 503, revisa la sección "Logs" en el panel de Node.js; suele ser por falta de variables o puerto incorrecto.

---

## 5. Cache y Performance
- **Single-Flight:** Implementado para evitar que múltiples peticiones idénticas saturen el servidor.
- **Cache L1:** Los productos se guardan en la RAM del servidor por 2 minutos.
- **LiteSpeed:** En WordPress, excluye `/wp-json/*` de la cache para evitar conflictos con el BFF.

---

## 6. Errores Comunes
- **503 Service Unavailable:** El proceso Node se ha detenido o está en bucle. Revisa que `WC_API_URL` no apunte al mismo frontend.
- **401 Unauthorized:** Las llaves `ck_` o `cs_` son incorrectas.
- **Imágenes rotas:** Verifica que `next.config.ts` tenga el dominio del backend autorizado.

---
*Documentación consolidada por Axion380 para Joyeria Alianza.*

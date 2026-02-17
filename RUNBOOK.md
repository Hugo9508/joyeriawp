
# 📘 RUNBOOK MAESTRO: Joyeria Alianza (Headless WooCommerce)

Este documento es la guía definitiva para el despliegue, mantenimiento y escalabilidad del ecosistema **Joyeria Alianza**.

---

## 1. Arquitectura del Sistema
El proyecto utiliza un patrón **BFF (Backend for Frontend)** donde Next.js actúa como proxy seguro para WooCommerce.

### Diagrama de Flujo
```text
[ Usuario / Browser ] 
        ↕ (HTTPS)
[ Next.js Frontend (Hostinger Node App) ] 
    • Server Components: Renderizado directo (SEO)
    • Route Handlers (/api/*): Proxy Seguro (BFF)
        ↕ (HTTPS + Basic Auth - Server to Server)
[ WooCommerce REST API (WordPress Subdomain) ]
```

### Componentes y Responsabilidades
| Componente | Responsabilidad | Secretos Manejados |
| :--- | :--- | :--- |
| **Frontend (Next.js)** | Interfaz de usuario, SEO, PRERENDERING. | Ninguno en el cliente. |
| **BFF (/api/*)** | Proxy seguro, formateo de datos, ocultar llaves. | `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`. |
| **Backend (WP/WC)** | Base de datos de productos, pedidos y gestión. | Llaves de la API REST. |

---

## 2. Inventario de Endpoints (BFF)
Estos son los puntos de acceso internos que utiliza la aplicación:

- `GET /api/products`: Listado de productos (soporta `category`, `search`, `page`, `per_page`).
- `GET /api/products/[id]`: Detalle de una pieza específica.
- `GET /api/categories`: Listado de categorías activas en WooCommerce.
- `GET /api/admin/dashboard`: Métricas de negocio (solo admin).
- `POST /api/categories`: Creación de nuevas categorías (solo admin).

---

## 3. Preparación del Despliegue en Hostinger

### REGLA DE ORO: Versión de Node
- **Versión Requerida:** `Node 20.x LTS`.
- **Prohibido:** No usar Node 22 o superior (causa error `EBADENGINE`).
- **Cómo corregir:** En el hPanel de Hostinger, ve a `Aplicación Node.js` -> `Versión de Node` y selecciona `20.x`. Luego haz clic en "Reinstalar dependencias".

### Variables de Entorno (Environment Variables)
Configura estas variables en el panel de Hostinger:
- `WC_API_URL`: `https://joyeriabd.a380.com.br`
- `WC_CONSUMER_KEY`: `ck_...` (Llave de WooCommerce)
- `WC_CONSUMER_SECRET`: `cs_...` (Secreto de WooCommerce)
- `NEXT_PUBLIC_SITE_URL`: `https://joyeria.a380.com.br`
- `ADMIN_PASSWORD`: Clave para acceder a `/admin`.

---

## 4. Validación Post-Deploy
1. **Verificar SSL:** Ambas URLs deben cargar con `https`.
2. **Prueba de API:** Accede a `https://joyeria.a380.com.br/api/products`. Debes ver un JSON con los productos.
3. **Prueba SEO:** Haz clic derecho en la página de inicio -> "Ver código fuente". Los nombres de los productos deben aparecer en el HTML inicial.
4. **Logs:** Si algo falla, revisa la sección "Logs" en el panel de Node.js de Hostinger.

---

## 5. Seguridad y Cache
- **LiteSpeed Cache:** En WordPress, excluye de la cache las rutas `/wp-json/*` para evitar datos obsoletos.
- **Seguridad:** Las llaves `ck_` y `cs_` nunca deben subirse al repositorio de GitHub. Solo deben existir en el panel de Hostinger.
- **Firewall:** Asegúrate de que el servidor de WordPress permita peticiones desde la IP del servidor de Next.js.

---
*Documentación técnica consolidada para Joyeria Alianza.*

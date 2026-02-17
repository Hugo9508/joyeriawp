
# 📘 RUNBOOK MAESTRO: Joyeria Alianza (Headless WooCommerce)

Este documento es la guía definitiva para el despliegue y mantenimiento del ecosistema **Joyeria Alianza**.

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

---

## 2. Preparación del Despliegue

### REGLA DE ORO: Versión de Node
- **Innegociable:** Debe usar **Node 20.x LTS**.
- **Prohibido:** No usar Node 22.x ni versiones superiores.
- **Por qué:** Hostinger Node Apps tiene mejor estabilidad y soporte para dependencias críticas en la versión 20.x.

### Corrección de Advertencias (Warnings)
Las advertencias `rimraf`, `inflight` y `glob` son normales en ecosistemas grandes de Node. Se han mitigado actualizando las dependencias raíz, pero si persisten en el build, no afectan la funcionalidad. Lo importante es que el **Build Trace** termine correctamente.

---

## 3. Despliegue en Hostinger (Paso a Paso)

### A. Frontend (Node.js App)
1. En hPanel: `Sitios Web -> Aplicación Node.js`.
2. Conectar repositorio de GitHub (rama `main`).
3. **Versión de Node: Seleccionar 20.x en el desplegable.**
4. **Variables de Entorno (CRÍTICO):**
   - `WC_API_URL`: `https://joyeriabd.a380.com.br`
   - `WC_CONSUMER_KEY`: `ck_...`
   - `WC_CONSUMER_SECRET`: `cs_...`
   - `NEXT_PUBLIC_SITE_URL`: `https://joyeria.a380.com.br`
   - `ADMIN_PASSWORD`: Tu clave para `/admin`.
5. Ejecutar: `Instalar dependencias` -> `Build` -> `Iniciar`.

---

## 4. Validación Post-Deploy
- **Salud del API:** Acceder a `https://joyeria.a380.com.br/api/products`.
- **Prueba SEO:** `Ver código fuente` en el navegador. Las imágenes deben tener el atributo `unoptimized`.

---
*Desarrollado con precisión por IDX para Joyeria Alianza.*

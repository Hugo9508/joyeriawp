
# 📘 RUNBOOK MAESTRO: AurumLuz Digital (Headless WooCommerce)

Este documento es la guía definitiva para el despliegue y mantenimiento del ecosistema **AurumLuz**.

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
- **Prohibido:** No usar Node 22.x ni versiones superiores, ya que generan errores de pre-renderizado y mismatch de motores.

### Checklist de Seguridad
- Las llaves `ck_` y `cs_` NUNCA deben estar en el código.
- El cliente solo habla con `/api/*`. El servidor Next.js es el único que conoce las llaves.

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
- **Salud del API:** Acceder a `https://joyeria.a380.com.br/api/products`. Debe retornar JSON.
- **Prueba SEO:** `Clic Derecho -> Ver código fuente`. El contenido debe estar en el HTML.

---
*Desarrollado con precisión por IDX para AurumLuz.*

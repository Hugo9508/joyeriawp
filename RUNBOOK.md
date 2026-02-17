
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
    • Gestión de catálogo, stock e imágenes.
```

### Límites de Seguridad
- **Innegociable:** Las llaves `ck_` y `cs_` NUNCA deben estar en el código ni ser accesibles desde el navegador.
- **Flujo de Datos:** El cliente solo habla con `/api/*`. El servidor Next.js es el único que conoce las llaves de WooCommerce.

---

## 2. Preparación del Repositorio
Antes de subir a GitHub:
- **.gitignore:** Asegurar que `.env`, `.next/` y `node_modules/` estén excluidos.
- **Motores:** `package.json` configurado con `engines: { "node": ">=20.0.0" }`.
- **Scripts:** `start` debe ser `next start -p ${PORT:-3000}` para compatibilidad con Hostinger.

---

## 3. Despliegue en Hostinger (Paso a Paso)

### A. Backend (WordPress + WooCommerce)
1. Crear subdominio: `joyeriabd.a380.com.br`.
2. Instalar WordPress + WooCommerce.
3. Generar Llaves API: `WooCommerce -> Ajustes -> Avanzado -> REST API`.
4. Permisos: **Lectura/Escritura**. Guardar `ck_` y `cs_` inmediatamente.

### B. Frontend (Node.js App)
1. En hPanel: `Sitios Web -> Aplicación Node.js`.
2. Conectar repositorio de GitHub (rama `main`).
3. Versión de Node: **20.x**.
4. **Variables de Entorno (CRÍTICO):**
   - `WC_API_URL`: `https://joyeriabd.a380.com.br`
   - `WC_CONSUMER_KEY`: `ck_...`
   - `WC_CONSUMER_SECRET`: `cs_...`
   - `NEXT_PUBLIC_SITE_URL`: `https://joyeria.a380.com.br`
5. Ejecutar: `Instalar dependencias` -> `Build` -> `Iniciar`.

---

## 4. Validación Post-Deploy
- **Salud del API:** Acceder a `https://joyeria.a380.com.br/api/products`. Debe retornar un JSON con productos.
- **Prueba SEO:** `Clic Derecho -> Ver código fuente`. El contenido de los productos debe estar presente en el HTML inicial.
- **Logs:** En Hostinger, revisar `Logs de ejecución` para confirmar que no hay errores 401 (llaves mal) o 404 (URL mal).

---

## 5. Caché y Performance
- **Next.js:** Usamos `revalidate` en los fetches (ISR) para equilibrar velocidad y datos frescos.
- **LiteSpeed Cache (WordPress):** 
  - Excluir `/wp-json/*` de la caché para evitar que las llamadas a la API entreguen datos viejos o cabeceras incorrectas.
  - No minificar JS de WordPress si causa errores en el admin de WooCommerce.

---

## 6. Seguridad Avanzada
- **WAF:** Si usas Wordfence en WordPress, whitelistear la IP del servidor de Next.js.
- **Headers:** El servidor Next.js ya envía cabeceras de seguridad básicas. Evitar `CORS` configurando correctamente el `NEXT_PUBLIC_SITE_URL`.

---

## 7. Errores Comunes (Troubleshooting)
- **403 Forbidden:** Generalmente bloqueo de firewall en WordPress o `ck_`/`cs_` con espacios.
- **Error en /collections:** Verificar que el componente esté envuelto en `<Suspense>`.
- **Mismatch de Hidratación:** Evitar usar `Math.random()` o `new Date()` fuera de `useEffect`.
- **Deprecations (rimraf/glob):** Ignorar en el build; son advertencias de sub-dependencias que no afectan la estabilidad.

---

## 8. Cambio de Dominio Futuro
1. **Hostinger:** `Cambiar dominio` en la configuración de la web.
2. **Next.js:** Actualizar `NEXT_PUBLIC_SITE_URL` en variables de entorno.
3. **WooCommerce:** Si el backend también cambia, actualizar `WC_API_URL` y regenerar llaves API.
4. **DNS:** La propagación puede tardar hasta 24h. Asegurar SSL activo en el nuevo dominio.

---
*Desarrollado con precisión por IDX para AurumLuz.*

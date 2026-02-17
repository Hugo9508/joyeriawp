
# 💎 Aurum Luz - Joyería Digital (Headless)

Este es el panel de control y tienda profesional de **Aurum Luz**, conectada a tu inventario de WooCommerce en Hostinger.

## 🚀 Acceso al Panel de Control (Admin)

Para gestionar tu tienda, usa estos datos:

| Detalle | Información |
| :--- | :--- |
| **Link de Acceso** | [https://joyeria.a380.com.br/admin](https://joyeria.a380.com.br/admin) |
| **Usuario** | (No requiere, solo contraseña) |
| **Contraseña Maestra** | La que configuraste en Hostinger como `ADMIN_PASSWORD` (Por defecto: `admin123`) |

---

## ⚙️ Configuración en Hostinger (Variables de Entorno)

Para que la tienda funcione, debes entrar al panel de Hostinger (Sección "Aplicación Node.js" -> "Variables de entorno") y asegurarte de tener estos 5 valores:

1. `WC_API_URL`: `https://joyeriabd.a380.com.br`
2. `WC_CONSUMER_KEY`: (Tu llave secreta de WordPress que empieza con `ck_`)
3. `WC_CONSUMER_SECRET`: (Tu llave secreta de WordPress que empieza con `cs_`)
4. `NEXT_PUBLIC_SITE_URL`: `https://joyeria.a380.com.br`
5. `ADMIN_PASSWORD`: (La contraseña que tú elijas para entrar al panel `/admin`)

---

## 🛠️ ¿Qué puedes hacer en el Panel Admin?
- **Dashboard:** Ver el valor total en dólares de todo tu inventario.
- **Inventario:** Ver qué piezas están agotadas o bajo pedido.
- **Categorías:** Crear nuevas secciones (ej. "Colección Verano") sin entrar a WordPress.
- **WhatsApp:** Cambiar el número de contacto de toda la tienda en un solo lugar.

---
Desarrollado con ❤️ para Aurum Luz.

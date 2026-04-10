# Histórico de Cambios - 9 de Abril de 2026

En esta sesión de trabajo se implementaron mejoras sustanciales en la visualización de productos destacados y la página de colecciones de la tienda Joyería Alianza.

## 1. Documentación de Productos Destacados
- Se documentó la lógica sobre cómo controlar las "Piezas Destacadas" desde el panel de WordPress (WooCommerce).
- Se creó el archivo `docs/logica-control-productos-destacados.md` explicando detalladamente el uso de la visibilidad "Destacado" (la estrella ⭐ en WooCommerce) y cómo impacta en el frontend de Next.js.

## 2. Renovación de "Piezas Destacadas" en la Home (`src/app/page.tsx`)
- Se reemplazó la lógica dinámica que obtenía productos destacados automáticamente de WooCommerce por una estructura predefinida con **tres videos locales**.
- Se copiaron tres videos de productos desde la carpeta `imag` hacia `public/videos/` para poder ser servidos correctamente por Next.js:
  1. `luz-eterna.mp4`
  2. `coleccion-aura.mp4`
  3. `alianzas.mp4`
- Se configuró la grilla de destacados en este orden:
  - **Izquierda:** Colección Luz Eterna (USD 820)
  - **Centro elevado:** Colección Aurora (USD 850)
  - **Derecha:** Colección Alianzas (USD 900)
- Se aplicó un estilo `rounded-2xl` (bordes redondeados y suaves) a los contenedores de los videos.
- Los videos se reproducen automáticamente (autoplay, muted, loop).
- Cada tarjeta de colección en la home ahora cuenta con dos botones funcionales e independientes:
  - **Consultar:** Abre WhatsApp con un mensaje preconfigurado preguntando por la colección específica. Estilo de borde primario (dorado).
  - **Comprar:** Botón con fondo primario (dorado) que redirige directamente a la página general de `/collections`.

## 3. Mejoras en la Página de Colecciones (`src/app/collections/page.tsx`)
- **Títulos Dinámicos:** Se ajustó la lógica del título principal de la página. 
  - Si no hay un filtro activo, el título muestra de forma elegante: **Colección *JA***.
  - Al seleccionar un filtro en la barra lateral, el título se adapta para mostrar el nombre real de la colección seleccionada (ej. **Colección *Luz Eterna***, en lugar del slug o un texto estático).
- **Botones Divididos:** Se rediseñó el área de acción debajo de cada producto en la grilla de colecciones.
  - Anteriormente, un único botón ancho decía "Consultar".
  - Se dividió el espacio en dos botones paralelos:
    - **Consultar:** Botón de contorno que mantiene la funcionalidad del widget de WhatsApp.
    - **Comprar:** Botón de fondo sólido dorado que redirige a la página individual del producto (`/products/[id]`).

## 4. Limpieza de Caché y Solución de Errores
- Durante el proceso de cambios en el enrutamiento y la eliminación de módulos dinámicos antiguos, surgieron conflictos de caché en el build del servidor de desarrollo (`.next/`).
- Se ejecutó un reinicio profundo del servidor y limpieza forzada de las cachés ocultas (`.next` y `node_modules/.cache`), recuperando y estabilizando el entorno local en `localhost:3003`.

---
*Fin del reporte.*

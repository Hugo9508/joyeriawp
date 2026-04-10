# Lógica de Control de Productos y Destacados

Este documento explica cómo funciona la integración entre el CMS (WordPress/WooCommerce) y el frontend (Next.js) para el control de los productos que se muestran en áreas específicas del sitio, como la sección de "Piezas Destacadas" en la página principal.

## 1. Funcionamiento del Frontend (Next.js)

La aplicación web utiliza una arquitectura Headless, lo que significa que el frontend (Next.js) está separado del backend (WordPress). 

En la página de inicio (`src/app/page.tsx`), la sección de **"Piezas Destacadas"** está programada para obtener automáticamente los productos que han sido marcados como "destacados" (featured) en WooCommerce.

El código clave que realiza esta petición es:

```typescript
const allProducts = await getProducts({ featured: true, per_page: 3 });
```

### ¿Qué hace este código?
- `featured: true`: Le indica a la API que solo devuelva productos que tengan la marca de destacado.
- `per_page: 3`: Limita la respuesta a un máximo de 3 productos. 

Por lo tanto, la página de inicio siempre mostrará exactamente **3 productos destacados**.

---

## 2. Cómo controlar los Destacados desde WordPress (WooCommerce)

Dado que el frontend consulta dinámicamente a la API, **no es necesario modificar el código** para cambiar qué productos aparecen en la sección de "Piezas Destacadas". Todo se administra visualmente desde el panel de WordPress.

### Pasos para destacar un producto:

1. **Acceder al Panel de Control:** Ingresa al panel de administración de tu WordPress (`/wp-admin`).
2. **Ir a Productos:** En el menú lateral izquierdo, haz clic en **WooCommerce → Productos** (o simplemente **Productos → Todos los productos**).
3. **Identificar la Columna de Estrella (⭐):** En la lista de productos, verás una columna con un icono de estrella.
4. **Marcar como Destacado:**
   - Haz clic en la **estrella vacía (☆)** en la fila del producto que deseas destacar.
   - La estrella se volverá **rellena/dorada (⭐)**, lo que significa que el producto ahora es un "Producto Destacado" (Featured).
   - *Alternativa:* Al editar un producto de forma individual, en el panel lateral derecho bajo "Publicar" o en la sección central de opciones, puedes marcar la casilla o estado correspondiente a "Producto destacado".

### Pasos para quitar un producto de los destacados:

1. En la lista de productos, busca el producto que está actualmente destacado (tiene la estrella rellena ⭐).
2. Haz clic en la **estrella rellena (⭐)**.
3. Se convertirá en una estrella vacía (☆), y el producto dejará de aparecer en la sección especial de la página de inicio.

---

## 3. Consideraciones Importantes

- **Límite de 3:** Como la programación actual solicita un máximo de 3 productos (`per_page: 3`), **se recomienda tener no más de 3 productos marcados con la estrella activada al mismo tiempo**.
- **Si hay más de 3 marcados:** El sistema mediante la API de WooCommerce generalmente devolverá los 3 más recientes o según el orden por defecto establecido en tu tienda. Para tener control total, asegúrate de mantener solo 3 destacados activos.
- **Si hay menos de 3 marcados:** La sección mostrará 1, 2 o ningún producto, dependiendo de cuántos tengas activos con la estrella. Si hay 0, el código del frontend está preparado para mostrar un mensaje temporal ("Próximamente nuevas piezas en nuestro catálogo.").
- **Actualización en el Sitio:** Una vez que cambies la estrella en WordPress, el frontend, gracias a su configuración, consultará y mostrará los nuevos productos en la página principal (la caché del catálogo está configurada en `no-store` en la ruta `/api/products` para datos en vivo).

# Aurum Luz - Joyería Digital (Headless WooCommerce)

Este proyecto es el frontend profesional de **Aurum Luz**, conectado vía REST API a un backend de WooCommerce en Hostinger.

## Solución de errores de Git y Despliegue

Si ves errores de "repository rule violations" o "remote rejected", es porque GitHub detecta el token en el historial de commits. Sigue estos pasos exactos para limpiar el historial y subir el código:

1. **Limpiar el historial de Git actual (Recomendado):**
   ```bash
   # 1. Eliminar la configuración actual de git
   rm -rf .git
   
   # 2. Reiniciar el repositorio
   git init
   
   # 3. Añadir los archivos (asegúrate de que joyeriaalianza3 no tenga su propio .git)
   rm -rf joyeriaalianza3/.git
   git add .
   
   # 4. Crear el commit limpio
   git commit -m "feat: Initial clean headless deployment"
   
   # 5. Configurar el remoto SIN el token en la URL
   git remote add origin https://github.com/Hugo9508/joyeriawp.git
   
   # 6. Subir usando el token como contraseña cuando se solicite
   # Al ejecutar este comando, pon tu usuario Hugo9508 y cuando pida password, PEGA EL TOKEN.
   git push -u origin main --force
   ```

## Configuración en Hostinger (Node.js App)

1. **En Hostinger hPanel:**
   - Crea una **Node.js Web App**.
   - Conecta este repositorio `Hugo9508/joyeriawp`.
   - Configura las **Variables de Entorno**:
     - `WC_API_URL`: `https://joyeriabd.a380.com.br`
     - `WC_CONSUMER_KEY`: Tu Key de WordPress.
     - `WC_CONSUMER_SECRET`: Tu Secret de WordPress.
     - `NEXT_PUBLIC_SITE_URL`: `https://joyeria.a380.com.br`
   - Ejecuta `npm run build` y luego inicia la aplicación.

Desarrollado con ❤️ para Aurum Luz.

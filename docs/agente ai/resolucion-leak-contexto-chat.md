# Resolución: Filtración de Contexto de Producto en Chat Directo

## Problema Identificado
Al utilizar el ChatWidget de Alma, se detectó una inconsistencia en la lógica de conversación de Dify:

1.  **Hito A**: El usuario hace clic en el botón **"Consultar"** de un producto (ej. *Anamnesis*). Esto envía a Dify un mensaje estructurado con metadatos (Nombre, Precio, SKU, URL).
2.  **Hito B**: El usuario cierra el chat o navega por el sitio.
3.  **Hito C**: El usuario abre el chat directamente desde la burbuja flotante y escribe un saludo genérico (ej. *"hola"*).
4.  **Falla**: Alma responde haciendo referencia al producto del **Hito A**, citando precios o detalles técnicos que el usuario no solicitó en esa nueva interacción.

## Causa Raíz
La causa era la persistencia del `conversation_id` de Dify:
- El `conversation_id` se almacenaba en el `sessionStorage` para mantener la continuidad si el usuario refrescaba la página.
- Sin embargo, no había una distinción clara entre **"Chat de Consulta Específica"** y **"Chat de Soporte General"**. Al abrir el chat directamente, se reutilizaba el mismo ID, arrastrando todo el historial previo con el producto.

## Solución Aplicada

Se implementó una estrategia de **Aislamiento de Sesión** y **Sincronización de UI**:

### 1. Aislamiento de Sesión (Logic Fix)
En `src/components/chat-widget.tsx`, se modificó el manejador del evento de apertura directa (`handleOpenOnly`):
- Se fuerza el reseteo del `conversation_id` local y el `conversationIdRef`.
- Se elimina explícitamente el `dify_conversation_id` del `sessionStorage`.
- Se limpia el estado de mensajes, restaurando solo el saludo de bienvenida inicial.

Esto garantiza que al abrir el chat por la burbuja, Dify reciba una consulta sin "ruido" de productos anteriores.

### 2. Sincronización de UI (Expectativas del Usuario)
Para evitar "contradicciones" visuales y gestionar mejor las expectativas del cliente:
- **`collections/page.tsx`**: Se eliminó el ícono de WhatsApp del botón "Consultar".
- **`products/[id]/page.tsx`**: Se cambió el texto de "Consultar por WhatsApp" a solo **"Consultar"** y se ocultó el ícono.
- **Razón**: Al usar íconos de WhatsApp, el usuario espera una redirección externa inmediata. Al quitarlos, se entiende que la consulta es un proceso interno del sitio (gestionado por Alma).

### 3. Preservación del Contexto Intencional
Se mantuvo la lógica en `src/lib/whatsapp.ts` para que, cuando el usuario **sí desea consultar específicamente**, se sigan enviando los metadatos completos. De esta forma, el asesor humano que reciba el handoff tendrá el SKU y el precio exacto.

---
**Fecha Técnica**: 22 de Febrero de 2026
**Estado**: Implementado y Verificado.

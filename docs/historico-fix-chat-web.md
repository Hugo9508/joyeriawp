# Histórico de Fix — Chat Web con n8n + Dify

**Fecha:** 2026-02-19  
**Repositorio:** [Hugo9508/joyeriawp](https://github.com/Hugo9508/joyeriawp)  
**Commits involucrados:** `b10e5c8`, `45103af`

---

## Síntoma

El chat web mostraba "Enviando consulta..." indefinidamente y nunca aparecía la respuesta de la IA (Dify/Maya). En la consola del browser se veía:

```
Uncaught (in promise) UnrecognizedActionError:
Server Action "406d375a2cfc0703673c3470fbae5fc192facfa0ee" was not found on the server.
```

---

## Causas Raíz (3 problemas encadenados)

### 1. Doble `respondToWebhook` en n8n
El flujo n8n tenía **dos nodos** que respondían el webhook en paralelo:
- `✅ Responder: Notificado Vendedor` → respondía inmediatamente con `{received: true}`
- `✅ Responder Dify` → llegaba tarde, el cliente ya había recibido la respuesta vacía

Como HTTP solo acepta **una** respuesta por request, la del vendedor ganaba siempre y la respuesta de Dify se descartaba.

### 2. `messageStore` volátil en entorno serverless (Hostinger)
El archivo `src/lib/messageStore.ts` guardaba mensajes en un `Map` en memoria RAM. En Hostinger (serverless/containers), cada instancia tiene su propia RAM — el browser que hacía polling de `/api/messages` no tenía garantía de conectarse a la misma instancia que guardó el mensaje. **Los mensajes se perdían entre instancias.**

### 3. `UnrecognizedActionError` — Server Action con hash volátil
El frontend usaba un **Next.js Server Action** (`'use server'`) en `src/app/actions/chat.ts`. Next.js genera un **hash único** de cada Server Action en tiempo de build. Cada deploy en Hostinger genera hashes nuevos. Si el browser tenía una página cacheada con el hash viejo, el server (con el hash nuevo) lo rechazaba con `UnrecognizedActionError` → chat trabado.

---

## Soluciones Aplicadas

### Fix 1 — Nuevo flujo n8n v4 (commit `b10e5c8`)
**Archivo:** `docs/n8n-flujo-chat-v4.json`

- **Un solo `respondToWebhook`** al final de la rama Dify
- La notificación al vendedor (`Notificar Vendedor`) pasa a ser **fire-and-forget** — se ejecuta en paralelo pero NO bloquea ni responde el webhook
- El flujo ahora retorna directamente `{ success, response, conversation_id }` al cliente en la misma request HTTP

```
Webhook → Preparar Mensaje → ¿Es Chat?
  → [Sí] → Dify Luna → Procesar Stream → RespondToWebhook ← (única respuesta)
         → Notificar Vendedor (fire & forget, sin respondToWebhook)
  → [No] → WhatsApp → Chat Web → RespondToWebhook
```

### Fix 2 — `actions/chat.ts` actualizado (commit `b10e5c8`)
**Archivo:** `src/app/actions/chat.ts`

- Extrae `response` y `conversation_id` del body de n8n directamente
- El `conversationId` se envía a n8n en cada request para que Dify mantenga el contexto de conversación
- Timeout de 40 segundos para acomodar el tiempo de respuesta de Dify

### Fix 3 — `chat-widget.tsx` actualizado (commit `b10e5c8`)
**Archivo:** `src/components/chat-widget.tsx`

- Muestra la respuesta del bot **directamente** desde el return del action (sin polling de `/api/messages`)
- Guarda `conversation_id` en `sessionStorage` para persistir el contexto entre mensajes
- Agrega **typing indicator** animado mientras Dify procesa
- Polling de `/api/messages` se mantiene solo para mensajes entrantes de WhatsApp

### Fix 4 — Reemplazar Server Action por API Route (commit `45103af`)
**Archivo nuevo:** `src/app/api/send-message/route.ts`

El cambio más crítico para el entorno Hostinger + GitHub deployments.

| Antes | Después |
|-------|---------|
| Server Action `sendMessageAction` | API Route `POST /api/send-message` |
| Hash generado en build (cambia con cada deploy) | URL fija, nunca cambia |
| `UnrecognizedActionError` al redeploy | Funciona siempre |
| `sendMessageAction` importado en el widget | `fetch('/api/send-message', ...)` directo |

El cliente en `chat-widget.tsx` ahora llama:
```typescript
const res = await fetch('/api/send-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text, senderName, senderPhone, conversationId }),
  signal: AbortSignal.timeout(45000),
});
const result = await res.json();
// result.botResponse → respuesta de Dify
// result.conversationId → ID para el próximo mensaje
```

---

## Arquitectura Final del Flujo

```
Browser (chat-widget.tsx)
  │
  │  POST /api/send-message
  ▼
Next.js API Route (route.ts)
  │
  │  POST n8nWebhookUrl (body: { text, senderName, senderPhone, conversation_id })
  ▼
n8n — Webhook Web Chat3
  │
  ├─ Preparar Mensaje2 (normaliza datos)
  ├─ ¿Es mensaje del Chat? (IF)
  │
  ├── [SÍ] ─┬─ 🤖 Dify Luna1 → 🔄 Procesar Stream → ✅ RespondToWebhook
  │          └─ 📤 Notificar Vendedor (fire & forget)
  │
  └── [NO] → 📨 WhatsApp → Chat Web → ✅ RespondToWebhook
```

---

## Pendientes / Mejoras Futuras

- [ ] **Importar `n8n-flujo-chat-v4.json`** en la instancia n8n de producción
- [ ] Reemplazar `messageStore` con Redis o una DB real para WhatsApp polling
- [ ] Agregar secret token de seguridad al webhook (`WEBHOOK_SECRET`)
- [ ] Explorar SSE (Server-Sent Events) como alternativa al polling de WhatsApp

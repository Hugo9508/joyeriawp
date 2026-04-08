# 💬 Configuración Técnica: Ecosistema de Chat (Web ↔ WhatsApp)

Este documento detalla la arquitectura de comunicación **Directa** (v9.1).

---

## 1. Arquitectura: Chat Web Directo (Dify)

El chat web ya **no** utiliza n8n como intermediario para mensajes de usuario. Se comunica directamente con la API de Dify para reducir latencia y evitar fallos por cuotas en n8n.

### Flujo de Datos
1.  **Mensaje de Usuario**: `ChatWidget.tsx` → `api/dify-chat` → `Dify API`.
2.  **Handoff a Humano**: Si Dify detecta señales de compra (detectHandoff), notifica a n8n vía el webhook `/dify-events`.
3.  **Gestión de Prospectos**: n8n recibe el evento → Resume la charla con IA → Registra en Google Sheets CRM → Notifica al vendedor por WhatsApp.

---

## 2. Lógica de Contexto e Interacción

### Consultas de Producto ("Consultar")
Cuando el usuario hace clic en el botón **"Consultar"**, se envía a Dify un bloque de metadatos (Nombre, Precio, SKU, URL). Esto permite que Alma (IA) asesore al cliente con datos exactos sobre la pieza de interés.

### Chat Directo (Aislamiento de Contexto)
Para evitar que consultas previas de productos "contaminen" una nueva charla general:
- Al abrir el chat desde la burbuja flotante, el sistema **limpia** el `conversation_id` y el historial local.
- Esto garantiza una conversación "limpia" sin referencias a productos consultados anteriormente, a menos que el usuario vuelva a clicar "Consultar".

---

## 3. Resolución de Problemas (Troubleshooting)

1.  **Dify no responde**: Verifique `DIFY_API_KEY` en Hostinger.
2.  **Handoff no llega a WhatsApp**: Verifique que el flujo de n8n v9.1 esté activo y que el Webhook URL coincida con la variable `N8N_EVENT_WEBHOOK_URL`.
3.  **El chat recuerda productos viejos**: Se ha implementado un fix en `ChatWidget.tsx` para limpiar el `sessionStorage`. Si persiste, el usuario debe cerrar y reabrir el chat.
4.  **Texto cortado/desbordado**: Los globos de chat tienen `overflowWrap: 'break-word'` para soportar URLs largas.

**Fecha de Actualización**: 22 de Febrero, 2026

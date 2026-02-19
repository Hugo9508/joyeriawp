'use server';

import { appSettings } from '@/lib/settings';

/**
 * @fileOverview Acción de servidor para enviar mensajes a n8n.
 * Optimizada para el flujo 'jaflujodev' con diagnóstico mejorado.
 */

export async function sendMessageAction(payload: {
  text: string;
  senderName: string;
  senderPhone: string;
}) {
  if (!payload.text.trim()) return { success: false, error: 'El mensaje está vacío.' };

  console.log(`[CHAT_ATTEMPT] Enviando a n8n (jaflujodev): ${payload.senderName}`);

  try {
    const response = await fetch(appSettings.n8nWebhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'AlianzaBoutique-Web/2.0 (Hostinger Production)'
      },
      body: JSON.stringify({
        event: "web_message",
        instance: appSettings.chatAgentName,
        data: {
          text: payload.text,
          senderName: payload.senderName,
          senderPhone: payload.senderPhone,
          storeNumber: appSettings.whatsAppNumber
        },
        metadata: {
          platform: 'web_boutique',
          timestamp: new Date().toISOString()
        }
      }),
      signal: AbortSignal.timeout(30000), 
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[CHAT_ERROR_RESPONSE] Status: ${response.status}`, errorText);
      
      return { 
        success: false, 
        error: `Error de comunicación (${response.status}). Verifique si el flujo jaflujodev está ACTIVO en n8n.` 
      };
    }

    const result = await response.json();
    console.log(`[CHAT_SUCCESS] n8n respondió:`, result);

    return { success: true };
  } catch (error: any) {
    console.error('[CHAT_CRITICAL_ERROR]', error.message);
    
    let errorMsg = `No se pudo conectar con n8n.`;
    if (error.name === 'TimeoutError') errorMsg = 'El servidor de n8n tardó demasiado en responder.';
    
    return { success: false, error: errorMsg };
  }
}

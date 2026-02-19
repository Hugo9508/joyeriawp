'use server';

import { appSettings } from '@/lib/settings';

/**
 * @fileOverview Acción de servidor para enviar mensajes a n8n.
 * Optimizada para proporcionar diagnósticos claros sobre el estado del flujo en n8n.
 */

export async function sendMessageAction(payload: {
  text: string;
  senderName: string;
  senderPhone: string;
}) {
  if (!payload.text.trim()) return { success: false, error: 'El mensaje está vacío.' };

  try {
    const response = await fetch(appSettings.n8nWebhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        storePhoneNumber: appSettings.whatsAppNumber,
        text: payload.text,
        senderName: payload.senderName,
        senderPhone: payload.senderPhone,
        timestamp: new Date().toISOString(),
        platform: 'web_boutique'
      }),
      signal: AbortSignal.timeout(15000), // Timeout de seguridad
      cache: 'no-store'
    });

    if (!response.ok) {
      // Diagnóstico de error 404 (Común si el flujo en n8n no está "Active")
      if (response.status === 404) {
        return { 
          success: false, 
          error: "n8n no encontró la ruta. Asegúrese de que el flujo esté en modo 'ACTIVE' (Interruptor ON)." 
        };
      }
      return { 
        success: false, 
        error: `n8n respondió con error ${response.status}. Revise la configuración del Webhook.` 
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[CHAT_ACTION_ERROR]', error.message);
    
    let errorMsg = 'Error de conexión con el servidor de chat.';
    if (error.name === 'TimeoutError') errorMsg = 'El servidor de n8n no responde (Timeout).';
    
    return { success: false, error: errorMsg };
  }
}

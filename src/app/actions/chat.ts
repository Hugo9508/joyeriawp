'use server';

import { appSettings } from '@/lib/settings';

/**
 * @fileOverview Acción de servidor para enviar mensajes a n8n.
 * Proporciona feedback detallado para facilitar el diagnóstico de errores.
 */

export async function sendMessageAction(payload: {
  text: string;
  senderName: string;
  senderPhone: string;
}) {
  if (!payload.text.trim()) return { success: false, error: 'El mensaje no puede estar vacío.' };

  try {
    const response = await fetch(appSettings.n8nWebhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'JoyeriaAlianza-Boutique/2.0'
      },
      body: JSON.stringify({
        ...payload,
        storePhoneNumber: appSettings.whatsAppNumber,
        metadata: {
          platform: 'web_boutique',
          timestamp: new Date().toISOString()
        }
      }),
      signal: AbortSignal.timeout(15000), // 15 segundos para evitar bloqueos
      cache: 'no-store'
    });

    if (!response.ok) {
      // Si n8n responde con error (ej: 404 si el flujo no está "Active")
      return { 
        success: false, 
        error: `El servidor de chat (n8n) devolvió un error ${response.status}. Verifique que el flujo esté ACTIVO.` 
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[CHAT_SEND_ERROR]', error.message);
    
    let userFriendlyError = 'Error de conexión con el sistema de chat.';
    
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      userFriendlyError = 'El servidor de n8n tarda demasiado en responder. ¿Está encendido?';
    } else if (error.message.includes('fetch')) {
      userFriendlyError = 'No se pudo conectar con n8n. Verifique la URL en settings.ts';
    }

    return { 
      success: false, 
      error: userFriendlyError 
    };
  }
}

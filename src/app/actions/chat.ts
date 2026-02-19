'use server';

import { appSettings } from '@/lib/settings';

/**
 * @fileOverview Acción de servidor para enviar mensajes a n8n.
 * Limpia y optimizada para evitar bloqueos en hosting compartido.
 */

export async function sendMessageAction(payload: {
  text: string;
  senderName: string;
  senderPhone: string;
}) {
  if (!payload.text.trim()) return { success: false, error: 'Mensaje vacío' };

  try {
    const response = await fetch(appSettings.n8nWebhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
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
      signal: AbortSignal.timeout(15000), // Timeout de seguridad
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Servidor n8n fuera de línea (Status ${response.status})`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('[CHAT_ERROR]', error.message);
    return { 
      success: false, 
      error: error.message.includes('timeout') 
        ? 'El servidor tarda demasiado en responder.' 
        : 'No se pudo enviar el mensaje. Verifique su conexión.' 
    };
  }
}

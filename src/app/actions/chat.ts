'use server';

import { appSettings } from '@/lib/settings';

/**
 * @fileOverview Acción de servidor para enviar mensajes a n8n.
 * Optimizada para entornos de hosting compartido con mayor tolerancia y diagnóstico.
 */

export async function sendMessageAction(payload: {
  text: string;
  senderName: string;
  senderPhone: string;
}) {
  if (!payload.text.trim()) return { success: false, error: 'El mensaje está vacío.' };

  console.log(`[CHAT_ATTEMPT] Enviando a n8n: ${payload.senderName} (${payload.senderPhone})`);

  try {
    const response = await fetch(appSettings.n8nWebhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AlianzaBoutique/1.0'
      },
      body: JSON.stringify({
        storePhoneNumber: appSettings.whatsAppNumber,
        text: payload.text,
        senderName: payload.senderName,
        senderPhone: payload.senderPhone,
        timestamp: new Date().toISOString(),
        platform: 'web_boutique'
      }),
      // Aumentamos a 30 segundos para dar margen en hosting compartido
      signal: AbortSignal.timeout(30000), 
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[CHAT_ERROR_RESPONSE] Status: ${response.status}`, errorText);
      
      if (response.status === 404) {
        return { 
          success: false, 
          error: "n8n no encontró la ruta. Verifique que el flujo esté en modo 'ACTIVE'." 
        };
      }
      return { 
        success: false, 
        error: `Error del servidor n8n (${response.status}).` 
      };
    }

    return { success: true };
  } catch (error: any) {
    // Log detallado para el administrador en los logs de Hostinger
    console.error('[CHAT_CRITICAL_ERROR]', {
      message: error.message,
      name: error.name,
      cause: error.cause
    });
    
    let errorMsg = `Error de conexión: ${error.message}`;
    if (error.name === 'TimeoutError') errorMsg = 'El servidor de n8n tardó demasiado en responder (Timeout).';
    if (error.message.includes('fetch failed')) errorMsg = 'Fallo al contactar n8n. Verifique que la URL sea accesible.';
    
    return { success: false, error: errorMsg };
  }
}

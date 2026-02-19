'use server';

/**
 * @fileOverview Server Action optimizada para gestionar el envío de mensajes a n8n.
 * Incluye manejo de timeouts y logs detallados para depuración en producción.
 */

import { appSettings } from '@/lib/settings';

export async function sendMessageToEvolutionAction(
  text: string, 
  senderName: string = 'Cliente Boutique Web',
  senderPhone: string = 'No provisto'
) {
  if (!text.trim()) return { success: false, error: 'Mensaje vacío' };

  const timestamp = new Date().toISOString();
  console.log(`[CHAT_ACTION] [${timestamp}] Iniciando POST a: ${appSettings.webhookUrl}`);

  const payload = {
    storePhoneNumber: appSettings.whatsAppNumber,
    text: text,
    senderName: senderName,
    senderPhone: senderPhone,
    metadata: {
      platform: 'web_boutique',
      timestamp: timestamp
    }
  };

  try {
    const response = await fetch(appSettings.webhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) JoyeriaAlianza/1.0'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000), // 15 segundos de timeout
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Sin detalle');
      console.error(`[CHAT_ACTION] n8n respondió con error [Status ${response.status}]:`, errorText);
      
      let hint = 'Verifique que el flujo de n8n esté ACTIVO.';
      if (response.status === 404) hint = 'La URL del Webhook en n8n es incorrecta o el flujo está desactivado.';
      
      return { 
        success: false, 
        error: `Servidor de Chat: ${response.status} - ${hint}` 
      };
    }

    console.log('[CHAT_ACTION] Éxito: Mensaje recibido por n8n correctamente.');
    return { success: true };
  } catch (error: any) {
    let errorMessage = error.message;
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      errorMessage = 'El servidor de n8n tardó demasiado en responder (Timeout).';
    }
    
    console.error('[CHAT_ACTION] Error crítico de red:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

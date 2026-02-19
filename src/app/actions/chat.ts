'use server';

/**
 * @fileOverview Server Action para gestionar el envío de mensajes a la Evolution API vía n8n.
 * Realiza un llamado POST a la URL de n8n configurada en settings.ts.
 */

import { appSettings } from '@/lib/settings';

export async function sendMessageToEvolutionAction(
  text: string, 
  senderName: string = 'Cliente Boutique Web',
  senderPhone: string = 'No provisto'
) {
  if (!text.trim()) return { success: false, error: 'Mensaje vacío' };

  // Log de auditoría para verificar en los logs de Hostinger
  console.log(`📤 Iniciando llamado POST a n8n: ${appSettings.webhookUrl}`);

  try {
    const response = await fetch(appSettings.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storePhoneNumber: appSettings.whatsAppNumber,
        text: text,
        senderName: senderName,
        senderPhone: senderPhone,
        metadata: {
          platform: 'web_boutique',
          timestamp: new Date().toISOString()
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error en respuesta de n8n [Status ${response.status}]:`, errorText);
      throw new Error(`Error en la respuesta del servidor de chat: ${response.status}`);
    }

    console.log('✅ Mensaje entregado a n8n con éxito.');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Chat Server Action Critical Error:', error.message);
    return { success: false, error: error.message };
  }
}

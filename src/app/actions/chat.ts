
'use server';

/**
 * @fileOverview Server Action para gestionar el envío de mensajes a la Evolution API.
 * Esto asegura que la URL del Webhook y las credenciales permanezcan en el servidor.
 */

import { appSettings } from '@/lib/settings';

export async function sendMessageToEvolutionAction(text: string, senderName: string = 'Cliente Boutique Web') {
  if (!text.trim()) return { success: false, error: 'Mensaje vacío' };

  try {
    const response = await fetch(appSettings.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: appSettings.whatsAppNumber,
        text: text,
        senderName: senderName,
      }),
    });

    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor de chat');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Chat Server Action Error:', error.message);
    return { success: false, error: error.message };
  }
}

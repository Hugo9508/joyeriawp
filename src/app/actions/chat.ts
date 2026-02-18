'use server';

/**
 * @fileOverview Server Action para gestionar el envío de mensajes a la Evolution API.
 * Ahora incluye el número de teléfono del remitente para mejorar la trazabilidad.
 */

import { appSettings } from '@/lib/settings';

export async function sendMessageToEvolutionAction(
  text: string, 
  senderName: string = 'Cliente Boutique Web',
  senderPhone: string = 'No provisto'
) {
  if (!text.trim()) return { success: false, error: 'Mensaje vacío' };

  try {
    const response = await fetch(appSettings.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storePhoneNumber: appSettings.whatsAppNumber,
        text: text,
        senderName: senderName,
        senderPhone: senderPhone, // Enviamos el teléfono del cliente al webhook
        metadata: {
          platform: 'web_boutique',
          timestamp: new Date().toISOString()
        }
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

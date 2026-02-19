'use server';

import { appSettings } from '@/lib/settings';

/**
 * @fileOverview Acción de servidor para enviar mensajes a n8n con diagnóstico extendido.
 */

export async function sendMessageAction(payload: {
  text: string;
  senderName: string;
  senderPhone: string;
}) {
  if (!payload.text.trim()) return { success: false, error: 'El mensaje está vacío.' };

  const startTime = performance.now();
  const requestBody = {
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
  };

  try {
    const response = await fetch(appSettings.n8nWebhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'AlianzaBoutique-Web/2.0 (Diagnostic Mode)'
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000), 
      cache: 'no-store'
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }

    const debugInfo = {
      url: appSettings.n8nWebhookUrl,
      status: response.status,
      statusText: response.statusText,
      duration: `${duration}ms`,
      payload: requestBody,
      response: responseData
    };

    if (!response.ok) {
      return { 
        success: false, 
        error: `Error n8n (${response.status}): ${response.statusText}`,
        debug: debugInfo
      };
    }

    return { 
      success: true, 
      debug: debugInfo
    };
  } catch (error: any) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    const debugInfo = {
      url: appSettings.n8nWebhookUrl,
      error: error.message,
      duration: `${duration}ms`,
      payload: requestBody
    };

    return { 
      success: false, 
      error: error.name === 'TimeoutError' ? 'Timeout (30s)' : error.message,
      debug: debugInfo
    };
  }
}

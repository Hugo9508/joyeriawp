
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Webhook principal para recibir respuestas desde n8n/WhatsApp.
 * Este es el punto de entrada oficial para los mensajes que vienen de WhatsApp hacia la Web.
 * URL Destino en n8n: https://joyeria.a380.com.br/api/webhook
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Log de auditoría en el servidor (visible en los logs de Hostinger)
    console.log('📥 Mensaje de WhatsApp recibido vía n8n:', JSON.stringify(body, null, 2));

    /**
     * NOTA TÉCNICA:
     * Para que el mensaje aparezca instantáneamente en el ChatWidget de la web,
     * este endpoint debería reenviar el 'body' a tu servidor de Socket.io.
     * Si no usas un servidor de sockets externo, el cliente recibirá el mensaje
     * tras la siguiente interacción o mediante un mecanismo de polling.
     */

    return NextResponse.json({ 
      success: true, 
      message: "Recibido por Joyería Alianza",
      receivedAt: new Date().toISOString(),
      echo: {
        text: body.text,
        sender: body.senderName
      }
    });
  } catch (error: any) {
    console.error('❌ Error crítico en Webhook:', error.message);
    return NextResponse.json({ 
      error: 'Fallo al procesar mensaje', 
      detail: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "online", 
    endpoint: "/api/webhook",
    message: "Listo para recibir POST desde n8n (WhatsApp -> Chat Web)",
    documentation: "Envíe un JSON con { text, senderName, phoneNumber }"
  });
}

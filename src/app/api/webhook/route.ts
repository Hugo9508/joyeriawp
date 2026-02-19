import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Endpoint Maestro de Recepción de Mensajes (WhatsApp -> Web).
 * n8n debe enviar un POST a: https://joyeria.a380.com.br/api/webhook
 */

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Log para depuración en el servidor de Hostinger
    console.log(`[INCOMING_WHATSAPP] De: ${body.senderName} | Msg: ${body.text}`);

    /**
     * El cuerpo esperado desde n8n es:
     * { "text": "...", "senderName": "Maya", "phoneNumber": "..." }
     */

    return NextResponse.json({ 
      received: true, 
      at: new Date().toISOString() 
    });
  } catch (error: any) {
    console.error('[WEBHOOK_RECEIVE_ERROR]', error.message);
    return NextResponse.json({ error: 'Payload malformado' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "online", 
    service: "Alianza Chat Webhook",
    info: "Endpoint listo para recibir mensajes de n8n mediante POST."
  });
}

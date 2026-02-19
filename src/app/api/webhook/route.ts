import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Endpoint ergonómico para recibir respuestas de n8n (WhatsApp).
 * Ruta: https://joyeria.a380.com.br/api/webhook
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Log minimalista para auditoría
    console.log(`[INCOMING_WHATSAPP] De: ${body.senderName} | Msg: ${body.text}`);

    /**
     * IMPORTANTE:
     * El ChatWidget escucha este evento a través de un relay de socket
     * o mediante la simulación local de eventos del navegador.
     */

    return NextResponse.json({ 
      success: true, 
      received: true,
      at: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "active", 
    service: "Maya Chat Bridge",
    webhook_url: "/api/webhook"
  });
}

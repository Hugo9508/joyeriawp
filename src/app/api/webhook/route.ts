import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Receptor unificado de mensajes entrantes desde n8n (WhatsApp).
 * Ruta definitiva: /api/webhook
 */

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Log de auditoría para ver qué llega desde n8n
    console.log(`[WHATSAPP_INCOMING] Remitente: ${body.senderName} (${body.phoneNumber}) | Msg: ${body.text}`);

    /**
     * El ChatWidget en la interfaz escucha eventos del navegador o de socket.
     * En producción, n8n dispara este POST y el servidor lo procesa.
     */

    return NextResponse.json({ 
      success: true, 
      message: "Recibido por Joyería Alianza",
      at: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[WEBHOOK_ERROR]', error.message);
    return NextResponse.json({ error: 'Payload inválido o malformado' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "online", 
    service: "Maya Chat Webhook",
    info: "Use POST para enviar mensajes desde n8n."
  });
}

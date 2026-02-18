
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Webhook principal para recibir respuestas desde n8n/WhatsApp.
 * Ruta definitiva: /api/webhook
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Log para depuración en el servidor
    console.log('📥 Mensaje de WhatsApp recibido vía n8n:', body);

    /**
     * NOTA: Este endpoint recibe la información desde n8n.
     * El formato esperado es: { text, senderName, phoneNumber, timestamp }
     */

    return NextResponse.json({ 
      success: true, 
      message: "Recibido por Joyería Alianza",
      receivedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Error en Webhook:', error.message);
    return NextResponse.json({ error: 'Fallo al procesar mensaje' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "online", 
    endpoint: "/api/webhook",
    message: "Listo para recibir POST desde n8n (WhatsApp -> Chat)" 
  });
}

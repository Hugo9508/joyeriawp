
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Webhook para recibir mensajes entrantes desde n8n (WhatsApp).
 * Este endpoint es el que debe configurarse en el nodo "Enviar al Chat Web" de n8n.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // El formato que envía tu n8n es: { text, senderName, timestamp, phoneNumber }
    console.log('📥 Mensaje recibido desde n8n:', body);

    /**
     * NOTA TÉCNICA PARA EL DESPLIEGUE EN HOSTINGER:
     * Para que este mensaje aparezca en tiempo real en el ChatWidget, el servidor
     * debe emitir este evento a través de Socket.io. 
     * En un entorno de Next.js estándar, esto requiere un relay o un servidor custom.
     */

    return NextResponse.json({ 
      success: true, 
      message: "Mensaje recibido correctamente por Joyería Alianza",
      receivedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Error en Webhook de Chat:', error.message);
    return NextResponse.json({ error: 'Fallo al procesar el mensaje' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Webhook activo. Use POST para enviar mensajes." });
}

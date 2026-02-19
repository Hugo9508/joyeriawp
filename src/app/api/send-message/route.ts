import { NextRequest, NextResponse } from 'next/server';
import { appSettings } from '@/lib/settings';

/**
 * @fileOverview API Route para enviar mensajes a n8n.
 * Reemplaza el Server Action para evitar hash-mismatch entre deploys.
 * Cliente llama POST /api/send-message con { text, senderName, senderPhone, conversationId }
 */

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text, senderName, senderPhone, conversationId } = body;

        if (!text?.trim()) {
            return NextResponse.json({ success: false, error: 'Mensaje vacío.' }, { status: 400 });
        }

        const startTime = Date.now();

        const requestBody = {
            event: 'web_message',
            instance: appSettings.chatAgentName,
            data: {
                text,
                senderName,
                senderPhone,
                storeNumber: appSettings.whatsAppNumber,
                conversation_id: conversationId || '',
            },
            metadata: {
                platform: 'web_boutique',
                timestamp: new Date().toISOString(),
            },
        };

        const n8nResponse = await fetch(appSettings.n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'User-Agent': 'JoyeriaAlianza-Web/2.0',
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(40000),
            cache: 'no-store',
        });

        const duration = Date.now() - startTime;
        const responseText = await n8nResponse.text();
        let responseData: any;
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = { raw: responseText };
        }

        if (!n8nResponse.ok) {
            return NextResponse.json({
                success: false,
                error: `Error n8n (${n8nResponse.status}): ${n8nResponse.statusText}`,
                debug: { duration: `${duration}ms`, response: responseData },
            });
        }

        // El flujo n8n v4 responde directamente con la respuesta de Dify
        return NextResponse.json({
            success: true,
            botResponse: responseData?.response || responseData?.text || null,
            conversationId: responseData?.conversation_id || null,
            debug: { duration: `${duration}ms`, status: n8nResponse.status },
        });

    } catch (error: any) {
        if (error.name === 'TimeoutError') {
            return NextResponse.json({ success: false, error: 'Sin respuesta del servidor (40s)' }, { status: 504 });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

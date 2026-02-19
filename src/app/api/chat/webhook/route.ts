import { NextResponse } from 'next/server';

/**
 * @fileOverview Endpoint obsoleto. Redirigiendo a la ruta principal /api/webhook.
 */

export async function GET() {
  return NextResponse.json({ message: "Utilice /api/webhook en su lugar." }, { status: 301 });
}

export async function POST() {
  return NextResponse.json({ error: "Endpoint movido a /api/webhook" }, { status: 301 });
}

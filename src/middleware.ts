
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

/**
 * Middleware simplificado para permitir acceso libre al panel de administración temporalmente.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};

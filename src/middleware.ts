
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode('alianza-secret-boutique-2026-key');
const COOKIE_NAME = 'alianza_admin_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas que requieren autenticación
  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApi = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login';

  // Excluir explícitamente la página de login para evitar bucles
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next();
  }

  if (isAdminPath || isAdminApi) {
    const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;

    if (!sessionCookie) {
      if (isAdminApi) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Verificar el token JWT
      await jwtVerify(sessionCookie, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      // Si el token es inválido o expiró
      if (isAdminApi) return NextResponse.json({ error: 'Sesión expirada' }, { status: 401 });
      
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

// Configuración del matcher para capturar /admin y todas sus subrutas
export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};

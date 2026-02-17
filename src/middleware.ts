
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_PASSWORD || 'aurum-luz-secret-default-key-123');
const COOKIE_NAME = 'aurum_admin_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas que requieren protección
  const isAdminPath = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login';

  if (isAdminPath || isAdminApi) {
    const session = request.cookies.get(COOKIE_NAME)?.value;

    if (!session) {
      if (isAdminApi) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      await jwtVerify(session, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      if (isAdminApi) return NextResponse.json({ error: 'Sesión expirada' }, { status: 401 });
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

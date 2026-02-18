
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si intenta acceder a /admin (excepto login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Protegemos las APIs de administración
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

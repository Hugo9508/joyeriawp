
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lgdhnkfxberjzctgywiz.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGhua2Z4YmVyanpjdGd5d2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjIwNTcsImV4cCI6MjA4NjgzODA1N30.QO998oDHtNIy9xLzIbLt84v03i9b6dUw8vPpN3cN11Y';

/**
 * Emails con acceso al panel admin.
 * Agrega aquí los correos autorizados.
 */
const ADMIN_EMAILS: string[] = [
  // 'tu-email@gmail.com',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas que no requieren autenticación
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/auth/callback')
  ) {
    return NextResponse.next();
  }

  // Solo proteger rutas /admin y /api/admin
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next();
  }

  // Crear cliente Supabase con cookies del request
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Verificar sesión
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    // Sin sesión → redirect a login
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar email autorizado (si hay whitelist configurada)
  if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(user.email || '')) {
    // Email no autorizado → redirect a login con error
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/auth/callback',
  ],
};

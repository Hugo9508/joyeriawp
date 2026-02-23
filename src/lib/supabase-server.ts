import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lgdhnkfxberjzctgywiz.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGhua2Z4YmVyanpjdGd5d2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjIwNTcsImV4cCI6MjA4NjgzODA1N30.QO998oDHtNIy9xLzIbLt84v03i9b6dUw8vPpN3cN11Y';

/**
 * Emails autorizados para acceder al panel admin.
 * Agregar los emails que necesiten acceso.
 */
export const ADMIN_EMAILS: string[] = [
    // Agrega aquí los emails autorizados:
    // 'tu-email@gmail.com',
];

export async function createSupabaseServer() {
    const cookieStore = await cookies();

    return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // Puede fallar en Server Components (read-only cookies)
                    // Es seguro ignorar en middleware/route handlers
                }
            },
        },
    });
}


import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

// Secreto para firmar el JWT. Se mantiene fijo para evitar problemas de persistencia en Hostinger.
const JWT_SECRET = new TextEncoder().encode('alianza-secret-boutique-2026-key');
const COOKIE_NAME = 'alianza_admin_session';

/**
 * Crea una sesión JWT y la guarda en una cookie segura.
 */
export async function createSession() {
  const session = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Recupera y verifica la sesión actual.
 */
export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Elimina la cookie de sesión (Logout).
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Verifica la contraseña de acceso maestra.
 * Contraseña: admin123
 */
export function verifyPassword(password: string) {
  const MASTER_PASSWORD = 'admin123'; 
  return password === MASTER_PASSWORD;
}

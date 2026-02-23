# 🔐 Login Admin — Documentación Completa

**Fecha de implementación:** 22 de Febrero, 2026
**Sistema:** Supabase Auth con Magic Link
**Reemplaza:** Login por contraseña (`admin123` + JWT cookie manual)

---

## 1. Arquitectura del Sistema de Autenticación

```
Usuario → /admin/login → Ingresa email → Supabase envía Magic Link
                                                    ↓
Email → Click en enlace → /auth/callback → exchangeCodeForSession → Sesión activa
                                                    ↓
                                              Redirect → /admin (Dashboard)
```

### Flujo de Protección (Middleware)
```
Request a /admin/* → Middleware verifica sesión Supabase
   ├─ Sin sesión → Redirect a /admin/login
   ├─ Con sesión, email NO autorizado → Redirect con ?error=unauthorized
   └─ Con sesión, email autorizado → Acceso permitido (NextResponse.next())
```

---

## 2. Base de Datos Supabase

### Proyecto
- **URL:** `https://lgdhnkfxberjzctgywiz.supabase.co`
- **Referencia:** `lgdhnkfxberjzctgywiz`

### Tablas de Autenticación (gestionadas por Supabase Auth)
Supabase Auth crea automáticamente las tablas en el schema `auth`:
- `auth.users` — Registro de usuarios autenticados
- `auth.sessions` — Sesiones activas
- `auth.refresh_tokens` — Tokens de refresco

> No se necesita SQL manual para la autenticación. Supabase lo gestiona internamente.

### Tablas de Pedidos (creadas manualmente)

```sql
-- 1. Tabla de Pedidos
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('woocommerce', 'whatsapp', 'manual')),
  source_id TEXT,
  kanban_status TEXT NOT NULL DEFAULT 'new'
    CHECK (kanban_status IN ('new', 'analysis', 'preparing', 'ready', 'completed')),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  customer_type TEXT DEFAULT 'PARTICULAR',
  subtotal NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'UYU',
  payment_method TEXT DEFAULT 'Contado',
  notes TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Items del Pedido
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  sku TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) DEFAULT 0
);

-- 3. Secuencia para Numeración Automática
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- 4. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Políticas RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);
```

---

## 3. Configuración de Supabase (Dashboard)

### Authentication → Providers → Email
| Opción | Estado | Nota |
|---|---|---|
| Enable Email provider | ✅ ON | Requerido para Magic Link |
| Secure email change | ✅ ON | Seguridad adicional |
| Secure password change | ⬜ OFF | No usamos passwords |
| Prevent use of leaked passwords | ⬜ OFF | No aplica |
| Minimum password length | 6 | Default — no aplica |

### Authentication → Sign In / Providers
| Opción | Estado | Nota |
|---|---|---|
| Allow new users to sign up | ✅ ON | Necesario para crear cuenta con Magic Link |
| Allow manual linking | ⬜ OFF | No necesario |
| Allow anonymous sign-ins | ⬜ OFF | No necesario |
| Confirm email | ✅ ON | Verifica el email del usuario |

### Authentication → URL Configuration → Redirect URLs
Agregar estas URLs:
```
http://localhost:3000/auth/callback
https://joyeria.a380.com.br/auth/callback
```

---

## 4. Archivos del Proyecto

### Archivos Creados

| Archivo | Función |
|---|---|
| `src/lib/supabase-browser.ts` | Cliente Supabase para el browser (`createBrowserClient` de `@supabase/ssr`) |
| `src/lib/supabase-server.ts` | Cliente Supabase para el server + array `ADMIN_EMAILS` |
| `src/app/auth/callback/route.ts` | Ruta GET que recibe el código del Magic Link y crea la sesión |

### Archivos Modificados

| Archivo | Cambio |
|---|---|
| `src/middleware.ts` | Verifica sesión Supabase + whitelist de emails en `/admin/*` |
| `src/app/admin/login/page.tsx` | Form de email + estado "Revisa tu email" + Suspense boundary |
| `src/app/admin/layout.tsx` | Logout cambiado a `supabase.auth.signOut()` |

### Archivos Eliminados

| Archivo | Razón |
|---|---|
| `src/lib/auth.ts` | JWT manual + `verifyPassword("admin123")` — ya no necesario |
| `src/app/api/admin/login/route.ts` | API de login por password — reemplazado por Supabase |
| `src/app/api/admin/logout/route.ts` | API de logout — ahora es client-side con Supabase |

---

## 5. Email Autorizado

| Email | Rol |
|---|---|
| `joyeriaalianzauy@gmail.com` | Administrador |

**Para agregar más emails**, editar el array `ADMIN_EMAILS` en:
- `src/middleware.ts` (línea 13)
- `src/lib/supabase-server.ts` (línea 11)

> Si el array está vacío, **cualquier email** puede acceder al admin.

---

## 6. Dependencias Instaladas

```bash
npm install @supabase/ssr
```

Paquete ya existente:
```bash
@supabase/supabase-js  # Instalado previamente para el dashboard de pedidos
```

---

## 7. Variables de Entorno

| Variable | Valor | Archivo |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lgdhnkfxberjzctgywiz.supabase.co` | `.env.local` / Hostinger |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (embebida como fallback) | `.env.local` / Hostinger |

> Las credenciales tienen fallback embebido en el código. En producción, configurar las variables de entorno en Hostinger para mayor seguridad.

---

## 8. Testing y Verificación

| Test | Resultado |
|---|---|
| `npm run build` | ✅ Compilado sin errores (exit code: 0) |
| Sin referencias a archivos eliminados | ✅ Verificado con grep |
| Sin imports rotos | ✅ Verificado |
| Middleware excluye `/admin/login` (sin redirect loop) | ✅ Verificado |
| Login page con Suspense boundary (Next.js 15) | ✅ Verificado |

---

## 9. Commits Realizados

| Commit | Mensaje |
|---|---|
| `6ee0702` | `feat: add orders dashboard with Kanban board at /admin/orders` |
| `77f7e08` | `docs: update README with Orders Dashboard and Supabase config` |
| `bb17e32` | `feat: replace admin password auth with Supabase Magic Link` |
| `ed9c3e3` | `chore: add admin email to auth whitelist` |

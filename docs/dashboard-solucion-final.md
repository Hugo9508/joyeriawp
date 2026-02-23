# 📊 Solución Final: Dashboard de Pedidos Kanban

Este documento detalla la arquitectura, base de datos y componentes del nuevo Dashboard de Pedidos integrado en el panel administrativo de Joyería Alianza.

---

## 🏗️ Arquitectura de la Solución

El dashboard reemplaza el mockup estático `dashboard.html` por una aplicación React dinámica integrada en Next.js, utilizando **Supabase** como motor de base de datos unificado.

### Flujo de Datos
1. **Fuentes**: Los pedidos ingresan desde WooCommerce (Web), WhatsApp (vía n8n) o Manualmente (Dashboard).
2. **Almacenamiento**: Todos los pedidos se centralizan en las tablas `orders` y `order_items` de Supabase.
3. **Interfaz**: Un tablero Kanban en `/admin/orders` permite gestionar el flujo de trabajo mediante Drag & Drop.

---

## 🗄️ Esquema de Base de Datos (SQL)

Ejecuta este código en el SQL Editor de Supabase para recrear la estructura:

```sql
-- 1. Tabla de Pedidos
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,        -- Ejemplo: ORD-0001
  source TEXT NOT NULL DEFAULT 'manual'     -- 'woocommerce' | 'whatsapp' | 'manual'
    CHECK (source IN ('woocommerce', 'whatsapp', 'manual')),
  source_id TEXT,                           -- ID externo (WC o WhatsApp)
  kanban_status TEXT NOT NULL DEFAULT 'new' -- Estado del flujo
    CHECK (kanban_status IN ('new', 'analysis', 'preparing', 'ready', 'completed')),
  
  -- Datos del Cliente
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  customer_type TEXT DEFAULT 'PARTICULAR',
  
  -- Valores Financieros
  subtotal NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,              -- IVA 22%
  total NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'UYU',
  payment_method TEXT DEFAULT 'Contado',
  
  -- Control
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
```

---

## 🧩 Componentes Implementados

La solución se divide en componentes modulares en `src/components/admin/`:

1.  **`KanbanBoard.tsx`**: Contenedor principal que gestiona el contexto de arrastre (`@dnd-kit`) y organiza las 5 columnas.
2.  **`OrderCard.tsx`**: Tarjeta visual de cada pedido con badges de origen (Web/WhatsApp/Manual) y tiempo transcurrido.
3.  **`NewOrderModal.tsx`**: Formulario inteligente para crear pedidos manuales con cálculo de IVA en tiempo real.
4.  **`OrderDetailModal.tsx`**: Vista 360° del pedido que permite edición rápida, cambio de estado y eliminación.
5.  **`InvoiceModal.tsx`**: Generador de pre-factura (ticket) con branding de **Joyería Alianza**, listo para imprimir.

---

## 🛠️ Integración Técnica

- **Ruta del Dashboard**: `src/app/admin/orders/page.tsx`
- **Endpoints de API**: 
    - `GET/POST /api/admin/orders`
    - `GET/PATCH/DELETE /api/admin/orders/[id]`
- **Librería de Drag & Drop**: `@dnd-kit` (nativa de React, optimizada para performance).
- **Estándar de IVA**: Configurado al 22% (Uruguay) para todos los cálculos automáticos.

---

## 🚀 Próximos Pasos Propuestos
- **Notificaciones**: Activar envío de WhatsApp automático cuando el pedido pase a la columna "Listo".
- **Sincronización WC**: Webhook para que los pedidos de la web entren automáticamente al Kanban sin intervención manual.
- **Inventario**: Vincular la tabla de productos para descontar stock automáticamente al completar un pedido.

**Fecha de Entrega**: 22 de Febrero, 2026

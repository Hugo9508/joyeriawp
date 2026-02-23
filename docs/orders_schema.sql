-- ═══════════════════════════════════════════════════════
-- ORDERS DASHBOARD SCHEMA
-- Ejecutado el 22-Feb-2026 en Supabase
-- Proyecto: lgdhnkfxberjzctgywiz
-- ═══════════════════════════════════════════════════════

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

CREATE INDEX idx_orders_status ON orders(kanban_status);
CREATE INDEX idx_orders_source ON orders(source);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE OR REPLACE FUNCTION update_orders_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_updated
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_timestamp();

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access orders" ON orders
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access order_items" ON order_items
  FOR ALL USING (true) WITH CHECK (true);

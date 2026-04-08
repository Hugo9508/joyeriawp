-- ═══════════════════════════════════════════════════════
-- TABLA: chat_handoff
-- Controla cuándo la IA está pausada para un cliente
-- (porque el vendedor tomó la conversación)
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS chat_handoff (
  id SERIAL PRIMARY KEY,
  client_phone TEXT UNIQUE NOT NULL,
  is_paused BOOLEAN DEFAULT false,
  paused_by TEXT DEFAULT 'auto',       -- 'auto' | 'manual' | 'command'
  paused_at TIMESTAMPTZ DEFAULT NOW(),
  resume_at TIMESTAMPTZ,               -- cuándo reactivar IA automáticamente
  seller_name TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsqueda rápida por teléfono
CREATE INDEX IF NOT EXISTS idx_handoff_phone ON chat_handoff(client_phone);

-- Función para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_handoff_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_handoff_updated
  BEFORE UPDATE ON chat_handoff
  FOR EACH ROW
  EXECUTE FUNCTION update_handoff_timestamp();

-- ═══════════════════════════════════════════════════════
-- INSTRUCCIONES:
-- 1. Abre Supabase → SQL Editor
-- 2. Pega este script completo
-- 3. Ejecuta (Run)
-- ═══════════════════════════════════════════════════════

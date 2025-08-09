-- Crear tabla para almacenar los items de contenido
CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  script TEXT,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'script-ready', 'recorded', 'published')),
  recording_date TEXT,
  publish_date TEXT,
  platform TEXT NOT NULL DEFAULT 'both' CHECK (platform IN ('tiktok', 'reels', 'both')),
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_content_items_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_items_created_at ON content_items(created_at);

-- Habilitar Row Level Security
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones (para simplicidad)
CREATE POLICY IF NOT EXISTS "Allow all operations on content_items" ON content_items
FOR ALL USING (true) WITH CHECK (true);

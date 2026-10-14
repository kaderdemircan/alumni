-- ============================================================================
-- MIGRATION: 002_create_announcements_schema.sql
-- DESCRIPTION: Announcements table, relations, and indexes
-- ============================================================================

CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'Genel',
    priority VARCHAR(20) DEFAULT 'Normal',
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements (category);
CREATE INDEX IF NOT EXISTS idx_announcements_date ON announcements (date);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements (priority);

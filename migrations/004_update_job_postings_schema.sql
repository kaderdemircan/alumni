-- ============================================================================
-- MIGRATION: 004_update_job_postings_schema.sql
-- DESCRIPTION: Data Design Documentation (ddd.md) ile birebir uyumlu;
--              job_postings tablosunun zengin kariyer nitelikleri, çalışma modelleri,
--              maaş skalası, kısıtlar, tetikleyiciler (triggers), veri sözlüğü açıklamaları
--              ve job_skills junction tablosu ile güncellenmesi.
-- ============================================================================

-- 1. JOB_POSTINGS TABLOSUNUN VARLIĞINI GARANTİ ETME (Yoksa oluşturma)
CREATE TABLE IF NOT EXISTS job_postings (
    id BIGSERIAL PRIMARY KEY,
    posted_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    employment_type VARCHAR(30) DEFAULT 'full-time',
    location VARCHAR(150) NOT NULL,
    deadline DATE,
    status VARCHAR(20) DEFAULT 'open'
);

-- 2. ddd.md DOSYASINDA TANIMLANAN YENİ ALANLARIN GÜVENLİ ŞEKİLDE EKLENMESİ
ALTER TABLE job_postings
    ADD COLUMN IF NOT EXISTS company_logo_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Genel',
    ADD COLUMN IF NOT EXISTS requirements TEXT,
    ADD COLUMN IF NOT EXISTS benefits TEXT,
    ADD COLUMN IF NOT EXISTS workplace_type VARCHAR(30) DEFAULT 'hybrid',
    ADD COLUMN IF NOT EXISTS experience_level VARCHAR(30) DEFAULT 'mid',
    ADD COLUMN IF NOT EXISTS salary_min NUMERIC(12,2),
    ADD COLUMN IF NOT EXISTS salary_max NUMERIC(12,2),
    ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'TRY',
    ADD COLUMN IF NOT EXISTS is_salary_visible BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS application_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. VERİ BÜTÜNLÜĞÜ VE KISITLARI (CONSTRAINTS)
DO $$
BEGIN
    -- Maaş Skalası Kontrolü (salary_max >= salary_min)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_salary_range'
    ) THEN
        ALTER TABLE job_postings
            ADD CONSTRAINT check_salary_range
            CHECK (salary_max IS NULL OR salary_min IS NULL OR salary_max >= salary_min);
    END IF;

    -- Minimum Maaş Pozitiflik Kontrolü
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_salary_min_positive'
    ) THEN
        ALTER TABLE job_postings
            ADD CONSTRAINT check_salary_min_positive
            CHECK (salary_min IS NULL OR salary_min >= 0);
    END IF;

    -- Görüntülenme Sayacı Pozitiflik Kontrolü
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_views_count_positive'
    ) THEN
        ALTER TABLE job_postings
            ADD CONSTRAINT check_views_count_positive
            CHECK (views_count >= 0);
    END IF;
END $$;

-- 4. JOB_SKILLS TABLOSU (İlan - Yetkinlik Eşleştirme / M:N Junction)
CREATE TABLE IF NOT EXISTS job_skills (
    job_id BIGINT NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (job_id, skill_id)
);

-- 5. PERFORMANS İNDEKSLERİ (ddd.md Bölüm 5 ile uyumlu)
CREATE INDEX IF NOT EXISTS idx_job_postings_status_deadline ON job_postings (status, deadline);
CREATE INDEX IF NOT EXISTS idx_job_postings_category_location ON job_postings (category, location);
CREATE INDEX IF NOT EXISTS idx_job_postings_workplace_type ON job_postings (workplace_type, employment_type);
CREATE INDEX IF NOT EXISTS idx_job_postings_posted_by ON job_postings (posted_by);
CREATE INDEX IF NOT EXISTS idx_job_skills_skill ON job_skills (skill_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_job ON job_skills (job_id);

-- 6. OTOMATİK ZAMAN DAMGASI GÜNCELLEME TETİKLEYİCİSİ (TRIGGER)
CREATE OR REPLACE FUNCTION update_job_postings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS trg_job_postings_updated_at ON job_postings;
CREATE TRIGGER trg_job_postings_updated_at
    BEFORE UPDATE ON job_postings
    FOR EACH ROW
    EXECUTE FUNCTION update_job_postings_timestamp();

-- 7. VERİ SÖZLÜĞÜ AÇIKLAMALARI (PostgreSQL Metadata Documentation)
COMMENT ON TABLE job_postings IS 'Mezun Takip Sistemi Kariyer ve İş İlanları Tablosu (ddd.md Bölüm 3.6)';
COMMENT ON COLUMN job_postings.company_name IS 'İlanı veren firma / kurum adı';
COMMENT ON COLUMN job_postings.category IS 'İş alanı / sektör (Yazılım, Finans, Pazarlama, İK vb.)';
COMMENT ON COLUMN job_postings.employment_type IS 'İstihdam türü: full-time, part-time, contract, internship, freelance';
COMMENT ON COLUMN job_postings.workplace_type IS 'Çalışma modeli: remote, hybrid, on-site';
COMMENT ON COLUMN job_postings.experience_level IS 'Deneyim seviyesi: intern, entry, mid, senior, lead, executive';
COMMENT ON COLUMN job_postings.salary_min IS 'Minimum maaş skalası';
COMMENT ON COLUMN job_postings.salary_max IS 'Maksimum maaş skalası';
COMMENT ON COLUMN job_postings.is_salary_visible IS 'Maaş bilgisi mezunlara açık gösterilsin mi';
COMMENT ON COLUMN job_postings.status IS 'İlan durumu: draft, open, closed, archived';
COMMENT ON TABLE job_skills IS 'İş ilanlarının gerektirdiği teknik ve mesleki yetkinliklerin eşleştirme tablosu';

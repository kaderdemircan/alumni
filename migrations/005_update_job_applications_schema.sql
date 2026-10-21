-- ============================================================================
-- MIGRATION: 005_update_job_applications_schema.sql
-- DESCRIPTION: Data Design Documentation (ddd.md) ile birebir uyumlu;
--              job_applications tablosunun aday portföyü, beklenen maaş skalası,
--              ihbar süresi, mülakat tarihi, değerlendirme notları/puanı,
--              yaşam döngüsü durum kısıtları, tekil başvuru (unique) kısıtı,
--              performans indeksleri ve tetikleyiciler (triggers) ile güncellenmesi.
-- ============================================================================

-- 1. JOB_APPLICATIONS TABLOSUNUN VARLIĞINI GARANTİ ETME (Yoksa oluşturma)
CREATE TABLE IF NOT EXISTS job_applications (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_url VARCHAR(500),
    cover_letter TEXT,
    status VARCHAR(30) DEFAULT 'submitted',
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ddd.md DOSYASINDA TANIMLANAN YENİ ALANLARIN GÜVENLİ ŞEKİLDE EKLENMESİ
ALTER TABLE job_applications
    ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS expected_salary NUMERIC(12,2),
    ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'TRY',
    ADD COLUMN IF NOT EXISTS notice_period_days INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS review_notes TEXT,
    ADD COLUMN IF NOT EXISTS interview_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS feedback_score SMALLINT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Status kolonunun uzunluğunu güvenli şekilde genişletme (VARCHAR(30))
ALTER TABLE job_applications
    ALTER COLUMN status TYPE VARCHAR(30);

-- 3. VERİ BÜTÜNLÜĞÜ VE KISITLARI (CONSTRAINTS)
DO $$
BEGIN
    -- Tekil Başvuru Kısıtı (Aynı mezunun aynı ilana mükerrer başvuru yapmasını engelleme)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_job_application'
    ) THEN
        ALTER TABLE job_applications
            ADD CONSTRAINT unique_user_job_application
            UNIQUE (job_id, user_id);
    END IF;

    -- Başvuru Yaşam Döngüsü Durum Kontrolü
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_application_status'
    ) THEN
        ALTER TABLE job_applications
            ADD CONSTRAINT check_application_status
            CHECK (status IN (
                'submitted',
                'in_review',
                'interview_scheduled',
                'shortlisted',
                'offered',
                'accepted',
                'rejected',
                'withdrawn'
            ));
    END IF;

    -- Beklenen Maaş Pozitiflik Kontrolü
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_expected_salary_positive'
    ) THEN
        ALTER TABLE job_applications
            ADD CONSTRAINT check_expected_salary_positive
            CHECK (expected_salary IS NULL OR expected_salary >= 0);
    END IF;

    -- İhbar Süresi Pozitiflik Kontrolü
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_notice_period_positive'
    ) THEN
        ALTER TABLE job_applications
            ADD CONSTRAINT check_notice_period_positive
            CHECK (notice_period_days IS NULL OR notice_period_days >= 0);
    END IF;

    -- Değerlendirme Puanı Kontrolü (1 - 5 arası skala)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_feedback_score_range'
    ) THEN
        ALTER TABLE job_applications
            ADD CONSTRAINT check_feedback_score_range
            CHECK (feedback_score IS NULL OR (feedback_score >= 1 AND feedback_score <= 5));
    END IF;
END $$;

-- 4. PERFORMANS İNDEKSLERİ (ddd.md Bölüm 5 ile uyumlu)
CREATE INDEX IF NOT EXISTS idx_job_applications_job_status ON job_applications (job_id, status);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_applied ON job_applications (user_id, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications (status);
CREATE INDEX IF NOT EXISTS idx_job_applications_interview ON job_applications (interview_date) WHERE interview_date IS NOT NULL;

-- 5. OTOMATİK ZAMAN DAMGASI GÜNCELLEME TETİKLEYİCİSİ (TRIGGER)
CREATE OR REPLACE FUNCTION update_job_applications_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS trg_job_applications_updated_at ON job_applications;
CREATE TRIGGER trg_job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_job_applications_timestamp();

-- 6. VERİ SÖZLÜĞÜ AÇIKLAMALARI (DATA DICTIONARY COMMENTS)
COMMENT ON TABLE job_applications IS 'Mezunların kariyer iş ilanlarına yaptıkları başvurular ve işe alım süreci takibi.';
COMMENT ON COLUMN job_applications.job_id IS 'Başvurulan iş ilanı ID (job_postings.id).';
COMMENT ON COLUMN job_applications.user_id IS 'Başvuru yapan mezun/aday kullanıcı ID (users.id).';
COMMENT ON COLUMN job_applications.resume_url IS 'Adayın özgeçmiş (CV) dokümanına ait URL adresi.';
COMMENT ON COLUMN job_applications.cover_letter IS 'Adayın yazdığı ön yazı / motivasyon mektubu.';
COMMENT ON COLUMN job_applications.portfolio_url IS 'Adayın portföy, GitHub veya LinkedIn bağlantısı.';
COMMENT ON COLUMN job_applications.expected_salary IS 'Adayın talep ettiği aylık net/brüt ücret.';
COMMENT ON COLUMN job_applications.currency IS 'Beklenen maaşın para birimi (varsayılan: TRY).';
COMMENT ON COLUMN job_applications.notice_period_days IS 'Adayın mevcut işinden ayrılabilme süresi (gün).';
COMMENT ON COLUMN job_applications.status IS 'Başvuru süreci durumu (submitted, in_review, interview_scheduled, shortlisted, offered, accepted, rejected, withdrawn).';
COMMENT ON COLUMN job_applications.review_notes IS 'İK yetkilisinin veya işe alım ekibinin aday hakkındaki iç notları.';
COMMENT ON COLUMN job_applications.interview_date IS 'Aday için planlanan teknik/İK mülakat tarihi.';
COMMENT ON COLUMN job_applications.rejection_reason IS 'Başvuru olumsuz sonuçlandıysa adaya iletilen veya arşivlenen ret gerekçesi.';
COMMENT ON COLUMN job_applications.feedback_score IS 'Adayın değerlendirme skoru (1 ile 5 arasında).';
COMMENT ON COLUMN job_applications.applied_at IS 'Başvurunun sisteme kaydedildiği ilk tarih ve saat.';
COMMENT ON COLUMN job_applications.updated_at IS 'Başvuru kaydının veya durumunun son güncellenme zamanı.';

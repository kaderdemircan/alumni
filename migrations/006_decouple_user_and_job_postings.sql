-- ============================================================================
-- MIGRATION: 006_decouple_user_and_job_postings.sql
-- DESCRIPTION: Kullanıcı (users) ve iş ilanı (job_postings) arasındaki doğrudan
--              ilişkinin (posted_by FK) kaldırılması; kullanıcıların ilanlarla
--              yalnızca başvuru (job_applications) tablosu üzerinden bağlanması.
-- ============================================================================

-- 1. JOB_POSTINGS TABLOSUNDAN posted_by FOREIGN KEY KISITININ KALDIRILMASI
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'job_postings' 
          AND constraint_type = 'FOREIGN KEY'
          AND (constraint_name LIKE '%posted_by%' OR constraint_name = 'job_postings_posted_by_fkey')
    ) LOOP
        EXECUTE 'ALTER TABLE job_postings DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- 2. posted_by İNDEKSİNİN KALDIRILMASI
DROP INDEX IF EXISTS idx_job_postings_posted_by;

-- 3. posted_by KOLONUNUN job_postings TABLOSUNDAN KALDIRILMASI
ALTER TABLE job_postings 
    DROP COLUMN IF EXISTS posted_by;

-- 4. USERS İLE JOB_APPLICATIONS İLİŞKİSİNİN (user_id -> users.id) KORUNDUĞUNUN TEYİDİ
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'job_applications' 
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name = 'job_applications_user_id_fkey'
    ) THEN
        BEGIN
            ALTER TABLE job_applications
                ADD CONSTRAINT job_applications_user_id_fkey
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;

-- 5. VERİ SÖZLÜĞÜ AÇIKLAMALARI
COMMENT ON TABLE job_postings IS 'Şirketlerin bağımsız kurumsal iş ilanları. Kullanıcı (users) ile doğrudan bağlantısı yoktur; mezunlar ilanlara job_applications tablosu üzerinden bağlanır.';
COMMENT ON TABLE job_applications IS 'Mezun kullanıcıların (users) şirket ilanlarına (job_postings) yaptıkları iş başvuruları ve süreç yönetimi.';

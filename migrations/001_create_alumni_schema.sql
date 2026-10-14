-- ============================================================================
-- MIGRATION: 001_create_alumni_schema.sql
-- DESCRIPTION: Core Alumni tables, relations, constraints, and performance indexes
-- ============================================================================

-- 1. USERS TABLOSU (Çekirdek Kullanıcı / Mezun Varlığı)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    age INTEGER CHECK (age >= 0),
    birthday DATE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    phone VARCHAR(30),
    profile_image_url VARCHAR(500),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Türkiye',
    bio TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACADEMIC RECORDS TABLOSU (Eğitim ve Mezuniyet)
CREATE TABLE IF NOT EXISTS academic_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    degree_level VARCHAR(50) NOT NULL,
    faculty VARCHAR(150) NOT NULL,
    department VARCHAR(150) NOT NULL,
    student_number VARCHAR(50),
    start_year SMALLINT NOT NULL,
    graduation_year SMALLINT NOT NULL,
    gpa NUMERIC(3,2) CHECK (gpa >= 0.00 AND gpa <= 4.00)
);

-- 3. WORK EXPERIENCES TABLOSU (Kariyer ve İş Tecrübesi)
CREATE TABLE IF NOT EXISTS work_experiences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    position_title VARCHAR(150) NOT NULL,
    industry VARCHAR(100),
    location VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT
);

-- 4. SKILLS TABLOSU (Yetkinlik Tanımları)
CREATE TABLE IF NOT EXISTS skills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50)
);

-- 5. ALUMNI_SKILLS JUNCTION TABLOSU (M:N İlişki)
CREATE TABLE IF NOT EXISTS alumni_skills (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20) DEFAULT 'intermediate',
    PRIMARY KEY (user_id, skill_id)
);

-- 6. EVENTS TABLOSU (Mezun Etkinlikleri)
CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    organizer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'networking',
    location VARCHAR(255) NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    capacity INTEGER
);

-- 7. EVENT ATTENDEES TABLOSU (Etkinlik Katılımcıları)
CREATE TABLE IF NOT EXISTS event_attendees (
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rsvp_status VARCHAR(20) DEFAULT 'attending',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (event_id, user_id)
);

-- 8. JOB POSTINGS TABLOSU (İş & Staj İlanları)
CREATE TABLE IF NOT EXISTS job_postings (
    id BIGSERIAL PRIMARY KEY,
    posted_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    employment_type VARCHAR(30) DEFAULT 'full-time',
    location VARCHAR(100) NOT NULL,
    deadline DATE,
    status VARCHAR(20) DEFAULT 'open'
);

-- 9. JOB APPLICATIONS TABLOSU (İş Başvuruları)
CREATE TABLE IF NOT EXISTS job_applications (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    resume_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'submitted',
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MENTORSHIPS TABLOSU (Mentorluk İlişkileri)
CREATE TABLE IF NOT EXISTS mentorships (
    id BIGSERIAL PRIMARY KEY,
    mentor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentee_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT 'requested',
    start_date DATE,
    end_date DATE,
    CONSTRAINT check_different_users CHECK (mentor_id <> mentee_id)
);

-- 11. PRIVACY SETTINGS TABLOSU (KVKK / Gizlilik Tercihleri)
CREATE TABLE IF NOT EXISTS privacy_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    show_email BOOLEAN DEFAULT FALSE,
    show_phone BOOLEAN DEFAULT FALSE,
    show_work BOOLEAN DEFAULT TRUE,
    allow_mentorship_requests BOOLEAN DEFAULT TRUE
);

-- PERFORMANS İNDEKSLERİ
CREATE INDEX IF NOT EXISTS idx_academic_records_dept_grad ON academic_records (department, graduation_year);
CREATE INDEX IF NOT EXISTS idx_work_experiences_company ON work_experiences (company_name);
CREATE INDEX IF NOT EXISTS idx_job_postings_status_deadline ON job_postings (status, deadline);
CREATE INDEX IF NOT EXISTS idx_events_date ON events (event_date);

-- ============================================================================
-- ALUMNI TRACKING SYSTEM - DATABASE INITIALIZATION & MIGRATION SCRIPT
-- Auto-executed by PostgreSQL container on first startup (docker-entrypoint-initdb.d)
-- ============================================================================

-- 1. USERS & CORE SCHEMAS
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

CREATE TABLE IF NOT EXISTS skills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS alumni_skills (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20) DEFAULT 'intermediate',
    PRIMARY KEY (user_id, skill_id)
);

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

CREATE TABLE IF NOT EXISTS event_attendees (
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rsvp_status VARCHAR(20) DEFAULT 'attending',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS job_postings (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    company_logo_url VARCHAR(500),
    title VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Genel',
    description TEXT NOT NULL,
    requirements TEXT,
    benefits TEXT,
    employment_type VARCHAR(30) DEFAULT 'full-time',
    workplace_type VARCHAR(30) DEFAULT 'hybrid',
    experience_level VARCHAR(30) DEFAULT 'mid',
    location VARCHAR(150) NOT NULL,
    salary_min NUMERIC(12,2) CHECK (salary_min >= 0),
    salary_max NUMERIC(12,2),
    currency VARCHAR(3) DEFAULT 'TRY',
    is_salary_visible BOOLEAN DEFAULT FALSE,
    application_url VARCHAR(500),
    contact_email VARCHAR(255),
    deadline DATE,
    status VARCHAR(20) DEFAULT 'open',
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_salary_range CHECK (salary_max IS NULL OR salary_min IS NULL OR salary_max >= salary_min)
);

CREATE TABLE IF NOT EXISTS job_skills (
    job_id BIGINT NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (job_id, skill_id)
);

CREATE TABLE IF NOT EXISTS job_applications (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_url VARCHAR(500),
    cover_letter TEXT,
    portfolio_url VARCHAR(500),
    expected_salary NUMERIC(12,2) CHECK (expected_salary >= 0),
    currency VARCHAR(3) DEFAULT 'TRY',
    notice_period_days INTEGER DEFAULT 0 CHECK (notice_period_days >= 0),
    status VARCHAR(30) DEFAULT 'submitted',
    review_notes TEXT,
    interview_date TIMESTAMPTZ,
    rejection_reason TEXT,
    feedback_score SMALLINT CHECK (feedback_score >= 1 AND feedback_score <= 5),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_job_application UNIQUE (job_id, user_id),
    CONSTRAINT check_application_status CHECK (status IN ('submitted', 'in_review', 'interview_scheduled', 'shortlisted', 'offered', 'accepted', 'rejected', 'withdrawn'))
);

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

CREATE TABLE IF NOT EXISTS privacy_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    show_email BOOLEAN DEFAULT FALSE,
    show_phone BOOLEAN DEFAULT FALSE,
    show_work BOOLEAN DEFAULT TRUE,
    allow_mentorship_requests BOOLEAN DEFAULT TRUE
);

-- 2. ANNOUNCEMENTS SCHEMA
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

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_academic_records_dept_grad ON academic_records (department, graduation_year);
CREATE INDEX IF NOT EXISTS idx_work_experiences_company ON work_experiences (company_name);
CREATE INDEX IF NOT EXISTS idx_job_postings_status_deadline ON job_postings (status, deadline);
CREATE INDEX IF NOT EXISTS idx_job_postings_category_location ON job_postings (category, location);
CREATE INDEX IF NOT EXISTS idx_job_postings_workplace_type ON job_postings (workplace_type, employment_type);
CREATE INDEX IF NOT EXISTS idx_job_skills_skill ON job_skills (skill_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events (event_date);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements (category);
CREATE INDEX IF NOT EXISTS idx_announcements_date ON announcements (date);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_status ON job_applications (job_id, status);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_applied ON job_applications (user_id, applied_at DESC);

-- 4. SEED DATA
INSERT INTO users (name, surname, age, birthday, email, city, country, bio)
VALUES 
    ('Kader', 'Demircan', 24, '2000-05-15', 'kader@example.com', 'İstanbul', 'Türkiye', 'Bilgisayar Mühendisliği mezunu, Full Stack Developer.'),
    ('Ahmet', 'Yılmaz', 27, '1999-01-20', 'ahmet.yilmaz@example.com', 'Ankara', 'Türkiye', 'Yazılım Mimarı ve Açık Kaynak Geliştirici.'),
    ('Ayşe', 'Kaya', 25, '2001-08-10', 'ayse.kaya@example.com', 'İzmir', 'Türkiye', 'Veri Bilimci ve Yapay Zeka Araştırmacısı.')
ON CONFLICT (email) DO NOTHING;

INSERT INTO skills (name, category)
VALUES 
    ('JavaScript / Node.js', 'Yazılım Geliştirme'),
    ('Docker & Docker Compose', 'DevOps'),
    ('PostgreSQL', 'Veritabanı'),
    ('REST API Architecture', 'Backend')
ON CONFLICT (name) DO NOTHING;

INSERT INTO announcements (title, content, author, category, priority, date)
VALUES 
    ('2026 Mezunlar Buluşması Tarihi Belirlendi', 'Geleneksel yıllık mezunlar buluşmamız bu yıl 25 Ekim tarihinde ana kampüste gerçekleştirilecektir. Tüm mezunlarımız davetlidir.', 'Rektörlük Mezun Ofisi', 'Etkinlik', 'Önemli', '2026-10-10'),
    ('Kariyer ve Mentorluk Ağı Başvuruları Başladı', 'Genç mezunlarımıza kariyer yolculuklarında rehberlik etmek isteyen deneyimli mezunlarımız için mentorluk kayıtları açılmıştır.', 'Kariyer Merkezi', 'Kariyer', 'Normal', '2026-10-12')
ON CONFLICT DO NOTHING;

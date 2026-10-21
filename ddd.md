# Data Design Documentation (DDD) - Mezun Takip Sistemi

Bu döküman, **Mezun Takip Sistemi (Alumni Tracking System)** uygulamasının veritabanı mimarisini, veri modellerini, tablo şemalarını, ilişkilerini ve veri sözlüğünü (Data Dictionary) kapsamlı bir şekilde tanımlar.

---

## 📌 İçindekiler
1. [Sistem Genel Bakışı ve Veri Mimarisi](#1-sistem-genel-bak%C4%B1%C5%9F%C4%B1-ve-veri-mimarisi)
2. [Varlık-İlişki Diyagramı (ER Diagram)](#2-varl%C4%B1k-%C4%B0li%C5%9Fki-diyagram%C4%B1-er-diagram)
3. [Veri Sözlüğü ve Tablo Şemaları](#3-veri-s%C3%B6zl%C3%BC%C4%9F%C3%BC-ve-tablo-%C5%9Femalar%C4%B1)
   - [3.1. users (Kullanıcılar / Mezunlar)](#31-users-kullan%C4%B1c%C4%B1lar--mezunlar)
   - [3.2. academic_records (Eğitim ve Mezuniyet Bilgileri)](#32-academic_records-e%C4%9Fitim-ve-mezuniyet-bilgileri)
   - [3.3. work_experiences (İş Deneyimleri ve Kariyer)](#33-work_experiences-%C4%B0%C5%9F-deneyimleri-ve-kariyer)
   - [3.4. skills & alumni_skills (Yetkinlikler ve Eşleştirmeler)](#34-skills--alumni_skills-yetkinlikler-ve-e%C5%9Fle%C5%9Ftirmeler)
   - [3.5. events & event_attendees (Etkinlikler ve Katılım)](#35-events--event_attendees-etkinlikler-ve-kat%C4%B1l%C4%B1m)
   - [3.6. job_postings, job_skills & job_applications (Kariyer İlanları ve Başvurular)](#36-job_postings-job_skills--job_applications-kariyer-%C4%B0lanlar%C4%B1-ve-ba%C5%9Fvurular)
   - [3.7. mentorships (Mentorluk İlişkileri)](#37-mentorships-mentorluk-%C4%B0li%C5%9Fkileri)
   - [3.8. privacy_settings (Gizlilik ve KVKK Tercihleri)](#38-privacy_settings-gizlilik-ve-kvkk-tercihleri)
4. [İlişki Türleri ve Bütünlük Kuralları (Referential Integrity)](#4-%C4%B0li%C5%9Fki-t%C3%BCrleri-ve-b%C3%BCt%C3%BCnl%C3%BCk-kurallar%C4%B1)
5. [İndeksleme ve Performans Optimizasyonu](#5-%C4%B0ndeksleme-ve-performans-optimizasyonu)
6. [PostgreSQL DDL (Veritabanı Oluşturma Betiği)](#6-postgresql-ddl-veritaban%C4%B1-olu%C5%9Fturma-beti%C4%9Fi)

---

## 1. Sistem Genel Bakışı ve Veri Mimarisi

Mezun Takip Sistemi'nin veri katmanı, ilişkisel veritabanı yönetim sistemi (RDBMS) olarak **PostgreSQL** üzerinde çalışacak şekilde modellenmiştir.

### Temel Hedefler:
* **Veri Tutarlılığı (ACID):** Mezuniyet kayıtları, iş tecrübeleri ve iletişim bilgilerinde yüksek tutarlılık.
* **Normalize Yapı (3NF):** Veri tekrarını önlemek amacıyla 3. Normal Form (3NF) standartlarına uygun tasarım.
* **Esnek ve Modüler Genişleyebilirlik:** İş ilanları, mentorluk ve etkinlik modüllerinin çekirdek kullanıcı tablosuna gevşek bağlı (loosely coupled) entegrasyonu.
* **Gizlilik ve KVKK Uyumu:** Mezunların iletişim bilgilerinin diğer kullanıcılar tarafından ne ölçüde görüntülenebileceğini denetleyen granüler gizlilik kontrolü.

---

## 2. Varlık-İlişki Diyagramı (ER Diagram)

Aşağıdaki diyagram sistemdeki ana varlıkları ve aralarındaki cardinalite ilişkilerini gösterir:

```mermaid
erDiagram
    USERS ||--o{ ACADEMIC_RECORDS : "tamamlar"
    USERS ||--o{ WORK_EXPERIENCES : "sahiptir"
    USERS ||--o{ ALUMNI_SKILLS : "edinir"
    SKILLS ||--o{ ALUMNI_SKILLS : "gruplar"
    USERS ||--o{ EVENT_ATTENDEES : "katilir"
    EVENTS ||--o{ EVENT_ATTENDEES : "listeler"
    USERS ||--o{ JOB_APPLICATIONS : "basvurur"
    JOB_POSTINGS ||--o{ JOB_APPLICATIONS : "alır"
    USERS ||--o{ MENTORSHIPS : "mentor_olur"
    USERS ||--o{ MENTORSHIPS : "mentee_olur"
    USERS ||--|| PRIVACY_SETTINGS : "sahiptir"

    USERS {
        bigserial id PK
        varchar email UK
        varchar password_hash
        varchar first_name
        varchar last_name
        date birthday
        varchar phone
        varchar profile_image_url
        varchar city
        varchar country
        text bio
        varchar status
        timestamp created_at
        timestamp updated_at
    }

    ACADEMIC_RECORDS {
        bigserial id PK
        bigint user_id FK
        varchar degree_level
        varchar faculty
        varchar department
        varchar student_number
        smallint start_year
        smallint graduation_year
        numeric gpa
    }

    WORK_EXPERIENCES {
        bigserial id PK
        bigint user_id FK
        varchar company_name
        varchar position_title
        varchar industry
        varchar location
        date start_date
        date end_date
        boolean is_current
        text description
    }

    SKILLS {
        bigserial id PK
        varchar name UK
        varchar category
    }

    ALUMNI_SKILLS {
        bigint user_id PK,FK
        bigint skill_id PK,FK
        varchar proficiency_level
    }

    EVENTS {
        bigserial id PK
        bigint organizer_id FK
        varchar title
        text description
        varchar event_type
        varchar location
        timestamp event_date
        integer capacity
    }

    JOB_POSTINGS ||--o{ JOB_SKILLS : "gerektirir"
    SKILLS ||--o{ JOB_SKILLS : "eslestirir"

    EVENT_ATTENDEES {
        bigint event_id PK,FK
        bigint user_id PK,FK
        varchar rsvp_status
        timestamp registered_at
    }

    JOB_POSTINGS {
        bigserial id PK
        varchar company_name
        varchar company_logo_url
        varchar title
        varchar category
        text description
        text requirements
        text benefits
        varchar employment_type
        varchar workplace_type
        varchar experience_level
        varchar location
        numeric salary_min
        numeric salary_max
        varchar currency
        boolean is_salary_visible
        varchar application_url
        varchar contact_email
        date deadline
        varchar status
        boolean is_featured
        integer views_count
        timestamp created_at
        timestamp updated_at
    }

    JOB_SKILLS {
        bigint job_id PK,FK
        bigint skill_id PK,FK
        boolean is_mandatory
    }

    JOB_APPLICATIONS {
        bigserial id PK
        bigint job_id FK
        bigint user_id FK
        varchar resume_url
        text cover_letter
        varchar portfolio_url
        numeric expected_salary
        varchar currency
        integer notice_period_days
        varchar status
        text review_notes
        timestamp interview_date
        text rejection_reason
        smallint feedback_score
        timestamp applied_at
        timestamp updated_at
    }

    MENTORSHIPS {
        bigserial id PK
        bigint mentor_id FK
        bigint mentee_id FK
        varchar topic
        varchar status
        date start_date
        date end_date
    }

    PRIVACY_SETTINGS {
        bigserial id PK
        bigint user_id FK,UK
        boolean show_email
        boolean show_phone
        boolean show_work
        boolean allow_mentorship_requests
    }
```

---

## 3. Veri Sözlüğü ve Tablo Şemaları

### 3.1. `users` (Kullanıcılar / Mezunlar)
Sistemin çekirdek tablosudur. Kimlik doğrulama ve genel profil bilgilerini saklar.

| Kolon Adı | Veri Tipi | Kısıtlar (Constraints) | Açıklama |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Benzersiz kullanıcı kimliği. |
| `email` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE` | E-posta adresi (giriş için kullanılır). |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Güvenli hashlenmiş parola (bcrypt/argon2). |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | Mezunun adı. |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | Mezunun soyadı. |
| `birthday` | `DATE` | `NULL` | Doğum tarihi. |
| `phone` | `VARCHAR(30)` | `NULL` | İletişim telefon numarası. |
| `profile_image_url` | `VARCHAR(500)` | `NULL` | Profil fotoğrafı bağlantısı. |
| `city` | `VARCHAR(100)` | `NULL` | İkamet edilen şehir. |
| `country` | `VARCHAR(100)` | `DEFAULT 'Türkiye'` | İkamet edilen ülke. |
| `bio` | `TEXT` | `NULL` | Mezunun kendini tanıttığı özet metin. |
| `status` | `VARCHAR(20)` | `DEFAULT 'active'` | Durum: `active`, `pending_approval`, `suspended`. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Kayıt oluşturulma zamanı. |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Son güncelleme zamanı. |

---

### 3.2. `academic_records` (Eğitim ve Mezuniyet Bilgileri)
Mezunun üniversitede tamamladığı eğitim programlarını tutar. Bir mezunun birden fazla derecesi (Lisans, Yüksek Lisans vb.) olabilir (1:N).

| Kolon Adı | Veri Tipi | Kısıtlar | Açıklama |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Kayıt kimliği. |
| `user_id` | `BIGINT` | `NOT NULL`, `FK -> users(id) ON DELETE CASCADE` | İlgili mezun referansı. |
| `degree_level` | `VARCHAR(50)` | `NOT NULL` | Derece seviyesi: `Lisans`, `Yüksek Lisans`, `Doktora`, `Ön Lisans`. |
| `faculty` | `VARCHAR(150)` | `NOT NULL` | Fakülte adı (örn. Mühendislik Fakültesi). |
| `department` | `VARCHAR(150)` | `NOT NULL` | Bölüm / Program (örn. Bilgisayar Mühendisliği). |
| `student_number` | `VARCHAR(50)` | `NULL` | Üniversite öğrenci numarası. |
| `start_year` | `SMALLINT` | `NOT NULL` | Başlangıç yılı (örn. 2018). |
| `graduation_year`| `SMALLINT` | `NOT NULL` | Mezuniyet yılı (örn. 2022). |
| `gpa` | `NUMERIC(3,2)` | `CHECK (gpa >= 0.00 AND gpa <= 4.00)` | Mezuniyet not ortalaması (4.00 üzerinden). |

---

### 3.3. `work_experiences` (İş Deneyimleri ve Kariyer)
Mezunların profesyonel kariyer geçmişlerini ve güncel iş pozisyonlarını takip eder (1:N).

| Kolon Adı | Veri Tipi | Kısıtlar | Açıklama |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Deneyim kaydı kimliği. |
| `user_id` | `BIGINT` | `NOT NULL`, `FK -> users(id) ON DELETE CASCADE` | İlgili mezun referansı. |
| `company_name` | `VARCHAR(200)` | `NOT NULL` | Kurum / Şirket adı. |
| `position_title` | `VARCHAR(150)` | `NOT NULL` | Görev / Unvan (örn. Senior Software Engineer). |
| `industry` | `VARCHAR(100)` | `NULL` | Sektör (Bilişim, Finans, Sağlık vb.). |
| `location` | `VARCHAR(100)` | `NULL` | Çalışılan şehir / ülke. |
| `start_date` | `DATE` | `NOT NULL` | İşe başlama tarihi. |
| `end_date` | `DATE` | `NULL` | Ayrılma tarihi (`is_current = true` ise NULL olabilir). |
| `is_current` | `BOOLEAN` | `DEFAULT FALSE` | Şu an bu görevde çalışıyor mu? |
| `description` | `TEXT` | `NULL` | Görev sorumlulukları ve detayları. |

---

### 3.4. `skills` & `alumni_skills` (Yetkinlikler ve Eşleştirmeler)
Mezunların sahip olduğu teknik ve sosyal yetkinlikleri çoktan çoğa (M:N) ilişkide yönetir.

#### `skills` Tablosu
| Kolon Adı | Veri Tipi | Kısıtlar | Açıklama |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Yetkinlik kimliği. |
| `name` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Yetkinlik adı (örn. `Node.js`, `Docker`, `Proje Yönetimi`). |
| `category` | `VARCHAR(50)` | `NULL` | Kategori (Yazılım, Tasarım, Dil, Yönetim vb.). |

#### `alumni_skills` (Junction Tablosu)
| Kolon Adı | Veri Tipi | Kısıtlar | Açıklama |
| :--- | :--- | :--- | :--- |
| `user_id` | `BIGINT` | `NOT NULL`, `FK -> users(id) ON DELETE CASCADE` | Mezun ID. |
| `skill_id` | `BIGINT` | `NOT NULL`, `FK -> skills(id) ON DELETE CASCADE` | Yetkinlik ID. |
| `proficiency_level`| `VARCHAR(20)` | `DEFAULT 'intermediate'` | Seviye: `beginner`, `intermediate`, `advanced`, `expert`. |

*Birleşik Birincil Anahtar (Composite PK):* `(user_id, skill_id)`

---

### 3.5. `events` & `event_attendees` (Etkinlikler ve Katılım)
Üniversite veya mezun derneği tarafından düzenlenen buluşmalar, seminerler ve paneller.

#### `events` Tablosu
| Kolon Adı | Veri Tipi | Kısıtlar | Açıklama |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Etkinlik kimliği. |
| `organizer_id` | `BIGINT` | `FK -> users(id) ON DELETE SET NULL` | Etkinliği oluşturan mezun/yönetici. |
| `title` | `VARCHAR(255)` | `NOT NULL` | Etkinlik başlığı. |
| `description` | `TEXT` | `NULL` | Etkinlik detayları ve program. |
| `event_type` | `VARCHAR(50)` | `DEFAULT 'networking'` | Tür: `reunion`, `webinar`, `workshop`, `social`. |
| `location` | `VARCHAR(255)` | `NOT NULL` | Fiziksel adres veya online bağlantı linki. |
| `event_date` | `TIMESTAMPTZ` | `NOT NULL` | Etkinlik başlangıç zamanı. |
| `capacity` | `INTEGER` | `NULL` | Maksimum katılımcı kontenjanı. |

#### `event_attendees` (Katılım Tablosu)
| Kolon Adı | Veri Tipi | Kısıtlar | Açıklama |
| :--- | :--- | :--- | :--- |
| `event_id` | `BIGINT` | `NOT NULL`, `FK -> events(id) ON DELETE CASCADE` | Etkinlik ID. |
| `user_id` | `BIGINT` | `NOT NULL`, `FK -> users(id) ON DELETE CASCADE` | Katılımcı mezun ID. |
| `rsvp_status` | `VARCHAR(20)` | `DEFAULT 'attending'` | Durum: `attending`, `interested`, `cancelled`. |
| `registered_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Kayıt tarihi. |

*Birleşik Birincil Anahtar (Composite PK):* `(event_id, user_id)`

---

### 3.6. `job_postings`, `job_skills` & `job_applications` (Kariyer İlanları ve Başvurular)
Kariyer havuzundaki şirketlerin bağımsız iş ilanları, aranan yetkinlikler ve mezunların bu ilanlara yaptıkları başvurular. İlanlar doğrudan şirket/pozisyon bazlı yönetilir; mezunlar iş ilanlarına doğrudan `job_applications` üzerinden bağlanır.

#### `job_postings` Tablosu
| Kolon Adı | Veri Tipi | Kısıtlar | Açıklama |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Benzersiz iş ilanı kimliği. |
| `company_name` | `VARCHAR(200)` | `NOT NULL` | İlan sahibi kurum / şirket adı. |
| `company_logo_url` | `VARCHAR(500)` | `NULL` | Şirket logosu görsel URL bağlantısı. |
| `title` | `VARCHAR(150)` | `NOT NULL` | Pozisyon / İlan başlığı (örn. Senior Full Stack Engineer). |
| `category` | `VARCHAR(100)` | `NOT NULL` | Sektör / İş alanı (Yazılım, Veri Bilimi, Finans, Pazarlama, İK vb.). |
| `description` | `TEXT` | `NOT NULL` | Pozisyon tanımı, temel sorumluluklar ve rol kapsamı. |
| `requirements` | `TEXT` | `NULL` | Aranan teknik/sosyal nitelikler ve mezuniyet kriterleri. |
| `benefits` | `TEXT` | `NULL` | Yan haklar (Özel sağlık sigortası, yemek kartı, yol, eğitim fonu vb.). |
| `employment_type` | `VARCHAR(30)` | `DEFAULT 'full-time'` | İstihdam türü: `full-time`, `part-time`, `contract`, `internship`, `freelance`. |
| `workplace_type` | `VARCHAR(30)` | `DEFAULT 'hybrid'` | Çalışma modeli: `remote` (uzaktan), `hybrid` (hibrit), `on-site` (ofisten). |
| `experience_level`| `VARCHAR(30)` | `DEFAULT 'mid'` | Deneyim seviyesi: `intern`, `entry`, `mid`, `senior`, `lead`, `executive`. |
| `location` | `VARCHAR(150)` | `NOT NULL` | Şehir / Ülke bilgisi veya `Remote / Türkiye Geneli`. |
| `salary_min` | `NUMERIC(12,2)` | `CHECK (salary_min >= 0)` | Minimum maaş / bütçe aralığı (isteğe bağlı). |
| `salary_max` | `NUMERIC(12,2)` | `CHECK (salary_max >= salary_min)` | Maksimum maaş skalası (isteğe bağlı). |
| `currency` | `VARCHAR(3)` | `DEFAULT 'TRY'` | Para birimi: `TRY`, `USD`, `EUR`, `GBP`. |
| `is_salary_visible`| `BOOLEAN` | `DEFAULT FALSE` | Maaş aralığı mezunlara açıkça gösterilsin mi? |
| `application_url` | `VARCHAR(500)` | `NULL` | Harici başvuru bağlantısı (LinkedIn, Kariyer.net, Şirket Portalı). |
| `contact_email` | `VARCHAR(255)` | `NULL` | İlan başvuru/soru iletişim e-posta adresi. |
| `deadline` | `DATE` | `NULL` | Son başvuru tarihi. |
| `status` | `VARCHAR(20)` | `DEFAULT 'open'` | İlan yayın durumu: `draft` (taslak), `open` (aktif), `closed` (kapandı), `archived` (arşiv). |
| `is_featured` | `BOOLEAN` | `DEFAULT FALSE` | Vitrinde / öne çıkanlarda listelenme durumu. |
| `views_count` | `INTEGER` | `DEFAULT 0`, `CHECK (views_count >= 0)` | İlan görüntülenme / sayaç istatistiği. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | İlanın oluşturulma zaman damgası. |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | İlanın son güncellenme zaman damgası. |

#### `job_skills` Tablosu (İlan - Yetkinlik Eşleştirme)
İş ilanlarının gerektirdiği teknik ve mesleki yetkinlikleri `skills` tablosuyla çoktan-çoğa (M:N) ilişkilendirir. Mezunların profil yetkinlikleriyle ilanların otomatik eşleştirilmesini sağlar.

| Kolon Adı | Veri Tipi | Kısıtlar | Açıklama |
| :--- | :--- | :--- | :--- |
| `job_id` | `BIGINT` | `NOT NULL`, `FK -> job_postings(id) ON DELETE CASCADE` | İlgili iş ilanı. |
| `skill_id` | `BIGINT` | `NOT NULL`, `FK -> skills(id) ON DELETE CASCADE` | İstenen yetkinlik. |
| `is_mandatory` | `BOOLEAN` | `DEFAULT TRUE` | Zorunlu yetkinlik mi (`true`) yoksa tercih sebebi mi (`false`). |

*Birleşik Birincil Anahtar (Composite PK):* `(job_id, skill_id)`

#### `job_applications` Tablosu
| Kolon Adı | Veri Tipi | Kısıtlar | Açıklama |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Başvuru benzersiz kimliği. |
| `job_id` | `BIGINT` | `NOT NULL`, `FK -> job_postings(id) ON DELETE CASCADE` | İlgili iş ilanı referansı. |
| `user_id` | `BIGINT` | `NOT NULL`, `FK -> users(id) ON DELETE CASCADE` | Başvuran mezun referansı. |
| `resume_url` | `VARCHAR(500)` | `NULL` | Özgeçmiş (CV) doküman bağlantısı. |
| `cover_letter` | `TEXT` | `NULL` | Ön yazı / niyet mektubu. |
| `portfolio_url` | `VARCHAR(500)` | `NULL` | Portföy/GitHub/LinkedIn web bağlantısı. |
| `expected_salary` | `NUMERIC(12,2)` | `NULL`, `CHECK (expected_salary >= 0)` | Adayın beklediği aylık net/brüt ücret. |
| `currency` | `VARCHAR(3)` | `DEFAULT 'TRY'` | Para birimi (`TRY`, `USD`, `EUR`, `GBP`). |
| `notice_period_days` | `INTEGER` | `DEFAULT 0`, `CHECK (notice_period_days >= 0)` | İhbar süresi (gün cinsinden). |
| `status` | `VARCHAR(30)` | `DEFAULT 'submitted'` | Başvuru süreci durumu: `submitted`, `in_review`, `interview_scheduled`, `shortlisted`, `offered`, `accepted`, `rejected`, `withdrawn`. |
| `review_notes` | `TEXT` | `NULL` | İK ve ilan sahibi değerlendirme / mülakat notları. |
| `interview_date` | `TIMESTAMPTZ` | `NULL` | Planlanan mülakat tarihi ve saati. |
| `rejection_reason` | `TEXT` | `NULL` | Reddedilme gerekçesi / adaya iletilen geri bildirim. |
| `feedback_score` | `SMALLINT` | `NULL`, `CHECK (feedback_score >= 1 AND feedback_score <= 5)` | Aday değerlendirme puanı (1-5 arası). |
| `applied_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Başvuru yapılma zamanı. |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Son durum / kayıt güncelleme zamanı. |

*Benzersizlik Kısıtı (Unique Constraint):* `CONSTRAINT unique_user_job_application UNIQUE (job_id, user_id)`
*Açıklama:* Bir mezun aynı ilana birden fazla aktif başvuru gönderemez; mükerrer başvuru veritabanı seviyesinde engellenir.

---

### 3.7. `mentorships` (Mentorluk İlişkileri)
Tecrübeli mezunların yeni mezunlara veya öğrencilere rehberlik ettiği mentorluk modülü.

| Kolon Adı | Veri Tipi | Kısıtlar | Açıklama |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Mentorluk eşleşme kimliği. |
| `mentor_id` | `BIGINT` | `NOT NULL`, `FK -> users(id) ON DELETE CASCADE` | Mentor rolündeki mezun. |
| `mentee_id` | `BIGINT` | `NOT NULL`, `FK -> users(id) ON DELETE CASCADE` | Rehberlik alan mezun/öğrenci. |
| `topic` | `VARCHAR(200)` | `NOT NULL` | Mentorluk alanı / konusu (Kariyer Geçişi, Yurt Dışı vb.). |
| `status` | `VARCHAR(20)` | `DEFAULT 'requested'` | Durum: `requested`, `active`, `completed`, `declined`. |
| `start_date` | `DATE` | `NULL` | Program başlangıç tarihi. |
| `end_date` | `DATE` | `NULL` | Program bitiş tarihi. |

---

### 3.8. `privacy_settings` (Gizlilik ve KVKK Tercihleri)
Her mezunun kişisel profilinde hangi verilerin rehberde açık olacağını belirleyen 1:1 ayar tablosu.

| Kolon Adı | Veri Tipi | Kısıtlar | Açıklama |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Ayar kaydı kimliği. |
| `user_id` | `BIGINT` | `NOT NULL`, `UNIQUE`, `FK -> users(id) ON DELETE CASCADE` | İlgili mezun referansı (Bire-bir ilişki). |
| `show_email` | `BOOLEAN` | `DEFAULT FALSE` | E-postayı diğer mezunlara göster. |
| `show_phone` | `BOOLEAN` | `DEFAULT FALSE` | Telefon numarasını rehberde göster. |
| `show_work` | `BOOLEAN` | `DEFAULT TRUE` | Çalıştığı kurum ve unvanı göster. |
| `allow_mentorship_requests` | `BOOLEAN` | `DEFAULT TRUE` | Mentorluk talebi kabul et. |

---

## 4. İlişki Türleri ve Bütünlük Kuralları

* **Cascade Silme (ON DELETE CASCADE):**
  Bir mezun (`users`) silindiğinde; ona ait tüm `academic_records`, `work_experiences`, `alumni_skills`, `job_applications` ve `privacy_settings` kayıtları ilişkisel bütünlük gereği otomatik olarak temizlenir. Bir iş ilanı (`job_postings`) silindiğinde ise ilana bağlı tüm `job_applications` ve `job_skills` kayıtları otomatik silinir. İş ilanları doğrudan bireysel kullanıcıya bağlı olmayıp bağımsız kurumsal ilanlardır; mezunlar iş ilanlarıyla doğrudan `job_applications` başvuruları üzerinden bağlanır.
* **Yetim Kayıt Önleme (ON DELETE SET NULL):**
  Bir etkinlik organizatörü hesabı silinirse, etkinlik kaybolmaz; sadece `events.organizer_id` değeri `NULL` yapılır.
* **Maaş Skalası ve Değer Doğrulama (Domain Integrity):**
  `job_postings` tablosunda `salary_min >= 0` ve `salary_max >= salary_min` kontrolleri `CHECK` kısıtıyla garanti altına alınır.
* **Tekil Başvuru Bütünlüğü (Unique Application Constraint):**
  Bir mezunun aynı iş ilanına mükerrer başvuru yapmasını engellemek amacıyla `(job_id, user_id)` üzerinde `UNIQUE` kısıtı (`unique_user_job_application`) uygulanır.
* **Başvuru Yaşam Döngüsü ve Değerlendirme Kısıtları:**
  `job_applications` tablosunda `status` alanı tanımlı durumlarla (`submitted`, `in_review`, `interview_scheduled`, `shortlisted`, `offered`, `accepted`, `rejected`, `withdrawn`) sınırlandırılır; `expected_salary >= 0`, `notice_period_days >= 0` ve `feedback_score BETWEEN 1 AND 5` kontrolleri `CHECK` ile güvenceye alınır.
* **Kendine Referans & Rol Ayrımı (Self-Referential Logic):**
  `mentorships` tablosundaki `mentor_id` ve `mentee_id` alanlarının ikisi de `users(id)` anahtarına bağlanır. Bir kullanıcının kendisinin mentoru olmasını engellemek için `CHECK (mentor_id <> mentee_id)` kuralı uygulanır.

---

## 5. İndeksleme ve Performans Optimizasyonu

Sık yapılan arama ve filtreleme operasyonlarında veritabanı yanıt sürelerini milisaniye seviyesinde tutmak için aşağıdaki B-Tree indeksler tasarlanmıştır:

1. **`users(email)`:** Giriş işlemlerinde ve tekillik kontrolünde anlık arama (Unique Index).
2. **`academic_records(department, graduation_year)`:** "2020 yılı Bilgisayar Mühendisliği mezunları" gibi filtrelemeler için birleşik indeks (Composite Index).
3. **`work_experiences(company_name)`:** "X şirketinde çalışan mezunları bul" sorguları için indeks.
4. **`job_postings(status, deadline)`:** Açık ilanların süresine göre listelenmesi için filtreleme indeksi.
5. **`job_postings(category, location)`:** Sektör ve şehir bazlı kariyer ilan aramaları için birleşik indeks.
6. **`job_postings(workplace_type, employment_type)`:** "Remote & Full-time" gibi çalışma modeli filtreleme indeksi.
7. **`job_skills(skill_id)`:** Yetkinlik bazlı iş ilanı ve mezun eşleştirme sorguları için ters indeks.
8. **`event_attendees(user_id)` & `event_attendees(event_id)`:** Katılımcı ve etkinlik bazlı hızlı sorgulama.
9. **`job_applications(job_id, status)`:** Bir ilana gelen başvuruların aşamalarına göre hızlı filtrelenmesi için birleşik indeks.
10. **`job_applications(user_id, applied_at DESC)`:** Mezunun kendi başvuru geçmişini kronolojik listeleme indeksi.

---

## 6. PostgreSQL DDL (Veritabanı Oluşturma Betiği)

Aşağıdaki SQL betiği, yukarıda tanımlanan mimariyi PostgreSQL üzerinde doğrudan ayağa kaldırmak için kullanılabilir:

```sql
-- 1. USERS TABLOSU
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birthday DATE,
    phone VARCHAR(30),
    profile_image_url VARCHAR(500),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Türkiye',
    bio TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACADEMIC RECORDS TABLOSU
CREATE TABLE academic_records (
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

-- 3. WORK EXPERIENCES TABLOSU
CREATE TABLE work_experiences (
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

-- 4. SKILLS TABLOSU
CREATE TABLE skills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50)
);

-- 5. ALUMNI_SKILLS JUNCTION TABLOSU
CREATE TABLE alumni_skills (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20) DEFAULT 'intermediate',
    PRIMARY KEY (user_id, skill_id)
);

-- 6. EVENTS TABLOSU
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    organizer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'networking',
    location VARCHAR(255) NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    capacity INTEGER
);

-- 7. EVENT ATTENDEES TABLOSU
CREATE TABLE event_attendees (
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rsvp_status VARCHAR(20) DEFAULT 'attending',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (event_id, user_id)
);

-- 8. JOB POSTINGS TABLOSU (Kariyer & İş İlanları)
CREATE TABLE job_postings (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    company_logo_url VARCHAR(500),
    title VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
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

-- 9. JOB SKILLS TABLOSU (İlan - Yetkinlik Eşleştirme)
CREATE TABLE job_skills (
    job_id BIGINT NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (job_id, skill_id)
);

-- 10. JOB APPLICATIONS TABLOSU
CREATE TABLE job_applications (
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

-- 11. MENTORSHIPS TABLOSU
CREATE TABLE mentorships (
    id BIGSERIAL PRIMARY KEY,
    mentor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentee_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT 'requested',
    start_date DATE,
    end_date DATE,
    CONSTRAINT check_different_users CHECK (mentor_id <> mentee_id)
);

-- 12. PRIVACY SETTINGS TABLOSU
CREATE TABLE privacy_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    show_email BOOLEAN DEFAULT FALSE,
    show_phone BOOLEAN DEFAULT FALSE,
    show_work BOOLEAN DEFAULT TRUE,
    allow_mentorship_requests BOOLEAN DEFAULT TRUE
);

-- PERFORMANS İNDEKSLERİ
CREATE INDEX idx_academic_records_dept_grad ON academic_records (department, graduation_year);
CREATE INDEX idx_work_experiences_company ON work_experiences (company_name);
CREATE INDEX idx_job_postings_status_deadline ON job_postings (status, deadline);
CREATE INDEX idx_job_postings_category_location ON job_postings (category, location);
CREATE INDEX idx_job_postings_workplace_type ON job_postings (workplace_type, employment_type);
CREATE INDEX idx_job_skills_skill ON job_skills (skill_id);
CREATE INDEX idx_events_date ON events (event_date);
CREATE INDEX idx_job_applications_job_status ON job_applications (job_id, status);
CREATE INDEX idx_job_applications_user_applied ON job_applications (user_id, applied_at DESC);
```

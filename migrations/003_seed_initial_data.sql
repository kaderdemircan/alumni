-- ============================================================================
-- MIGRATION: 003_seed_initial_data.sql
-- DESCRIPTION: Initial seed data for users, skills, and announcements
-- ============================================================================

-- Örnek Kullanıcılar (Mezunlar)
INSERT INTO users (name, surname, age, birthday, email, city, country, bio)
VALUES 
    ('Kader', 'Demircan', 24, '2000-05-15', 'kader@example.com', 'İstanbul', 'Türkiye', 'Bilgisayar Mühendisliği mezunu, Full Stack Developer.'),
    ('Ahmet', 'Yılmaz', 27, '1999-01-20', 'ahmet.yilmaz@example.com', 'Ankara', 'Türkiye', 'Yazılım Mimarı ve Açık Kaynak Geliştirici.'),
    ('Ayşe', 'Kaya', 25, '2001-08-10', 'ayse.kaya@example.com', 'İzmir', 'Türkiye', 'Veri Bilimci ve Yapay Zeka Araştırmacısı.')
ON CONFLICT (email) DO NOTHING;

-- Örnek Yetkinlikler
INSERT INTO skills (name, category)
VALUES 
    ('JavaScript / Node.js', 'Yazılım Geliştirme'),
    ('Docker & Docker Compose', 'DevOps'),
    ('PostgreSQL', 'Veritabanı'),
    ('REST API Architecture', 'Backend')
ON CONFLICT (name) DO NOTHING;

-- Örnek Duyurular
INSERT INTO announcements (title, content, author, category, priority, date)
VALUES 
    ('2026 Mezunlar Buluşması Tarihi Belirlendi', 'Geleneksel yıllık mezunlar buluşmamız bu yıl 25 Ekim tarihinde ana kampüste gerçekleştirilecektir. Tüm mezunlarımız davetlidir.', 'Rektörlük Mezun Ofisi', 'Etkinlik', 'Önemli', '2026-10-10'),
    ('Kariyer ve Mentorluk Ağı Başvuruları Başladı', 'Genç mezunlarımıza kariyer yolculuklarında rehberlik etmek isteyen deneyimli mezunlarımız için mentorluk kayıtları açılmıştır.', 'Kariyer Merkezi', 'Kariyer', 'Normal', '2026-10-12')
ON CONFLICT DO NOTHING;

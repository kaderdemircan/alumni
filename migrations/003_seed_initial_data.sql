-- ============================================================================
-- AUTO-GENERATED DATABASE SEED SCRIPT (via DatabaseSeeder)
-- Generated At: 2026-10-14T07:51:01.922Z
-- ============================================================================

-- SEED USERS
INSERT INTO users (name, surname, age, birthday, email, city) VALUES ('Elif', 'Yavuz', 34, '1992-02-16', 'elif.yavuz51@example.com', 'Gaziantep') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, surname, age, birthday, email, city) VALUES ('Cem', 'Koç', 27, '1999-04-27', 'cem.koc68@example.com', 'Gaziantep') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, surname, age, birthday, email, city) VALUES ('Büşra', 'Aydın', 31, '1995-08-12', 'busra.aydin81@example.com', 'İzmir') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, surname, age, birthday, email, city) VALUES ('Melis', 'Kılıç', 26, '2000-04-21', 'melis.kilic77@example.com', 'Bursa') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, surname, age, birthday, email, city) VALUES ('Zeynep', 'Arslan', 24, '2002-02-18', 'zeynep.arslan97@example.com', 'Gaziantep') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, surname, age, birthday, email, city) VALUES ('Berk', 'Tekin', 26, '2000-08-11', 'berk.tekin66@example.com', 'Bursa') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, surname, age, birthday, email, city) VALUES ('Oğuz', 'Kılıç', 25, '2001-06-06', 'oguz.kilic48@example.com', 'İzmir') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, surname, age, birthday, email, city) VALUES ('Burak', 'Güneş', 32, '1994-07-21', 'burak.gunes82@example.com', 'Gaziantep') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, surname, age, birthday, email, city) VALUES ('Berk', 'Yıldız', 29, '1997-01-16', 'berk.yildiz42@example.com', 'İzmir') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, surname, age, birthday, email, city) VALUES ('Can', 'Yavuz', 32, '1994-05-17', 'can.yavuz72@example.com', 'Eskişehir') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, surname, age, birthday, email, city) VALUES ('Zeynep', 'Erdoğan', 27, '1999-02-03', 'zeynep.erdogan40@example.com', 'Eskişehir') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, surname, age, birthday, email, city) VALUES ('Elif', 'Polat', 33, '1993-10-27', 'elif.polat80@example.com', 'Bursa') ON CONFLICT (email) DO NOTHING;

-- SEED ANNOUNCEMENTS
INSERT INTO announcements (title, content, author, category, priority, date) VALUES ('2026 Mezunlar Buluşması Tarihi Belirlendi', 'Geleneksel yıllık mezunlar buluşmamız bu yıl 25 Ekim tarihinde ana kampüste gerçekleştirilecektir. Tüm mezunlarımız davetlidir.', 'Rektörlük Mezun Ofisi', 'Etkinlik', 'Önemli', '2026-08-27') ON CONFLICT DO NOTHING;
INSERT INTO announcements (title, content, author, category, priority, date) VALUES ('Yapay Zeka ve Büyük Veri Webinarı', 'Sektörün öncü mezunlarının katılacağı çevrimiçi yapay zeka paneli bu perşembe saat 20:00 de gerçekleştirilecektir.', 'Mühendislik Fakültesi', 'Akademik', 'Normal', '2026-12-24') ON CONFLICT DO NOTHING;
INSERT INTO announcements (title, content, author, category, priority, date) VALUES ('Yapay Zeka ve Büyük Veri Webinarı', 'Sektörün öncü mezunlarının katılacağı çevrimiçi yapay zeka paneli bu perşembe saat 20:00 de gerçekleştirilecektir.', 'Mühendislik Fakültesi', 'Akademik', 'Normal', '2026-08-21') ON CONFLICT DO NOTHING;
INSERT INTO announcements (title, content, author, category, priority, date) VALUES ('Start-up ve Girişimcilik Fonu Açıldı', 'Kendi şirketini kurmak isteyen mezunlarımız için kuluçka merkezi hibe ve mentorluk destek programı duyurulmuştur.', 'Teknoloji Transfer Ofisi', 'Kariyer', 'Önemli', '2026-12-17') ON CONFLICT DO NOTHING;
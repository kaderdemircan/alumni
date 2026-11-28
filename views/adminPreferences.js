const labels = {
    en: {
        panel: 'Admin Panel', overview: 'Overview', dashboard: 'Dashboard', manage: 'Manage',
        users: 'Users', announcements: 'Announcements', jobs: 'Jobs', review: 'Alumni Review',
        profile: 'My Profile', settings: 'Settings', back: 'Back to Site', logout: 'Sign Out',
        reviewHelp: 'Check the application details against university records before approving.',
        none: 'There are no pending alumni applications.', approved: 'Alumni account approved.',
        deleted: 'Application and account deleted.', changed: 'This application has already been reviewed.',
        approve: 'Approve', remove: 'Delete Account', confirm: 'Permanently delete this application and account?',
        details: 'Graduation details', name: 'Name', email: 'Email', role: 'Role',
        administrator: 'Administrator', city: 'City', birthday: 'Birthday', language: 'Language',
        theme: 'Theme', light: 'Light', dark: 'Dark', save: 'Save Settings', saved: 'Settings saved.',
        invalid: 'Choose a supported language and theme.', queue: 'Review pending applications',
        totalUsers: 'Total Users', applications: 'Applications', roleBreakdown: 'Role Breakdown',
        recentUsers: 'Recent Users', total: 'Total', allRoles: 'All accounts', posted: 'Published',
        activeOpen: 'Job board', submitted: 'Submitted'
    },
    tr: {
        panel: 'Yönetim Paneli', overview: 'Genel Bakış', dashboard: 'Kontrol Paneli', manage: 'Yönetim',
        users: 'Kullanıcılar', announcements: 'Duyurular', jobs: 'İş İlanları', review: 'Mezun Başvuruları',
        profile: 'Profilim', settings: 'Ayarlar', back: 'Siteye Dön', logout: 'Çıkış Yap',
        reviewHelp: 'Onaylamadan önce başvuru bilgilerini üniversite kayıtlarıyla karşılaştırın.',
        none: 'Bekleyen mezun başvurusu yok.', approved: 'Mezun hesabı onaylandı.',
        deleted: 'Başvuru ve hesap silindi.', changed: 'Bu başvuru daha önce incelenmiş.',
        approve: 'Onayla', remove: 'Hesabı Sil', confirm: 'Bu başvuru ve hesap kalıcı olarak silinsin mi?',
        details: 'Mezuniyet bilgileri', name: 'Ad Soyad', email: 'E-posta', role: 'Rol',
        administrator: 'Yönetici', city: 'Şehir', birthday: 'Doğum Tarihi', language: 'Dil',
        theme: 'Görünüm', light: 'Açık', dark: 'Koyu', save: 'Ayarları Kaydet', saved: 'Ayarlar kaydedildi.',
        invalid: 'Desteklenen bir dil ve görünüm seçin.', queue: 'Bekleyen başvuruları incele',
        totalUsers: 'Toplam Kullanıcı', applications: 'Başvurular', roleBreakdown: 'Rollere Göre Dağılım',
        recentUsers: 'Son Kullanıcılar', total: 'Toplam', allRoles: 'Tüm hesaplar', posted: 'Yayımlandı',
        activeOpen: 'İlan panosu', submitted: 'Gönderildi'
    }
};

function adminPreferences({ language, theme }) {
    return { language, theme, t: labels[language] };
}

module.exports = adminPreferences;

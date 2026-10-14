/**
 * Factory Data Helpers
 * Provides lightweight helper utilities for generating realistic mock data
 * without external third-party dependencies.
 */

const firstNames = [
    'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Emre', 'Zeynep', 'Can', 'Burak', 
    'Elif', 'Selin', 'Berk', 'Deniz', 'Cem', 'Kader', 'Murat', 'Yasemin',
    'Eren', 'Ece', 'Oğuz', 'Gizem', 'Tolga', 'Melis', 'Onur', 'Büşra'
];

const lastNames = [
    'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Demircan', 'Aydın',
    'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç',
    'Kurt', 'Öztürk', 'Güneş', 'Aksoy', 'Polat', 'Erdoğan', 'Yavuz', 'Tekin'
];

const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Kocaeli', 'Eskişehir', 'Gaziantep'];

const companies = [
    'Google', 'Microsoft', 'Trendyol', 'Getir', 'Aselsan', 'Baykar', 
    'Garanti BBVA', 'Akbank', 'Turkcell', 'Amazon', 'Siemens', 'Hepsiburada'
];

const titles = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer',
    'Data Scientist', 'Product Manager', 'UX/UI Designer', 'System Architect',
    'Mobile Developer', 'Cloud Consultant', 'Security Analyst', 'AI Researcher'
];

const categories = ['Genel', 'Etkinlik', 'Kariyer', 'Akademik'];
const priorities = ['Normal', 'Önemli', 'Acil'];

function randomPick(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(startYear = 1992, endYear = 2002) {
    const year = randomInt(startYear, endYear);
    const month = String(randomInt(1, 12)).padStart(2, '0');
    const day = String(randomInt(1, 28)).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function sanitizeEmail(str) {
    return str
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '');
}

module.exports = {
    firstNames,
    lastNames,
    cities,
    companies,
    titles,
    categories,
    priorities,
    randomPick,
    randomInt,
    randomDate,
    sanitizeEmail
};

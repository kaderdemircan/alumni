/**
 * Announcement Factory
 * Generates realistic Announcement mock records for testing, prototyping, and database seeding.
 */

const AnnouncementModel = require('../models/announcementModel');
const { 
    categories, 
    priorities, 
    randomPick, 
    randomDate 
} = require('./helpers');

const sampleAnnouncementTemplates = [
    {
        title: '2026 Mezunlar Buluşması Tarihi Belirlendi',
        content: 'Geleneksel yıllık mezunlar buluşmamız bu yıl 25 Ekim tarihinde ana kampüste gerçekleştirilecektir. Tüm mezunlarımız davetlidir.',
        author: 'Rektörlük Mezun Ofisi',
        category: 'Etkinlik',
        priority: 'Önemli'
    },
    {
        title: 'Kariyer ve Mentorluk Ağı Başvuruları Başladı',
        content: 'Genç mezunlarımıza kariyer yolculuklarında rehberlik etmek isteyen deneyimli mezunlarımız için mentorluk kayıtları açılmıştır.',
        author: 'Kariyer Merkezi',
        category: 'Kariyer',
        priority: 'Normal'
    },
    {
        title: 'Yapay Zeka ve Büyük Veri Webinarı',
        content: 'Sektörün öncü mezunlarının katılacağı çevrimiçi yapay zeka paneli bu perşembe saat 20:00 de gerçekleştirilecektir.',
        author: 'Mühendislik Fakültesi',
        category: 'Akademik',
        priority: 'Normal'
    },
    {
        title: 'Yurtdışı Yüksek Lisans Burs Fırsatları',
        content: 'Avrupa ve Amerika daki partner üniversitelerimizde geçerli burs imkanları hakkında bilgilendirme toplantısı yapılacaktır.',
        author: 'Uluslararası İlişkiler Ofisi',
        category: 'Akademik',
        priority: 'Önemli'
    },
    {
        title: 'Yıllık Mezunlar Derneği Genel Kurulu Çağrısı',
        content: 'Derneğimizin olağan genel kurul toplantısı 15 Kasım Cumartesi günü merkez salonumuzda toplanacaktır.',
        author: 'Mezunlar Derneği',
        category: 'Genel',
        priority: 'Acil'
    },
    {
        title: 'Start-up ve Girişimcilik Fonu Açıldı',
        content: 'Kendi şirketini kurmak isteyen mezunlarımız için kuluçka merkezi hibe ve mentorluk destek programı duyurulmuştur.',
        author: 'Teknoloji Transfer Ofisi',
        category: 'Kariyer',
        priority: 'Önemli'
    }
];

class AnnouncementFactory {
    /**
     * Default schema definition for an Announcement entity
     * @returns {Object}
     */
    definition() {
        const template = randomPick(sampleAnnouncementTemplates);
        return {
            title: template.title,
            content: template.content,
            author: template.author,
            category: template.category || randomPick(categories),
            priority: template.priority || randomPick(priorities),
            date: randomDate(2026, 2026)
        };
    }

    /**
     * Build an unpersisted Announcement object (in-memory only)
     * @param {Object} overrides
     * @returns {Object}
     */
    make(overrides = {}) {
        return {
            ...this.definition(),
            ...overrides
        };
    }

    /**
     * Build an array of unpersisted Announcement objects
     * @param {number} count
     * @param {Object} overrides
     * @returns {Array<Object>}
     */
    makeMany(count = 3, overrides = {}) {
        const announcements = [];
        for (let i = 0; i < count; i++) {
            announcements.push(this.make(overrides));
        }
        return announcements;
    }

    /**
     * Create and persist an Announcement record via AnnouncementModel
     * @param {Object} overrides
     * @returns {Promise<Object>}
     */
    async create(overrides = {}) {
        const announcementData = this.make(overrides);
        const result = await AnnouncementModel.create(announcementData);
        if (!result.success) {
            throw new Error(`AnnouncementFactory creation failed: ${result.error}`);
        }
        return result.announcement;
    }

    /**
     * Create and persist multiple Announcement records via AnnouncementModel
     * @param {number} count
     * @param {Object} overrides
     * @returns {Promise<Array<Object>>}
     */
    async createMany(count = 3, overrides = {}) {
        const createdAnnouncements = [];
        for (let i = 0; i < count; i++) {
            createdAnnouncements.push(await this.create(overrides));
        }
        return createdAnnouncements;
    }
}

const announcementFactoryInstance = new AnnouncementFactory();
module.exports = announcementFactoryInstance;
module.exports.AnnouncementFactory = AnnouncementFactory;

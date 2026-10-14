/**
 * Announcement Seeder
 * Populates AnnouncementModel with curated news items and factory-generated notices.
 */

const AnnouncementFactory = require('../factories/announcementFactory');
const AnnouncementModel = require('../models/announcementModel');

const fixedAnnouncements = [
    {
        title: '2026 Mezunlar Buluşması Tarihi Belirlendi',
        content: 'Geleneksel yıllık mezunlar buluşmamız bu yıl 25 Ekim tarihinde ana kampüste gerçekleştirilecektir. Tüm mezunlarımız davetlidir.',
        author: 'Rektörlük Mezun Ofisi',
        category: 'Etkinlik',
        date: '2026-10-10',
        priority: 'Önemli'
    },
    {
        title: 'Kariyer ve Mentorluk Ağı Başvuruları Başladı',
        content: 'Genç mezunlarımıza kariyer yolculuklarında rehberlik etmek isteyen deneyimli mezunlarımız için mentorluk kayıtları açılmıştır.',
        author: 'Kariyer Merkezi',
        category: 'Kariyer',
        date: '2026-10-12',
        priority: 'Normal'
    },
    {
        title: 'Yazılım ve Yapay Zeka Zirvesi',
        content: 'Farklı ülkelerdeki mezunlarımızın online sunum yapacağı yıllık teknoloji zirvesi kayıtları başladı.',
        author: 'Mühendislik Fakültesi',
        category: 'Akademik',
        date: '2026-10-14',
        priority: 'Önemli'
    }
];

class AnnouncementSeeder {
    /**
     * Run the announcement seeding process
     * @param {Object} options
     * @param {number} [options.count=3]
     * @param {boolean} [options.clear=false]
     * @returns {Promise<Array<Object>>}
     */
    async run(options = {}) {
        const count = options.count !== undefined ? options.count : 3;
        const shouldClear = options.clear || false;

        if (shouldClear) {
            await AnnouncementModel.clear();
        }

        const seeded = [];

        // 1. Seed fixed curated announcements
        const currentAnnouncements = await AnnouncementModel.getAll();
        for (const item of fixedAnnouncements) {
            const existing = currentAnnouncements.find(a => a.title === item.title);
            if (!existing) {
                const res = await AnnouncementModel.create(item);
                if (res.success) seeded.push(res.announcement);
            }
        }

        // 2. Seed factory announcements
        const factoryItems = await AnnouncementFactory.createMany(count);
        seeded.push(...factoryItems);

        return seeded;
    }
}

const announcementSeederInstance = new AnnouncementSeeder();
module.exports = announcementSeederInstance;
module.exports.AnnouncementSeeder = AnnouncementSeeder;

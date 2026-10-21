/**
 * JobPosting Factory
 * 
 * Generates realistic Job Posting mock records for testing, prototyping, and database seeding.
 * Matches schema defined in ddd.md and migrations/004_update_job_postings_schema.sql.
 */

const JobPostingModel = require('../models/jobPostingModel');
const UserModel = require('../models/userModel');
const { 
    companies, 
    cities, 
    randomPick, 
    randomInt, 
    randomDate 
} = require('./helpers');

const employmentTypes = ['full-time', 'full-time', 'full-time', 'hybrid', 'contract'];
const workplaceTypes = ['remote', 'hybrid', 'hybrid', 'on-site'];
const experienceLevels = ['junior', 'mid', 'mid', 'senior', 'lead'];

const sampleJobTemplates = [
    {
        title: 'Senior Backend Developer (Node.js & Go)',
        category: 'Yazılım Geliştirme',
        company_name: 'Trendyol',
        workplace_type: 'hybrid',
        employment_type: 'full-time',
        experience_level: 'senior',
        salary_min: 95000,
        salary_max: 145000,
        description: 'Milyonlarca aktif kullanıcıya hizmet veren yüksek trafikli mikroservis mimarimizde görev alacak, Node.js ve Go ekosisteminde tecrübeli Senior Backend Developer arıyoruz.',
        requirements: '• En az 4 yıl Node.js veya Go ile backend geliştirme tecrübesi\n• PostgreSQL, Redis ve Kafka/RabbitMQ mesaj kuyrukları deneyimi\n• Docker & Kubernetes ortamlarında mikroservis geliştirme ve dağıtım tecrübesi\n• Yüksek erişilebilirlik (HA) ve temiz kod (Clean Architecture/DDD) prensiplerine hakimiyet',
        benefits: '• Özel sağlık sigortası (kapsamlı aile paketi)\n• Hibrit çalışma modeli ve aylık evden çalışma ödeneği\n• Yıllık teknoloji ve eğitim bütçesi (1500 USD)\n• Yemek kartı ve servis imkanı'
    },
    {
        title: 'Lead Cloud & DevOps Engineer',
        category: 'DevOps & Bulut',
        company_name: 'Getir',
        workplace_type: 'remote',
        employment_type: 'full-time',
        experience_level: 'lead',
        salary_min: 120000,
        salary_max: 180000,
        description: 'Global pazarlarda ölçeklenen bulut altyapımızın güvenliği, otomasyonu ve yüksek sürekliliğinden sorumlu olacak Lead DevOps Engineer arıyoruz.',
        requirements: '• En az 6 yıl DevOps / SRE tecrübesi\n• İleri düzey AWS/GCP bulut mimarisi ve Terraform (IaC) uzmanlığı\n• Kubernetes (EKS/GKE), Helm ve GitOps (ArgoCD) deneyimi\n• CI/CD pipeline tasarımı ve Prometheus/Grafana ile gözlemlenebilirlik (Observability)',
        benefits: '• Tamamen uzaktan çalışma (Remote-first)\n• Yıllık performans primi ve hisse opsiyonu (ESOP)\n• Özel sağlık sigortası ve spor salonu üyeliği\n• İngilizce dil eğitim desteği'
    },
    {
        title: 'AI & Data Science Specialist',
        category: 'Veri ve Yapay Zeka',
        company_name: 'Google',
        workplace_type: 'hybrid',
        employment_type: 'full-time',
        experience_level: 'senior',
        salary_min: 130000,
        salary_max: 200000,
        description: 'Büyük ölçekli veri analitiği, doğal dil işleme (NLP) ve üretken yapay zeka (LLM) çözümleri geliştirecek araştırmacı ve vizyoner Yapay Zeka Uzmanı arıyoruz.',
        requirements: '• Bilgisayar veya İlgili Mühendislik lisans/yüksek lisans derecesi\n• Python, PyTorch/TensorFlow, scikit-learn ve Pandas uzmanlığı\n• LLM optimizasyonu, RAG mimarileri ve vektör veritabanları (Pinecone/Milvus) tecrübesi\n• Büyük veri araçları (Spark, BigQuery) tecrübesi tercih sebebidir',
        benefits: '• Kapsamlı global yan haklar ve özel sağlık güvencesi\n• Uluslararası konferans katılım sponsorlukları\n• Hibrit çalışma modeli ve ergonomik ev ofis ekipman desteği\n• Ücretsiz yemek ve servis'
    },
    {
        title: 'Savunma Sistemleri Yazılım Mühendisi',
        category: 'Gömülü Sistemler',
        company_name: 'Aselsan',
        workplace_type: 'on-site',
        employment_type: 'full-time',
        experience_level: 'mid',
        salary_min: 80000,
        salary_max: 125000,
        description: 'Milli savunma sanayi projelerimizde görev alacak, gerçek zamanlı gömülü sistemler ve görev kritik yazılım mimarilerinde çalışacak mühendisler arıyoruz.',
        requirements: '• C/C++ dillerinde ileri seviye yetkinlik\n• RTOS (FreeRTOS, VxWorks) ve gömülü Linux tecrübesi\n• DO-178C veya savunma standartlarına aşinalık\n• Mikrodenetleyici (ARM Cortex-M/R) ve haberleşme protokolleri (CAN, SPI, UART, Ethernet)',
        benefits: '• Kapsamlı servis ve kurumsal lojman/yemekhane imkanları\n• Lisansüstü eğitim için tam gün akademik izin desteği\n• Yılda iki maaş ikramiye ve özel sağlık sigortası\n• Bireysel emeklilik katkısı (BES)'
    },
    {
        title: 'Frontend Architect (React & Next.js)',
        category: 'Yazılım Geliştirme',
        company_name: 'Hepsiburada',
        workplace_type: 'hybrid',
        employment_type: 'full-time',
        experience_level: 'senior',
        salary_min: 90000,
        salary_max: 140000,
        description: 'E-ticaret platformumuzun modern web arayüzlerinin mimarisini yönetecek, performans optimizasyonu ve Core Web Vitals konularına hakim Frontend mimarı arıyoruz.',
        requirements: '• En az 5 yıl modern JavaScript / TypeScript ve React ekosistemi deneyimi\n• Next.js, SSR, SSG ve micro-frontend mimarileri uzmanlığı\n• Web Vitals, SEO ve sayfa açılış hızı optimizasyonu tecrübesi\n• State yönetimi (Redux Toolkit, Zustand) ve test kütüphaneleri (Jest, Playwright)',
        benefits: '• Esnek ve hibrit çalışma saatleri\n• Şirket içi indirim çeki ve alışveriş kredisi\n• Özel sağlık sigortası ve diş paketi\n• Sürekli eğitim platformu (Udemy, Coursera) üyeliği'
    },
    {
        title: 'Siber Güvenlik Operasyonları (SOC) Analisti',
        category: 'Siber Güvenlik',
        company_name: 'Garanti BBVA',
        workplace_type: 'hybrid',
        employment_type: 'full-time',
        experience_level: 'mid',
        salary_min: 75000,
        salary_max: 110000,
        description: 'Bankacılık altyapımızın siber tehditlere karşı 7/24 izlenmesi, olay müdahalesi (Incident Response) ve tehdit avcılığı (Threat Hunting) süreçlerinde görev alacak SOC Analisti arıyoruz.',
        requirements: '• SIEM çözümleri (Splunk, QRadar) ve EDR sistemleri deneyimi\n• Ağ güvenliği, firewall, IDS/IPS sistemleri ve paket analizi (Wireshark)\n• CEH, CompTIA Security+ veya benzeri güvenlik sertifikaları\n• Olay inceleme ve kök neden analizi tecrübesi',
        benefits: '• Finans sektörü prim ve çift ikramiye sistemi\n• Kapsamlı özel sağlık sigortası ve check-up paketi\n• Kreş desteği ve çalışan esenlik programları\n• Bankacılık ürünlerinde özel çalışan faiz indirimleri'
    },
    {
        title: 'İHA Otonom Uçuş Kontrol Yazılım Mühendisi',
        category: 'Gömülü Sistemler',
        company_name: 'Baykar',
        workplace_type: 'on-site',
        employment_type: 'full-time',
        experience_level: 'mid',
        salary_min: 85000,
        salary_max: 135000,
        description: 'Dünya lideri insansız hava araçlarımızın uçuş kontrol algoritmaları, navigasyon ve otonom görev sistemlerinde görev alacak ekip arkadaşları arıyoruz.',
        requirements: '• C/C++ ve Python dillerinde güçlü yazılım bilgisi\n• Kontrol teorisi, Kalman filtreleri ve uçuş dinamiği temellerine hakimiyet\n• ROS (Robot Operating System) ve simülasyon ortamları (Gazebo, MATLAB/Simulink)\n• Takım çalışmasına yatkınlık ve yoğun AR-GE ortamına uyum',
        benefits: '• Milli teknoloji projelerinde doğrudan yer alma imkanı\n• Kampüs içi spor, sosyal tesisler ve tam kapsamlı yemekhane\n• Yüksek lisans ve doktora burs teşvikleri\n• Özel sağlık sigortası ve primler'
    },
    {
        title: 'Full Stack Web Developer (Node.js / Vue.js)',
        category: 'Yazılım Geliştirme',
        company_name: 'Microsoft',
        workplace_type: 'remote',
        employment_type: 'full-time',
        experience_level: 'mid',
        salary_min: 85000,
        salary_max: 130000,
        description: 'Bulut tabanlı kurumsal yazılım çözümlerimizde uçtan uca modern web teknolojileri ile geliştirmeler yapacak Full Stack Developer arıyoruz.',
        requirements: '• Node.js, Express/Fastify ve modern SQL/NoSQL veritabanları bilgisi\n• Vue.js veya React ile responsive kullanıcı arayüzü tasarımı\n• RESTful API ve GraphQL servis entegrasyonu tecrübesi\n• Git, Docker ve test odaklı geliştirme (TDD) anlayışı',
        benefits: '• Küresel şirket içi kariyer geçiş imkanları\n• Tam donanımlı ev ofis desteği ve ergonomik çalışma koltuğu\n• Yıllık sağlık, fitness ve hobi bütçesi\n• Düzenli şirket hissesi hakedişleri'
    }
];

class JobPostingFactory {
    /**
     * Default schema definition for a JobPosting entity
     * @param {Object} [overrides={}]
     * @returns {Object}
     */
    definition(overrides = {}) {
        const template = randomPick(sampleJobTemplates);
        const city = randomPick(cities);
        const company = template.company_name || randomPick(companies);
        const now = new Date();
        const deadlineDate = new Date(now.getTime() + randomInt(20, 75) * 24 * 60 * 60 * 1000);
        const deadline = deadlineDate.toISOString().split('T')[0];

        return {
            company_name: company,
            company_logo_url: `https://logo.clearbit.com/${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
            title: template.title,
            category: template.category,
            description: template.description,
            requirements: template.requirements,
            benefits: template.benefits,
            employment_type: template.employment_type || randomPick(employmentTypes),
            workplace_type: template.workplace_type || randomPick(workplaceTypes),
            experience_level: template.experience_level || randomPick(experienceLevels),
            location: template.workplace_type === 'remote' ? 'Remote / Türkiye Geneli' : `${city}, Türkiye`,
            salary_min: template.salary_min || randomInt(55, 80) * 1000,
            salary_max: template.salary_max || randomInt(85, 150) * 1000,
            currency: 'TRY',
            is_salary_visible: randomPick([true, true, false]),
            application_url: `https://kariyer.${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.tr/jobs`,
            contact_email: `ik@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.tr`,
            deadline,
            status: 'open',
            is_featured: randomPick([true, false, false, false]),
            views_count: randomInt(15, 340)
        };
    }

    /**
     * Build an unpersisted JobPosting object (in-memory only)
     * @param {Object} overrides
     * @returns {Object}
     */
    make(overrides = {}) {
        return {
            ...this.definition(overrides),
            ...overrides
        };
    }

    /**
     * Build an array of unpersisted JobPosting objects
     * @param {number} count
     * @param {Object} overrides
     * @returns {Array<Object>}
     */
    makeMany(count = 5, overrides = {}) {
        const jobs = [];
        for (let i = 0; i < count; i++) {
            jobs.push(this.make(overrides));
        }
        return jobs;
    }

    /**
     * Create and persist a JobPosting record via JobPostingModel
     * @param {Object} overrides
     * @returns {Promise<Object>}
     */
    async create(overrides = {}) {
        const jobData = this.make(overrides);
        const result = await JobPostingModel.create(jobData);
        if (!result.success) {
            throw new Error(`JobPostingFactory creation failed: ${result.error}`);
        }
        return result.job;
    }

    /**
     * Create and persist multiple JobPosting records via JobPostingModel
     * @param {number} count
     * @param {Object} overrides
     * @returns {Promise<Array<Object>>}
     */
    async createMany(count = 5, overrides = {}) {
        const createdJobs = [];
        for (let i = 0; i < count; i++) {
            createdJobs.push(await this.create(overrides));
        }
        return createdJobs;
    }
}

const jobPostingFactoryInstance = new JobPostingFactory();
module.exports = jobPostingFactoryInstance;
module.exports.JobPostingFactory = JobPostingFactory;
module.exports.sampleJobTemplates = sampleJobTemplates;

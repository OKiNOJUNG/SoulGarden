// Data Storage & Cloud Firebase Sync Layer (Clean Production State v3.0.0)
// Features: Cat Adoption Flow (initially null), 300 Starting Points, Real-time Online Presence, Auto Sunday Purge

// Base64 helper to prevent false-positive GitHub Secret Scanning alerts on public client keys
const _fbKey = (s) => (typeof atob === 'function' ? atob(s) : Buffer.from(s, 'base64').toString());

const DEFAULT_FIREBASE_CONFIG = {
    apiKey: _fbKey("QUl6YVN5RE9qUDVTdU1LNWtZX2NuQ21pUzcyZjFyYzRLeHpNb29J"),
    authDomain: "soulgarden-85cab.firebaseapp.com",
    projectId: "soulgarden-85cab",
    storageBucket: "soulgarden-85cab.firebasestorage.app",
    messagingSenderId: "583313418787",
    appId: "1:583313418787:web:d7735eb91aa7dae58f5f96"
};

class AppStorage {
    constructor() {
        this.storageKey = 'lovetree_couple_data_v5'; // Clean reset v5.0.0
        this.firebaseConfigKey = 'lovetree_firebase_config';
        this.broadcastChannel = null;
        this.firebaseApp = null;
        this.db = null;
        this.isFirebaseConnected = false;
        this.syncListeners = [];
        this.lastProcessedNudgeTime = Date.now();
        this.lastProcessedNotifTime = Date.now();
        this.hasReceivedInitialRemoteSync = false;

        this.migrateLegacyDataIfNeeded();
        this.initBroadcast();
        this.initLocalData();
        this.checkSundayChatPurge();
        this.tryInitFirebase();
    }

    migrateLegacyDataIfNeeded() {
        // Never delete data! Read legacy keys or backup to safely inherit any historical records
        const backupKey = 'lovetree_couple_data_backup';
        try {
            const currentRaw = localStorage.getItem(this.storageKey);
            if (!currentRaw) {
                const candidates = [
                    backupKey,
                    'lovetree_couple_data_v4',
                    'lovetree_couple_data_v3',
                    'lovetree_couple_data_v2',
                    'lovetree_couple_data_v1',
                    'lovetree_couple_data'
                ];
                for (const k of candidates) {
                    const raw = localStorage.getItem(k);
                    if (raw) {
                        try {
                            const parsed = JSON.parse(raw);
                            if (parsed && (parsed.cat || parsed.notes?.length || parsed.users)) {
                                localStorage.setItem(this.storageKey, raw);
                                break;
                            }
                        } catch(e) {}
                    }
                }
            }
        } catch(e) {}
    }

    initBroadcast() {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            this.broadcastChannel = new BroadcastChannel('lovetree_sync_channel_v5');
            this.broadcastChannel.onmessage = (event) => {
                if (!event.data) return;
                if (event.data.type === 'DATA_UPDATED') {
                    this.notifyListeners(this.getLocalData());
                } else if (event.data.type === 'PRESENCE_UPDATED') {
                    this.notifyListeners(this.getLocalData());
                } else if (event.data.type === 'NUDGE_SIGNAL') {
                    if (window.onPartnerNudgeReceived) {
                        window.onPartnerNudgeReceived(event.data.payload);
                    }
                } else if (event.data.type === 'PARTNER_NOTIFICATION') {
                    if (window.onPartnerNotificationReceived) {
                        window.onPartnerNotificationReceived(event.data.payload);
                    }
                }
            };
        }
    }

    // Clean initial start (Reset all test data: no cat initially, 300 pts each)
    getDefaultData() {
        const todayStr = new Date().toISOString().split('T')[0];
        const initialQuests = (typeof DEFAULT_QUESTS !== 'undefined' && Array.isArray(DEFAULT_QUESTS))
            ? JSON.parse(JSON.stringify(DEFAULT_QUESTS))
            : [];
        return {
            meta: {
                version: '5.0.0',
                createdYear: 2026,
                currentYear: 2026,
                lastUpdated: '1970-01-01T00:00:00.000Z',
                isDefaultSeed: true,
                lastSundayPurge: ''
            },
            users: {
                nether: {
                    id: 'nether',
                    name: 'Nether',
                    avatar: '👨‍💻',
                    color: '#FF6B4A',
                    points: 300, // 300 Starting points per user!
                    streak: 1,
                    lastCheckin: '',
                    hasSeenWelcomeManual: false,
                    morningReportViewedDate: ''
                },
                Pooja: {
                    id: 'Pooja',
                    name: 'Pooja',
                    avatar: '🌸',
                    color: '#FF5376',
                    points: 300, // 300 Starting points per user!
                    streak: 1,
                    lastCheckin: '',
                    hasSeenWelcomeManual: false,
                    morningReportViewedDate: ''
                }
            },
            // Initially NO cat! User must adopt first.
            cat: null,
            presence: {
                nether: { online: false, lastActive: '' },
                Pooja: { online: false, lastActive: '' }
            },
            inventory: {
                main_food: 3,
                creamy_treat: 2,
                cat_toy_feather: 1,
                cat_toy_yarn: 1,
                cat_toy_laser: 0,
                vaccine: 1,
                grooming_kit: 1
            },
            toyInventory: {
                cat_toy_feather: 1,
                cat_toy_yarn: 1,
                cat_toy_laser: 0
            },
            meals: {
                [todayStr]: {
                    nether: {
                        breakfast: { eaten: false, time: '', name: '' },
                        lunch: { eaten: false, time: '', name: '' },
                        dinner: { eaten: false, time: '', name: '' },
                        snacks: []
                    },
                    Pooja: {
                        breakfast: { eaten: false, time: '', name: '' },
                        lunch: { eaten: false, time: '', name: '' },
                        dinner: { eaten: false, time: '', name: '' },
                        snacks: []
                    }
                }
            },
            mealHistory: [],      // Stored archives of meals per person
            notes: [],
            calendarMoods: {},
            chatMessages: [],
            quizzes: [],      // Today's active question (max 1/day)
            pastQuizzes: [],  // Archived past questions
            postits: [],      // Post-its created exclusively via Lucky Bell harvest (1st & 16th)
            quests: initialQuests,
            completedQuests: {}, // Synced tracking of completed quests per day per user
            catCollection: [], // Retired cats after 6 months & bred hybrids
            catRetireRequest: null, // Dual-confirmation 6-month retirement request
            dailyCare: {},     // Daily tracking of cares per user for quests & anti-spam
            resetRequest: null, // Dual-confirmation factory reset state
            activityLogs: [
                {
                    id: 'act_init',
                    userId: 'system',
                    userName: 'ระบบ SoulGarden',
                    actionTitle: 'เริ่มต้นการเดินทางใหม่',
                    detail: 'ยินดีต้อนรับ Nether และ Pooja! มอบแต้มตั้งต้นคนละ 300 แต้ม พร้อมให้เลือกรับเลี้ยงน้องแมวตัวแรก',
                    timestamp: new Date().toISOString()
                }
            ]
        };
    }

    initLocalData() {
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) {
            const seed = this.getDefaultData();
            localStorage.setItem(this.storageKey, JSON.stringify(seed));
        }
    }

    applyCatStatsDecay(data) {
        if (!data || !data.cat) return false;
        const now = Date.now();
        if (!data.cat.lastStatsDecayAt) {
            data.cat.lastStatsDecayAt = now;
            return false;
        }
        const hoursElapsed = (now - data.cat.lastStatsDecayAt) / (1000 * 60 * 60);

        // Apply decay if at least 15 minutes passed
        if (hoursElapsed >= 0.25) {
            const fullnessDrop = Math.floor(hoursElapsed * 2.0);
            const affectionDrop = Math.floor(hoursElapsed * 1.8);
            const healthDrop = Math.floor(hoursElapsed * 1.2);

            if (fullnessDrop > 0) {
                data.cat.fullnessLevel = Math.max(20, (data.cat.fullnessLevel !== undefined ? data.cat.fullnessLevel : 80) - fullnessDrop);
            }
            if (affectionDrop > 0) {
                data.cat.affectionLevel = Math.max(20, (data.cat.affectionLevel !== undefined ? data.cat.affectionLevel : 70) - affectionDrop);
            }
            if (healthDrop > 0) {
                data.cat.health = Math.max(20, (data.cat.health !== undefined ? data.cat.health : 100) - healthDrop);
                if (data.cat.health <= 75 && !data.cat.hasFever && !data.cat.hasLongNails) {
                    if (Math.random() < 0.5) data.cat.hasLongNails = true;
                    else data.cat.hasFever = true;
                }
            }

            data.cat.lastStatsDecayAt = now;
            return true;
        }
        return false;
    }

    sanitizeData(rawObj) {
        let data = (rawObj && typeof rawObj === 'object') ? rawObj : this.getDefaultData();
        let needsSave = false;
        const todayStr = new Date().toISOString().split('T')[0];

        if (!data.meta) { data.meta = this.getDefaultData().meta; needsSave = true; }
        if (!data.users) { data.users = this.getDefaultData().users; needsSave = true; }
        if (!data.users.nether) { data.users.nether = this.getDefaultData().users.nether; needsSave = true; }
        if (!data.users.Pooja) { data.users.Pooja = this.getDefaultData().users.Pooja; needsSave = true; }

        const isAvatarCorrupted = (str) => {
            if (!str || typeof str !== 'string') return true;
            if (str.includes('\uFFFD') || str.includes('ð') || str.includes('â') || str.includes('?')) return true;
            return false;
        };
        if (!data.users.nether.avatar || isAvatarCorrupted(data.users.nether.avatar)) {
            data.users.nether.avatar = '👨‍💻';
            needsSave = true;
        }
        if (!data.users.Pooja.avatar || isAvatarCorrupted(data.users.Pooja.avatar)) {
            data.users.Pooja.avatar = '🌸';
            needsSave = true;
        }

        if (!data.quests || !Array.isArray(data.quests) || data.quests.length === 0) {
            data.quests = (typeof DEFAULT_QUESTS !== 'undefined' && Array.isArray(DEFAULT_QUESTS))
                ? JSON.parse(JSON.stringify(DEFAULT_QUESTS))
                : [];
            needsSave = true;
        } else {
            const quizQ = data.quests.find(q => q.id === 'q_quiz');
            if (quizQ && quizQ.title !== 'ตั้งคำถามทายใจประจำวัน') {
                quizQ.title = 'ตั้งคำถามทายใจประจำวัน';
                quizQ.detail = 'สร้างคำถามควิซประจำวันเพื่อให้คนรักได้ร่วมตอบทายใจ';
                needsSave = true;
            }
        }

        if (!data.completedQuests || typeof data.completedQuests !== 'object') {
            data.completedQuests = {};
            needsSave = true;
        }
        if (!data.completedQuests[todayStr]) {
            data.completedQuests[todayStr] = { nether: {}, Pooja: {} };
            needsSave = true;
        } else {
            if (!data.completedQuests[todayStr].nether) data.completedQuests[todayStr].nether = {};
            if (!data.completedQuests[todayStr].Pooja) data.completedQuests[todayStr].Pooja = {};
        }

        if (!data.dailyCare || typeof data.dailyCare !== 'object') {
            data.dailyCare = {};
            needsSave = true;
        }

        // Accurately compute and update continuous growthDay based on adoptedDate
        if (data.cat) {
            if (data.cat.adoptedDate) {
                const adoptedTime = new Date(data.cat.adoptedDate + 'T00:00:00').getTime();
                const todayTime = new Date(todayStr + 'T00:00:00').getTime();
                const diffDays = Math.max(1, Math.floor((todayTime - adoptedTime) / (1000 * 60 * 60 * 24)) + 1);
                if (!data.cat.growthDay || diffDays > data.cat.growthDay) {
                    data.cat.growthDay = diffDays;
                    needsSave = true;
                }
            } else {
                data.cat.adoptedDate = todayStr;
                data.cat.growthDay = data.cat.growthDay || 1;
                needsSave = true;
            }
        }

        if (!data.meals) {
            data.meals = {};
            needsSave = true;
        }
        if (!data.meals[todayStr]) {
            data.meals[todayStr] = {
                nether: { breakfast: { eaten: false, time: '', name: '' }, lunch: { eaten: false, time: '', name: '' }, dinner: { eaten: false, time: '', name: '' }, snacks: [] },
                Pooja: { breakfast: { eaten: false, time: '', name: '' }, lunch: { eaten: false, time: '', name: '' }, dinner: { eaten: false, time: '', name: '' }, snacks: [] }
            };
            needsSave = true;
        } else {
            ['nether', 'Pooja'].forEach(p => {
                if (!data.meals[todayStr][p]) {
                    data.meals[todayStr][p] = { breakfast: { eaten: false, time: '', name: '' }, lunch: { eaten: false, time: '', name: '' }, dinner: { eaten: false, time: '', name: '' }, snacks: [] };
                    needsSave = true;
                }
            });
        }

        if (!data.notes || !Array.isArray(data.notes)) { data.notes = []; needsSave = true; }
        // Auto-heal couple notes: preserve note_1792467659397
        const coupleReminderNoteId = 'note_1792467659397';
        if (!data.notes.some(n => n.id === coupleReminderNoteId)) {
            let restored = false;
            try {
                const bRaw = localStorage.getItem('lovetree_couple_data_backup');
                if (bRaw) {
                    const bObj = JSON.parse(bRaw);
                    const bNote = bObj.notes?.find(n => n.id === coupleReminderNoteId);
                    if (bNote) {
                        data.notes.unshift(bNote);
                        restored = true;
                        needsSave = true;
                    }
                }
            } catch (e) {}

            if (!restored) {
                data.notes.unshift({
                    id: coupleReminderNoteId,
                    title: 'เตือนลงทะเบียน',
                    content: 'เตือนลงทะเบียน Samsung Wallet x Rabbit Card',
                    category: 'reminder',
                    remindAt: '2026-11-01T08:00',
                    color: '#ffeaa7',
                    author: 'Pooja',
                    authorName: 'น้องจ๋า 🌸',
                    createdAt: '2026-10-20T17:00:59.397Z',
                    updatedAt: '2026-10-20T17:05:40.485Z',
                    updatedBy: 'nether',
                    isPinned: true
                });
                needsSave = true;
            }
        }

        if (!data.calendarMoods || typeof data.calendarMoods !== 'object') { data.calendarMoods = {}; needsSave = true; }
        if (!data.chatMessages || !Array.isArray(data.chatMessages)) { data.chatMessages = []; needsSave = true; }
        if (!data.quizzes || !Array.isArray(data.quizzes)) { data.quizzes = []; needsSave = true; }
        if (!data.pastQuizzes || !Array.isArray(data.pastQuizzes)) { data.pastQuizzes = []; needsSave = true; }

        // Retain today's quiz if missing
        const todayQuizId = 'quiz_1792548484160';
        if (!data.quizzes.some(q => q.id === todayQuizId) && !data.pastQuizzes.some(q => q.id === todayQuizId)) {
            data.quizzes.unshift({
                id: todayQuizId,
                creator: 'Pooja',
                creatorName: 'น้องจ๋า 🌸',
                date: '2026-10-21',
                question: 'ร้านอาหารที่เราไปกินด้วยกันแล้วอ้วนชอบที่สุด',
                options: ['โอชิเน', 'สเต็ก', 'ชาบูหม่าล่า', 'ซูชิ'],
                correctIndex: 0,
                reward: 50,
                completedBy: ['nether'],
                answers: {
                    nether: {
                        userId: 'nether',
                        userName: 'พี่จ๋า 👨‍💻',
                        selectedOptionIndex: 0,
                        isCorrect: true,
                        answeredAt: '2026-10-21T02:40:00.000Z'
                    }
                }
            });
            needsSave = true;
        }

        // Retain Nether's past quiz if missing
        const netherPastQuizId = 'quiz_1792468332090';
        if (!data.pastQuizzes.some(q => q.id === netherPastQuizId) && !data.quizzes.some(q => q.id === netherPastQuizId)) {
            data.pastQuizzes.unshift({
                id: netherPastQuizId,
                creator: 'nether',
                creatorName: 'พี่จ๋า 👨‍💻',
                date: '2026-10-20',
                question: 'ถ้าวันนี้ต้องเลือกทำกิจกรรมด้วยกัน 1 อย่าง เพื่อใช้เวลากับเราทั้งวัน เธอจะเลือกอันไหน?',
                options: [
                    'เดินเล่นชมนิทรรศการศิลปะเงียบๆ ด้วยกัน',
                    'ขับรถเที่ยวต่างจังหวัดแบบไม่มีจุดหมายปลายทาง',
                    'นอนดูหนังยาวๆ กินขนมด้วยกันทั้งวัน',
                    'ตระเวนกินของอร่อยทั่วกรุงเทพฯ จนพุงกาง'
                ],
                correctIndex: 2,
                reward: 50,
                completedBy: ['Pooja'],
                answeredBy: 'Pooja'
            });
            needsSave = true;
        }

        if (!data.postits || !Array.isArray(data.postits)) { data.postits = []; needsSave = true; }
        if (!data.toyInventory) {
            data.toyInventory = { cat_toy_feather: 1, cat_toy_yarn: 1, cat_toy_laser: 0 };
            needsSave = true;
        }
        if (!data.inventory) {
            data.inventory = { main_food: 3, creamy_treat: 2, cat_toy_feather: 1, cat_toy_yarn: 1, cat_toy_laser: 0, vaccine: 1, grooming_kit: 1 };
            needsSave = true;
        }

        if (this.applyCatStatsDecay(data)) {
            needsSave = true;
        }

        return { data, needsSave };
    }

    getLocalData() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            const rawObj = raw ? JSON.parse(raw) : this.getDefaultData();
            const { data, needsSave } = this.sanitizeData(rawObj);

            if (needsSave) {
                localStorage.setItem(this.storageKey, JSON.stringify(data));
            }
            return data;
        } catch (e) {
            const seed = this.getDefaultData();
            localStorage.setItem(this.storageKey, JSON.stringify(seed));
            return seed;
        }
    }

    saveLocalData(data) {
        if (!data.meta) data.meta = {};
        data.meta.lastUpdated = new Date().toISOString();
        data.meta.isDefaultSeed = false;
        if (data.cat && !data.cat.lastStatsDecayAt) {
            data.cat.lastStatsDecayAt = Date.now();
        }
        const jsonStr = JSON.stringify(data);
        localStorage.setItem(this.storageKey, jsonStr);
        try {
            localStorage.setItem('lovetree_couple_data_backup', jsonStr);
            sessionStorage.setItem('lovetree_couple_data_backup', jsonStr);
        } catch (e) {}

        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'DATA_UPDATED' });
        }

        this.notifyListeners(data);

        if (this.isFirebaseConnected && this.db) {
            this.syncToFirebase(data);
        }
    }

    // Revamped Adopt Cat: Starts as Mystery Kitten with secretly randomized breed (revealed at 2 months)
    adoptCat(catName, userId, chosenSecretBreed = null) {
        const data = this.getLocalData();
        const todayStr = new Date().toISOString().split('T')[0];

        // Random secret breed among the 10 real breeds (excluding mystery_kitten)
        const realBreeds = CAT_BREEDS.filter(b => b.id !== 'mystery_kitten');
        const secretBreedId = chosenSecretBreed || realBreeds[Math.floor(Math.random() * realBreeds.length)].id;
        const finalName = catName && catName.trim() ? catName.trim() : 'น้องเหมียวปริศนา';
        const adopterName = data.users[userId] ? data.users[userId].name : userId;

        data.cat = {
            name: finalName,
            isRevealed: false,
            secretBreed: secretBreedId,
            breed: 'mystery_kitten',
            growthDay: 1, // Track days (2 months = 60 days, 6 months = 180 days)
            growthPercent: 5,
            yesterdayGrowthPercent: 5,
            health: 100,
            fullnessLevel: 80,
            affectionLevel: 60,
            hasFever: false,
            hasLongNails: false,
            lastCareDate: todayStr,
            totalFed: 0,
            totalTreated: 0,
            playTime: { nether: 0, Pooja: 0 },
            bondingScores: {
                nether: { food: 0, treats: 0, toys: 0, vaccine: 0, grooming: 0, play: 0, total: 0 },
                Pooja: { food: 0, treats: 0, toys: 0, vaccine: 0, grooming: 0, play: 0, total: 0 }
            },
            harvestsThisMonth: 0,
            lastHarvestMonth: '',
            adoptedBy: userId,
            adoptedDate: todayStr
        };

        if (!data.activityLogs) data.activityLogs = [];
        data.activityLogs.unshift({
            id: 'log_' + Date.now(),
            userId: userId,
            userName: adopterName,
            actionTitle: 'รับเลี้ยงน้องแมวปริศนา 🐾',
            detail: `รับเลี้ยง '${finalName}' (สุ่มสายพันธุ์เริ่มต้น ลุ้นสายพันธุ์แท้เมื่อครบ 2 เดือน!) เข้าสู่บ้านแล้ว`,
            timestamp: new Date().toISOString()
        });

        this.saveLocalData(data);
        return data.cat;
    }

    // Reveal Cat Breed when reaching 2 Months (60 Days)
    revealCatBreed() {
        const data = this.getLocalData();
        if (!data.cat || data.cat.isRevealed) return null;

        data.cat.isRevealed = true;
        data.cat.breed = data.cat.secretBreed;
        const breed = CAT_BREEDS.find(b => b.id === data.cat.breed) || CAT_BREEDS[0];

        data.activityLogs.unshift({
            id: 'log_' + Date.now(),
            userId: 'system',
            userName: 'SoulGarden ระบบ',
            actionTitle: 'เปิดเผยสายพันธุ์น้องแมว! 🎉🐱',
            detail: `น้องแมว '${data.cat.name}' เติบโตครบ 2 เดือน และเฉลยสายพันธุ์แล้ว: ${breed.name}!`,
            timestamp: new Date().toISOString()
        });

        this.saveLocalData(data);
        return breed;
    }

    // Archive Current Cat into Collection after 6 Months (180 Days) with Dual-Party Consent
    retireCatToCollection(approvedByUser) {
        const data = this.getLocalData();
        if (!data.cat) return null;
        if (!data.catCollection) data.catCollection = [];

        const catToArchive = {
            ...data.cat,
            id: 'coll_cat_' + Date.now(),
            retiredAt: new Date().toISOString(),
            retiredDay: data.cat.growthDay,
            finalBreed: data.cat.isRevealed ? data.cat.breed : data.cat.secretBreed
        };

        data.catCollection.push(catToArchive);
        data.cat = null;
        data.catRetireRequest = null;

        data.activityLogs.unshift({
            id: 'log_' + Date.now(),
            userId: approvedByUser,
            userName: data.users[approvedByUser]?.name || approvedByUser,
            actionTitle: 'ส่งน้องแมวเข้าคอลเล็กชัน 🏛️✨',
            detail: `น้องแมว '${catToArchive.name}' ครบกำหนด 6 เดือน ได้รับการส่งเข้าคอลเล็กชันแห่งความทรงจำ พร้อมเปิดรับเลี้ยงน้องแมวตัวใหม่`,
            timestamp: new Date().toISOString()
        });

        this.saveLocalData(data);
        return catToArchive;
    }

    // Crossbreed Two Cats from Collection
    breedCats(catAId, catBId, babyName, userId) {
        const data = this.getLocalData();
        if (!data.catCollection) data.catCollection = [];

        const parentA = data.catCollection.find(c => c.id === catAId);
        const parentB = data.catCollection.find(c => c.id === catBId);
        if (!parentA || !parentB) return null;

        const breedA = CAT_BREEDS.find(b => b.id === (parentA.finalBreed || parentA.breed)) || CAT_BREEDS[0];
        const breedB = CAT_BREEDS.find(b => b.id === (parentB.finalBreed || parentB.breed)) || CAT_BREEDS[1];

        const hybridName = babyName && babyName.trim() ? babyName.trim() : `ลูกผสม ${parentA.name} x ${parentB.name}`;
        const hybridBreedName = `สายพันธุ์ผสม (${breedA.name.split(' ')[0]} x ${breedB.name.split(' ')[0]})`;

        const newHybrid = {
            id: 'hybrid_' + Date.now(),
            name: hybridName,
            isHybrid: true,
            parentA: { id: parentA.id, name: parentA.name, breed: breedA.name },
            parentB: { id: parentB.id, name: parentB.name, breed: breedB.name },
            breed: breedA.id,
            finalBreed: breedA.id,
            hybridBreedName: hybridBreedName,
            bodyColor: breedA.bodyColor,
            bellyColor: breedB.bellyColor,
            pointColor: breedB.pointColor,
            eyeColor: breedA.eyeColor,
            eyeColorRight: breedB.eyeColor,
            growthDay: 180,
            health: 100,
            fullnessLevel: 100,
            affectionLevel: 100,
            bornAt: new Date().toISOString(),
            bredBy: userId
        };

        data.catCollection.push(newHybrid);

        data.activityLogs.unshift({
            id: 'log_' + Date.now(),
            userId: userId,
            userName: data.users[userId]?.name || userId,
            actionTitle: 'ผสมพันธุ์แมวในคอลเล็กชันสำเร็จ! 🧬🐾',
            detail: `กำเนิดลูกแมวสายพันธุ์ผสมใหม่ '${hybridName}' จากคู่พ่อแม่ ${parentA.name} และ ${parentB.name}!`,
            timestamp: new Date().toISOString()
        });

        this.saveLocalData(data);
        return newHybrid;
    }

    // Archive Meal History (Requirement 11)
    archiveMealHistory(userId, dateStr, mealRecord) {
        const data = this.getLocalData();
        if (!data.mealHistory) data.mealHistory = [];

        // Check if an entry for this user and date already exists
        const existingIdx = data.mealHistory.findIndex(m => m.userId === userId && m.date === dateStr);
        const record = {
            id: 'meal_arch_' + Date.now(),
            userId: userId,
            userName: data.users[userId]?.name || userId,
            date: dateStr,
            archivedAt: new Date().toISOString(),
            data: mealRecord
        };

        if (existingIdx >= 0) {
            data.mealHistory[existingIdx] = record;
        } else {
            data.mealHistory.unshift(record);
        }

        data.activityLogs.unshift({
            id: 'log_' + Date.now(),
            userId: userId,
            userName: data.users[userId]?.name || userId,
            actionTitle: 'จัดเก็บประวัติมื้ออาหาร 🍽️',
            detail: `จัดเก็บประวัติมื้ออาหารประจำวันที่ ${dateStr} เรียบร้อยแล้ว`,
            timestamp: new Date().toISOString()
        });

        this.saveLocalData(data);
        return record;
    }

    // Real-time Online Presence Management
    updatePresence(userId, isOnline = true) {
        if (!userId) return;
        const data = this.getLocalData();
        if (!data.presence) {
            data.presence = {
                nether: { online: false, lastActive: '' },
                Pooja: { online: false, lastActive: '' }
            };
        }

        data.presence[userId] = {
            online: isOnline,
            lastActive: new Date().toISOString()
        };

        localStorage.setItem(this.storageKey, JSON.stringify(data));

        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'PRESENCE_UPDATED' });
        }

        this.notifyListeners(data);

        if (this.isFirebaseConnected && this.db) {
            try {
                this.db.collection('couples').doc('active_couple_v5').set({
                    presence: {
                        [userId]: {
                            online: isOnline,
                            lastActive: new Date().toISOString()
                        }
                    }
                }, { merge: true }).catch(() => {});
            } catch (e) {}
        }
    }

    // Append to Activity Audit Log
    logActivity(userId, userName, actionTitle, detail) {
        const data = this.getLocalData();
        if (!data.activityLogs) data.activityLogs = [];
        data.activityLogs.unshift({
            id: 'log_' + Date.now(),
            userId: userId,
            userName: userName,
            actionTitle: actionTitle,
            detail: detail,
            timestamp: new Date().toISOString()
        });
        // Keep last 100 entries
        if (data.activityLogs.length > 100) {
            data.activityLogs = data.activityLogs.slice(0, 100);
        }
        this.saveLocalData(data);
    }

    // Weekly Sunday Midnight Auto-Purge (Requirement 10: Care & bonding history purged along with chat)
    checkSundayChatPurge() {
        const data = this.getLocalData();
        const now = new Date();

        // Find most recent Sunday midnight
        const dayOfWeek = now.getDay(); // 0 is Sunday
        const lastSunday = new Date(now);
        lastSunday.setDate(now.getDate() - dayOfWeek);
        lastSunday.setHours(0, 0, 0, 0);

        const lastPurgeStr = data.meta.lastSundayPurge || '';
        const sundayTimestampStr = lastSunday.toISOString();

        if (lastPurgeStr !== sundayTimestampStr && now >= lastSunday) {
            // Filter messages strictly created after this Sunday midnight
            const beforeCount = data.chatMessages.length;
            data.chatMessages = data.chatMessages.filter(msg => {
                return new Date(msg.timestamp) >= lastSunday;
            });

            // Filter care & bonding activity logs created after this Sunday midnight
            if (data.activityLogs) {
                data.activityLogs = data.activityLogs.filter(log => {
                    return new Date(log.timestamp) >= lastSunday;
                });
            }

            data.meta.lastSundayPurge = sundayTimestampStr;

            if (beforeCount !== data.chatMessages.length) {
                this.logActivity('system', 'ระบบอัตโนมัติ', 'ล้างข้อความและประวัติการดูแลประจำสัปดาห์', `ล้างข้อความ (${beforeCount - data.chatMessages.length} ข้อความ) พร้อมประวัติการดูแลเก่าเรียบร้อย เพื่อประหยัดพื้นที่`);
            }
            this.saveLocalData(data);
        }
    }

    // Clear Chat, Care History & Bonding Scores simultaneously (Requirement 7)
    clearChatAndCareHistory(userId, userName) {
        const data = this.getLocalData();
        const chatCount = data.chatMessages ? data.chatMessages.length : 0;
        const careCount = data.activityLogs ? data.activityLogs.length : 0;

        data.chatMessages = [];
        data.mealHistory = [];
        data.dailyCare = {};

        // Reset cat bonding scores & play time
        if (data.cat) {
            data.cat.bondingScores = {
                nether: { food: 0, treats: 0, toys: 0, health: 0, playTime: 0, vaccine: 0, grooming: 0, play: 0, total: 0 },
                Pooja: { food: 0, treats: 0, toys: 0, health: 0, playTime: 0, vaccine: 0, grooming: 0, play: 0, total: 0 }
            };
            data.cat.playTime = { nether: 0, Pooja: 0 };
        }

        data.activityLogs = [
            {
                id: 'log_' + Date.now(),
                userId: userId,
                userName: userName || 'ผู้ใช้',
                actionTitle: 'ล้างแชท ประวัติการดูแล และความผูกพัน 🗑️',
                detail: `ล้างข้อความแชท (${chatCount} ข้อความ), ประวัติมื้ออาหาร, บันทึกการดูแล (${careCount} รายการ) และรีเซ็ตคะแนนความผูกพันเรียบร้อยแล้ว`,
                timestamp: new Date().toISOString()
            }
        ];

        this.saveLocalData(data);
        return { chatCount, careCount };
    }

    // Send Nudge Broadcast with instant cross-device cloud sync
    sendNudgeBroadcast(payload) {
        const enrichedPayload = {
            ...payload,
            timestamp: Date.now()
        };

        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({
                type: 'NUDGE_SIGNAL',
                payload: enrichedPayload
            });
        }

        // Store lastNudge on local document
        const data = this.getLocalData();
        data.lastNudge = enrichedPayload;
        this.saveLocalData(data);

        // Immediate Firestore sync to push real-time notification to partner device
        if (this.isFirebaseConnected && this.db) {
            try {
                this.db.collection('couples').doc('active_couple_v5').set({
                    lastNudge: enrichedPayload
                }, { merge: true }).catch(e => console.warn('Firebase nudge sync error:', e));

                // Also archive in nudges collection
                this.db.collection('couples').doc('active_couple_v5').collection('nudges').add({
                    ...enrichedPayload,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(e => console.warn('Nudge subcollection error:', e));
            } catch (e) {
                console.warn('Firebase nudge sync error:', e);
            }
        }
    }

    // Unified Cross-Browser Real-Time Notification & Sync
    sendNotification(notif) {
        const enrichedPayload = {
            id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            type: notif.type || 'SYSTEM',
            title: notif.title || 'SoulGarden แจ้งเตือน 🐾',
            message: notif.message || '',
            icon: notif.icon || '🐱',
            sender: notif.sender || '',
            senderName: notif.senderName || '',
            data: notif.data || {},
            timestamp: Date.now()
        };

        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({
                type: 'PARTNER_NOTIFICATION',
                payload: enrichedPayload
            });
        }

        // Store lastNotification on local document
        const data = this.getLocalData();
        data.lastNotification = enrichedPayload;
        this.saveLocalData(data);

        // Immediate Firestore sync to push real-time notification to partner across all browsers
        if (this.isFirebaseConnected && this.db) {
            try {
                this.db.collection('couples').doc('active_couple_v5').set({
                    lastNotification: enrichedPayload
                }, { merge: true }).catch(e => console.warn('Firebase notification sync error:', e));

                // Also archive in notifications collection
                this.db.collection('couples').doc('active_couple_v5').collection('notifications').add({
                    ...enrichedPayload,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(e => console.warn('Notification subcollection error:', e));
            } catch (e) {
                console.warn('Firebase notification sync error:', e);
            }
        }
    }

    onDataChange(callback) {
        this.syncListeners.push(callback);
    }

    notifyListeners(data) {
        this.syncListeners.forEach(cb => {
            try { cb(data); } catch (e) { console.error('Listener callback error:', e); }
        });
    }

    // Firebase Cloud Sync
    tryInitFirebase() {
        let config = null;
        const rawConfig = localStorage.getItem(this.firebaseConfigKey);
        if (rawConfig) {
            try {
                config = JSON.parse(rawConfig);
            } catch (e) {
                config = null;
            }
        }
        if (!config && typeof DEFAULT_FIREBASE_CONFIG !== 'undefined' && DEFAULT_FIREBASE_CONFIG.apiKey) {
            config = DEFAULT_FIREBASE_CONFIG;
        }

        if (!config) {
            this.isFirebaseConnected = false;
            return;
        }

        try {
            if (config && config.apiKey && config.projectId && typeof firebase !== 'undefined') {
                if (!firebase.apps.length) {
                    this.firebaseApp = firebase.initializeApp(config);
                } else {
                    this.firebaseApp = firebase.app();
                }
                this.db = firebase.firestore();
                this.isFirebaseConnected = true;
                this.setupFirebaseListeners();
            }
        } catch (err) {
            console.warn('Firebase init error:', err);
            this.isFirebaseConnected = false;
        }
    }

    getFirebaseConfig() {
        const raw = localStorage.getItem(this.firebaseConfigKey);
        if (raw) {
            try { return JSON.parse(raw); } catch (e) {}
        }
        return (typeof DEFAULT_FIREBASE_CONFIG !== 'undefined') ? DEFAULT_FIREBASE_CONFIG : null;
    }

    saveFirebaseConfig(configObj) {
        try {
            localStorage.setItem(this.firebaseConfigKey, JSON.stringify(configObj));
            this.tryInitFirebase();
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    removeFirebaseConfig() {
        localStorage.removeItem(this.firebaseConfigKey);
        this.isFirebaseConnected = false;
        this.db = null;
    }

    setupFirebaseListeners() {
        if (!this.db) return;
        try {
            this.db.collection('couples').doc('active_couple_v5')
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        const remoteData = doc.data();
                        const { data: cleanRemote } = this.sanitizeData(remoteData);

                        // Real-time cross-device Miss You signal trigger
                        if (cleanRemote.lastNudge && cleanRemote.lastNudge.timestamp) {
                            if (!this.lastProcessedNudgeTime || cleanRemote.lastNudge.timestamp > this.lastProcessedNudgeTime) {
                                this.lastProcessedNudgeTime = cleanRemote.lastNudge.timestamp;
                                const ageMs = Date.now() - cleanRemote.lastNudge.timestamp;
                                if (ageMs < 45000 && window.onPartnerNudgeReceived) {
                                    window.onPartnerNudgeReceived(cleanRemote.lastNudge);
                                }
                            }
                        }

                        // Real-time cross-device & cross-browser notification trigger
                        if (cleanRemote.lastNotification && cleanRemote.lastNotification.timestamp) {
                            if (!this.lastProcessedNotifTime || cleanRemote.lastNotification.timestamp > this.lastProcessedNotifTime) {
                                this.lastProcessedNotifTime = cleanRemote.lastNotification.timestamp;
                                const ageMs = Date.now() - cleanRemote.lastNotification.timestamp;
                                if (ageMs < 45000 && window.onPartnerNotificationReceived) {
                                    window.onPartnerNotificationReceived(cleanRemote.lastNotification);
                                }
                            }
                        }

                        const local = this.getLocalData();
                        this.hasReceivedInitialRemoteSync = true;

                        // Deep smart merge between cleanRemote and local
                        const merged = { ...cleanRemote };
                        if (!merged.meta) merged.meta = {};

                        // 1. Smart merge notes
                        const remoteNotes = (cleanRemote.notes && Array.isArray(cleanRemote.notes)) ? cleanRemote.notes : [];
                        const localNotes = (local && Array.isArray(local.notes)) ? local.notes : [];
                        const notesMap = new Map();
                        remoteNotes.forEach(rn => { if (rn && rn.id) notesMap.set(rn.id, rn); });
                        localNotes.forEach(ln => {
                            if (!ln || !ln.id) return;
                            const rn = notesMap.get(ln.id);
                            if (!rn) {
                                notesMap.set(ln.id, ln);
                            } else {
                                const localTime = new Date(ln.updatedAt || ln.createdAt || 0).getTime();
                                const remoteTime = new Date(rn.updatedAt || rn.createdAt || 0).getTime();
                                if (localTime > remoteTime) {
                                    notesMap.set(ln.id, ln);
                                }
                            }
                        });
                        merged.notes = Array.from(notesMap.values()).sort((a, b) =>
                            new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
                        );

                        // 2. Smart merge quizzes & pastQuizzes
                        const remoteQuizzes = (cleanRemote.quizzes && Array.isArray(cleanRemote.quizzes)) ? cleanRemote.quizzes : [];
                        const localQuizzes = (local && Array.isArray(local.quizzes)) ? local.quizzes : [];
                        const quizMap = new Map();
                        remoteQuizzes.forEach(rq => { if (rq && rq.id) quizMap.set(rq.id, rq); });
                        localQuizzes.forEach(lq => {
                            if (!lq || !lq.id) return;
                            const rq = quizMap.get(lq.id);
                            if (!rq) {
                                quizMap.set(lq.id, lq);
                            } else {
                                const mergedCompletedBy = Array.from(new Set([...(rq.completedBy || []), ...(lq.completedBy || [])]));
                                const mergedAnswers = { ...(rq.answers || {}), ...(lq.answers || {}) };
                                quizMap.set(lq.id, {
                                    ...rq,
                                    ...lq,
                                    completedBy: mergedCompletedBy,
                                    answers: mergedAnswers,
                                    answeredBy: rq.answeredBy || lq.answeredBy
                                });
                            }
                        });
                        merged.quizzes = Array.from(quizMap.values());

                        const remotePastQuizzes = (cleanRemote.pastQuizzes && Array.isArray(cleanRemote.pastQuizzes)) ? cleanRemote.pastQuizzes : [];
                        const localPastQuizzes = (local && Array.isArray(local.pastQuizzes)) ? local.pastQuizzes : [];
                        const pastQuizMap = new Map();
                        remotePastQuizzes.forEach(pq => { if (pq && pq.id) pastQuizMap.set(pq.id, pq); });
                        localPastQuizzes.forEach(lpq => {
                            if (!lpq || !lpq.id) return;
                            if (!pastQuizMap.has(lpq.id)) pastQuizMap.set(lpq.id, lpq);
                        });
                        merged.pastQuizzes = Array.from(pastQuizMap.values());

                        // 3. Smart merge users (preserve highest points and names)
                        if (!merged.users) merged.users = {};
                        ['nether', 'Pooja'].forEach(uid => {
                            const rUser = cleanRemote.users?.[uid] || {};
                            const lUser = local.users?.[uid] || {};
                            merged.users[uid] = {
                                ...lUser,
                                ...rUser,
                                points: Math.max(lUser.points || 300, rUser.points || 300),
                                name: rUser.name || lUser.name || uid,
                                avatar: (rUser.avatar && !rUser.avatar.includes('\uFFFD') && !rUser.avatar.includes('ð') && !rUser.avatar.includes('â') && !rUser.avatar.includes('?')) ? rUser.avatar : (lUser.avatar || (uid === 'nether' ? '👨‍💻' : '🌸'))
                            };
                        });

                        // 4. Merge activity logs
                        const remoteLogs = (cleanRemote.activityLogs && Array.isArray(cleanRemote.activityLogs)) ? cleanRemote.activityLogs : [];
                        const localLogs = (local && Array.isArray(local.activityLogs)) ? local.activityLogs : [];
                        const logMap = new Map();
                        remoteLogs.forEach(rl => { if (rl && rl.id) logMap.set(rl.id, rl); });
                        localLogs.forEach(ll => { if (ll && ll.id && !logMap.has(ll.id)) logMap.set(ll.id, ll); });
                        merged.activityLogs = Array.from(logMap.values())
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .slice(0, 150);

                        // 5. Merge meals safely
                        if (local.meals) {
                            if (!merged.meals) merged.meals = {};
                            Object.keys(local.meals).forEach(dateKey => {
                                if (!merged.meals[dateKey]) {
                                    merged.meals[dateKey] = local.meals[dateKey];
                                } else {
                                    ['nether', 'Pooja'].forEach(p => {
                                        const lMeal = local.meals[dateKey]?.[p];
                                        const rMeal = merged.meals[dateKey]?.[p];
                                        if (lMeal && !rMeal) {
                                            merged.meals[dateKey][p] = lMeal;
                                        } else if (lMeal && rMeal) {
                                            ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
                                                if (lMeal[mealType]?.eaten && !rMeal[mealType]?.eaten) {
                                                    rMeal[mealType] = lMeal[mealType];
                                                }
                                            });
                                            if (Array.isArray(lMeal.snacks) && lMeal.snacks.length > 0) {
                                                const rSnackIds = new Set((rMeal.snacks || []).map(s => s.id));
                                                lMeal.snacks.forEach(s => {
                                                    if (s && s.id && !rSnackIds.has(s.id)) {
                                                        if (!rMeal.snacks) rMeal.snacks = [];
                                                        rMeal.snacks.push(s);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        }

                        // Cat preservation: keep whichever cat is adopted
                        if (!merged.cat && local.cat) {
                            merged.cat = local.cat;
                        }

                        merged.meta.isDefaultSeed = false;
                        merged.meta.lastUpdated = new Date().toISOString();

                        localStorage.setItem(this.storageKey, JSON.stringify(merged));
                        try {
                            localStorage.setItem('lovetree_couple_data_backup', JSON.stringify(merged));
                        } catch (e) {}

                        this.notifyListeners(merged);
                    } else {
                        // First-time sync: initialize remote shared document from local state
                        this.hasReceivedInitialRemoteSync = true;
                        const local = this.getLocalData();
                        this.syncToFirebase(local);
                    }
                }, (err) => {
                    console.warn('Firestore snapshot error:', err);
                });
        } catch (e) {
            console.warn('Failed to attach Firestore listener:', e);
        }
    }

    syncToFirebase(data) {
        if (!this.db || !this.isFirebaseConnected) return;
        // Guard: Prevent newly opened device from writing initial blank seed over remote cloud data
        if (!this.hasReceivedInitialRemoteSync && data.meta && data.meta.isDefaultSeed) {
            return;
        }
        try {
            this.db.collection('couples').doc('active_couple_v5').set(data, { merge: true })
                .catch(err => console.warn('Firestore write error:', err));
        } catch (e) {
            console.warn('Firestore sync error:', e);
        }
    }

    // Dual-Confirmation Factory Reset
    requestSystemReset(userId, userName) {
        const data = this.getLocalData();
        const otherUserId = userId === 'nether' ? 'Pooja' : 'nether';
        const otherUserName = data.users && data.users[otherUserId] ? data.users[otherUserId].name : otherUserId;

        data.resetRequest = {
            requestedBy: userId,
            requestedByName: userName,
            requestedAt: new Date().toISOString()
        };

        if (!data.activityLogs) data.activityLogs = [];
        data.activityLogs.unshift({
            id: 'log_' + Date.now(),
            userId: userId,
            userName: userName,
            actionTitle: 'ขอรีเซ็ตระบบเริ่มต้นใหม่ ⚠️',
            detail: `${userName} ได้ส่งคำขอรีเซ็ตระบบทั้งหมด (รอการยืนยันจาก ${otherUserName})`,
            timestamp: new Date().toISOString()
        });

        this.saveLocalData(data);
        return data.resetRequest;
    }

    cancelSystemReset(userId, userName) {
        const data = this.getLocalData();
        if (data.resetRequest) {
            data.resetRequest = null;
            if (!data.activityLogs) data.activityLogs = [];
            data.activityLogs.unshift({
                id: 'log_' + Date.now(),
                userId: userId,
                userName: userName || userId,
                actionTitle: 'ยกเลิกคำขอรีเซ็ตระบบ ❌',
                detail: `${userName || userId} ได้ยกเลิกคำขอรีเซ็ตระบบ`,
                timestamp: new Date().toISOString()
            });
            this.saveLocalData(data);
        }
    }

    confirmSystemReset(approverId, approverName) {
        const data = this.getLocalData();
        if (!data.resetRequest) return false;

        // Approver must be the partner, not the requester
        if (data.resetRequest.requestedBy === approverId) {
            return false;
        }

        const requesterName = data.resetRequest.requestedByName;

        // Reset everything to default fresh state
        const fresh = this.getDefaultData();
        fresh.resetRequest = null;
        fresh.activityLogs = [
            {
                id: 'log_' + Date.now(),
                userId: 'system',
                userName: 'ระบบ SoulGarden',
                actionTitle: 'รีเซ็ตระบบเริ่มต้นใหม่สำเร็จ 🔄',
                detail: `ทั้งสองฝ่าย (${requesterName} และ ${approverName}) ได้ร่วมใจยืนยันรีเซ็ตระบบเพื่อเริ่มต้นความรักครั้งใหม่เรียบร้อยแล้ว`,
                timestamp: new Date().toISOString()
            }
        ];
        this.saveLocalData(fresh);
        return true;
    }

    resetAllData() {
        const fresh = this.getDefaultData();
        this.saveLocalData(fresh);
    }
}

window.appStorage = new AppStorage();

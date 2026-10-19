// Data Storage & Cloud Firebase Sync Layer (Clean Production State v3.0.0)
// Features: Cat Adoption Flow (initially null), 300 Starting Points, Real-time Online Presence, Auto Sunday Purge

const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyDOjP5SuMK5kY_cnCmiS72f1rc4KxzMooI",
    authDomain: "soulgarden-85cab.firebaseapp.com",
    projectId: "soulgarden-85cab",
    storageBucket: "soulgarden-85cab.firebasestorage.app",
    messagingSenderId: "583313418787",
    appId: "1:583313418787:web:d7735eb91aa7dae58f5f96"
};

class AppStorage {
    constructor() {
        this.storageKey = 'lovetree_couple_data_v3'; // Fresh clean start for adoption & 300 pts
        this.firebaseConfigKey = 'lovetree_firebase_config';
        this.broadcastChannel = null;
        this.firebaseApp = null;
        this.db = null;
        this.isFirebaseConnected = false;
        this.syncListeners = [];

        this.initBroadcast();
        this.initLocalData();
        this.checkSundayChatPurge();
        this.tryInitFirebase();
    }

    initBroadcast() {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            this.broadcastChannel = new BroadcastChannel('lovetree_sync_channel_v3');
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
                }
            };
        }
    }

    // Clean initial start (Reset all test data: no cat initially, 300 pts each)
    getDefaultData() {
        const todayStr = new Date().toISOString().split('T')[0];
        return {
            meta: {
                version: '3.0.0',
                createdYear: 2026,
                currentYear: 2026,
                lastUpdated: new Date().toISOString(),
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
                vaccine: 1,
                grooming_kit: 1
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
            notes: [],
            calendarMoods: {},
            chatMessages: [],
            quizzes: [],      // Today's active question (max 1/day)
            pastQuizzes: [],  // Archived past questions
            postits: [],      // Post-its created exclusively via Lucky Bell harvest (1st & 16th)
            quests: (typeof DEFAULT_QUESTS !== 'undefined') ? DEFAULT_QUESTS : [],
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

    getLocalData() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : this.getDefaultData();
        } catch (e) {
            return this.getDefaultData();
        }
    }

    saveLocalData(data) {
        data.meta.lastUpdated = new Date().toISOString();
        localStorage.setItem(this.storageKey, JSON.stringify(data));

        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'DATA_UPDATED' });
        }

        this.notifyListeners(data);

        if (this.isFirebaseConnected && this.db) {
            this.syncToFirebase(data);
        }
    }

    // Adopt First Cat
    adoptCat(breedId, catName, userId) {
        const data = this.getLocalData();
        const todayStr = new Date().toISOString().split('T')[0];
        const breed = CAT_BREEDS.find(b => b.id === breedId) || CAT_BREEDS[0];
        const finalName = catName && catName.trim() ? catName.trim() : breed.name.split(' ')[0];
        const adopterName = data.users[userId] ? data.users[userId].name : userId;

        data.cat = {
            breed: breed.id,
            name: finalName,
            growthDay: 1,
            growthPercent: 5, // Day 1 kitten
            yesterdayGrowthPercent: 5,
            health: 100,
            fullnessLevel: 80,
            affectionLevel: 80,
            hasFever: false,
            hasLongNails: false,
            lastCareDate: todayStr,
            totalFed: 0,
            totalTreated: 0,
            harvestsThisMonth: 0,
            lastHarvestMonth: '',
            yearCollection: [],
            adoptedBy: userId,
            adoptedDate: todayStr
        };

        if (!data.activityLogs) data.activityLogs = [];
        data.activityLogs.unshift({
            id: 'log_' + Date.now(),
            userId: userId,
            userName: adopterName,
            actionTitle: 'รับเลี้ยงน้องแมวตัวแรก 🐱',
            detail: `ร่วมใจรับเลี้ยง '${finalName}' พันธุ์${breed.name} เข้าสู่บ้านความรักเรียบร้อยแล้ว!`,
            timestamp: new Date().toISOString()
        });

        this.saveLocalData(data);
        return data.cat;
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
                this.db.collection('couples').doc('active_couple').set({
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

    // Weekly Sunday Midnight Auto-Purge
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
            data.meta.lastSundayPurge = sundayTimestampStr;

            if (beforeCount !== data.chatMessages.length) {
                this.logActivity('system', 'ระบบอัตโนมัติ', 'ล้างข้อความประจำสัปดาห์', `ล้างข้อความเก่าเรียบร้อย (${beforeCount - data.chatMessages.length} ข้อความ) เพื่อประหยัดพื้นที่`);
            }
            this.saveLocalData(data);
        }
    }

    // Send Nudge Broadcast
    sendNudgeBroadcast(payload) {
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({
                type: 'NUDGE_SIGNAL',
                payload: payload
            });
        }
        if (this.isFirebaseConnected && this.db) {
            try {
                this.db.collection('couples').doc('active_couple').collection('nudges').add({
                    ...payload,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (e) {
                console.warn('Firebase nudge sync error:', e);
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
            this.db.collection('couples').doc('active_couple')
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        const remoteData = doc.data();
                        const local = this.getLocalData();
                        if (remoteData.meta && (!local.meta || remoteData.meta.lastUpdated > local.meta.lastUpdated)) {
                            localStorage.setItem(this.storageKey, JSON.stringify(remoteData));
                            this.notifyListeners(remoteData);
                        }
                    } else {
                        // First-time sync: initialize remote shared document from local state
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
        try {
            this.db.collection('couples').doc('active_couple').set(data, { merge: true })
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

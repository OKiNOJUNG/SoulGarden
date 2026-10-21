// SoulGarden Cat Edition - Application Controller
// Orchestrates 3D Cat Companion, Sunday auto-purge, 1st & 16th lucky bells, audit logs, and locked bedtime

class AppController {
    constructor() {
        this.currentUser = null;
        this.currentView = 'view-login';
        this.garden3D = null;
        this.currentMealPartner = 'nether';
        this.calendarDate = new Date();
        this.selectedCalendarDateStr = new Date().toISOString().split('T')[0];
        this.selectedBedtimeMood = 'happy';
        this.presenceInterval = null;
        this.selectedAdoptBreed = 'orange_tabby';
        this.currentManualStep = 0;
        this.activePlayTimer = null;
        this.activePlaySeconds = 0;
        this.activePlayToy = 'hands';
        this.currentMealHistoryPartner = 'all';
        this.pendingChatImages = [];
        this.activeActivityCategory = 'all';
        this.activitySearchTerm = '';

        this.init();
    }

    init() {
        this.bindEvents();
        this.checkExistingSession();

        window.addEventListener('beforeunload', () => {
            if (this.currentUser) {
                window.appStorage.updatePresence(this.currentUser, false);
            }
        });
    }

    checkExistingSession() {
        const savedUserId = sessionStorage.getItem('lovetree_active_user') || localStorage.getItem('lovetree_active_user');
        if (savedUserId && (savedUserId === 'nether' || savedUserId === 'Pooja')) {
            this.setLoggedInUser(savedUserId);
        } else {
            this.currentUser = null;
            sessionStorage.removeItem('lovetree_active_user');
            localStorage.removeItem('lovetree_active_user');
            const viewport = document.getElementById('appViewport');
            if (viewport) viewport.classList.add('is-logged-out');

            const topBar = document.getElementById('topAppBar');
            if (topBar) topBar.style.display = 'none';

            const bottomNav = document.getElementById('bottomNavBar');
            if (bottomNav) bottomNav.style.display = 'none';

            const presBar = document.getElementById('onlinePresenceBar');
            if (presBar) presBar.style.display = 'none';

            this.navigateTo('view-login');
        }
    }

    setLoggedInUser(userId) {
        this.currentUser = userId;
        sessionStorage.setItem('lovetree_active_user', userId);
        localStorage.setItem('lovetree_active_user', userId);

        const viewport = document.getElementById('appViewport');
        if (viewport) viewport.classList.remove('is-logged-out');

        const topBar = document.getElementById('topAppBar');
        if (topBar) topBar.style.display = 'flex';

        const bottomNav = document.getElementById('bottomNavBar');
        if (bottomNav) bottomNav.style.display = 'flex';

        const presBar = document.getElementById('onlinePresenceBar');
        if (presBar) presBar.style.display = 'flex';

        // Render header and top-bar lucide icons immediately on display
        if (window.lucide) window.lucide.createIcons();

        this.updateHeaderUserInfo();
        this.updateAllUINames();
        if (window.appStorage) {
            window.appStorage.updatePresence(this.currentUser, true);
        }
        this.startPresenceHeartbeat();
        this.updatePresenceUI();

        if (!this.garden3D) {
            setTimeout(() => {
                this.garden3D = new Garden3D('threeGardenContainer');
                this.syncGardenState();
            }, 100);
        }

        this.navigateTo('view-garden');
        try { this.renderAll(); } catch (e) { console.error('renderAll error:', e); }
        try { this.checkMorningReport(); } catch (e) { console.error('checkMorningReport error:', e); }

        // Check if first-time onboarding manual or cat adoption needed
        const initialData = window.appStorage.getLocalData();
        const me = initialData.users ? initialData.users[this.currentUser] : null;
        if (me && !me.hasSeenWelcomeManual) {
            setTimeout(() => {
                this.openWelcomeManual(0);
            }, 300);
        } else if (!initialData.cat) {
            setTimeout(() => {
                this.openCatAdoptionModal();
            }, 350);
        }

        // Listen for real-time storage changes
        if (!this.storageListenerAttached && window.appStorage) {
            this.storageListenerAttached = true;
            window.appStorage.onDataChange(() => {
                const data = window.appStorage.getLocalData();
                this.updateAllUINames(data);
                this.renderAll();
                this.syncGardenState();
                this.updatePresenceUI();
            });
        }

        // Nudge listener (Cross-device & local)
        window.onPartnerNudgeReceived = (payload) => {
            if (payload && payload.sender !== this.currentUser) {
                window.soundManager.playNudge('heartbeat');
                this.triggerFullScreenMissYouVFX(payload.senderName, payload.message, false);
            }
        };

        // Cross-Browser Partner & Cat Real-Time Notification Listener
        window.onPartnerNotificationReceived = (payload) => {
            this.handleIncomingPartnerNotification(payload);
        };
    }

    startPresenceHeartbeat() {
        if (this.presenceInterval) clearInterval(this.presenceInterval);
        this.presenceInterval = setInterval(() => {
            if (this.currentUser) {
                window.appStorage.updatePresence(this.currentUser, true);
                this.updatePresenceUI();
                try { this.updateNavBadges(); } catch (e) {}
                try { this.checkCatStatusAlerts(); } catch (e) {}
            }
        }, 5000); // 5-second heartbeat for responsive badges and presence
    }

    updatePresenceUI() {
        const data = window.appStorage.getLocalData();
        const presence = data.presence || {};
        const now = Date.now();
        const threshold = 75000; // 75 seconds window

        const netherInfo = presence.nether || {};
        const poojaInfo = presence.Pooja || {};

        const isNetherOnline = netherInfo.online && netherInfo.lastActive && (now - new Date(netherInfo.lastActive).getTime() < threshold);
        const isPoojaOnline = poojaInfo.online && poojaInfo.lastActive && (now - new Date(poojaInfo.lastActive).getTime() < threshold);

        const netherDot = document.getElementById('dotNether') || document.getElementById('statusDotNether');
        const netherText = document.getElementById('labelNether') || document.getElementById('statusTextNether');
        const poojaDot = document.getElementById('dotPooja') || document.getElementById('statusDotPooja');
        const poojaText = document.getElementById('labelPooja') || document.getElementById('statusTextPooja');
        const togetherBadge = document.getElementById('presenceCenterBadge') || document.getElementById('togetherActiveBadge');

        if (netherDot && netherText) {
            if (isNetherOnline) {
                netherDot.className = 'presence-dot online';
                netherText.innerText = 'ออนไลน์';
            } else {
                netherDot.className = 'presence-dot offline';
                netherText.innerText = 'ออฟไลน์';
            }
        }

        if (poojaDot && poojaText) {
            if (isPoojaOnline) {
                poojaDot.className = 'presence-dot online';
                poojaText.innerText = 'ออนไลน์';
            } else {
                poojaDot.className = 'presence-dot offline';
                poojaText.innerText = 'ออฟไลน์';
            }
        }

        if (togetherBadge) {
            if (isNetherOnline && isPoojaOnline) {
                togetherBadge.classList.add('active');
            } else {
                togetherBadge.classList.remove('active');
            }
        }
    }

    logout() {
        if (this.currentUser && window.appStorage) {
            window.appStorage.updatePresence(this.currentUser, false);
        }
        if (this.presenceInterval) {
            clearInterval(this.presenceInterval);
            this.presenceInterval = null;
        }
        sessionStorage.removeItem('lovetree_active_user');
        localStorage.removeItem('lovetree_active_user');
        this.currentUser = null;

        const viewport = document.getElementById('appViewport');
        if (viewport) viewport.classList.add('is-logged-out');

        const topBar = document.getElementById('topAppBar');
        if (topBar) topBar.style.display = 'none';

        const bottomNav = document.getElementById('bottomNavBar');
        if (bottomNav) bottomNav.style.display = 'none';

        const presBar = document.getElementById('onlinePresenceBar');
        if (presBar) presBar.style.display = 'none';

        this.navigateTo('view-login');
        if (window.soundManager) window.soundManager.playClick();
        this.showToast('ออกจากระบบเรียบร้อย');
    }

    getPartnerName() {
        const partnerId = this.currentUser === 'nether' ? 'Pooja' : 'nether';
        const data = window.appStorage ? window.appStorage.getLocalData() : null;
        return (data && data.users && data.users[partnerId] && data.users[partnerId].name) ? data.users[partnerId].name : partnerId;
    }

    getUserName(userId) {
        if (!userId) userId = this.currentUser;
        const data = window.appStorage ? window.appStorage.getLocalData() : null;
        return (data && data.users && data.users[userId] && data.users[userId].name) ? data.users[userId].name : (userId || '');
    }

    updateHeaderUserInfo() {
        if (!this.currentUser || !window.appStorage) return;
        const data = window.appStorage.getLocalData();
        const me = data.users ? data.users[this.currentUser] : null;
        if (!me) return;

        const partnerId = this.currentUser === 'nether' ? 'Pooja' : 'nether';
        const partner = data.users ? data.users[partnerId] : null;

        const isCorrupted = (str) => {
            if (!str || typeof str !== 'string') return true;
            if (str.includes('\uFFFD') || str.includes('ð') || str.includes('â') || str.includes('?')) return true;
            return false;
        };

        const myAvatar = (!me.avatar || isCorrupted(me.avatar)) ? (this.currentUser === 'nether' ? '👨‍💻' : '🌸') : me.avatar;
        const partnerAvatar = (!partner || !partner.avatar || isCorrupted(partner.avatar)) ? (partnerId === 'nether' ? '👨‍💻' : '🌸') : partner.avatar;

        const myBadge = document.getElementById('myAvatarBadge');
        if (myBadge) myBadge.innerText = myAvatar;

        const partnerBadge = document.getElementById('partnerAvatarBadge');
        if (partnerBadge && partner) partnerBadge.innerText = partnerAvatar;

        const namesDisplay = document.getElementById('coupleNamesDisplay');
        if (namesDisplay && partner) namesDisplay.innerText = `${me.name} & ${partner.name}`;

        const pointsDisplay = document.getElementById('userPointsDisplay');
        if (pointsDisplay) pointsDisplay.innerText = me.points;

        // Settings button visible strictly to ID: nether only
        const settingsBtn = document.getElementById('appSettingsBtn');
        if (settingsBtn) {
            settingsBtn.style.display = (this.currentUser === 'nether') ? 'flex' : 'none';
        }

        this.currentMealPartner = this.currentUser;
        this.updateMealPartnerTabs();
    }

    navigateTo(viewId) {
        // Strict Auth Guard: If not logged in, force view-login and deny access to any inner screen
        if (!this.currentUser) {
            viewId = 'view-login';
        }

        if (this.currentView === viewId && document.getElementById(viewId)?.classList.contains('active-view')) {
            this.setNavSeenTime(viewId);
            try { this.updateNavBadges(); } catch (e) {}
            return;
        }

        const views = document.querySelectorAll('.view-section');
        views.forEach(v => v.classList.remove('active-view'));

        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active-view');
            this.currentView = viewId;
            this.setNavSeenTime(viewId);
            try { this.updateNavBadges(); } catch (e) {}
        }

        const navBtns = document.querySelectorAll('.nav-item-btn');
        navBtns.forEach(btn => {
            if (btn.getAttribute('data-target') === viewId) {
                btn.classList.add('active-nav');
            } else {
                btn.classList.remove('active-nav');
            }
        });

        // Trigger dynamic render for active view
        if (viewId === 'view-garden') {
            try { this.renderGardenView(); } catch (e) {}
            if (this.garden3D) setTimeout(() => this.garden3D.onResize(), 60);
        } else if (viewId === 'view-quests') {
            try { this.renderQuestsView(); } catch (e) {}
        } else if (viewId === 'view-meals') {
            try { this.renderMealsView(); } catch (e) {}
        } else if (viewId === 'view-calendar') {
            try { this.renderCalendarView(); } catch (e) {}
        } else if (viewId === 'view-notes') {
            try { this.renderNotesView(); } catch (e) {}
        } else if (viewId === 'view-chat') {
            try { this.renderChatView(); } catch (e) {}
        } else if (viewId === 'view-quiz') {
            try { this.renderQuizView(); } catch (e) {}
        } else if (viewId === 'view-postits') {
            try { this.renderPostitView(); } catch (e) {}
        }

        window.scrollTo(0, 0);
        if (window.lucide) window.lucide.createIcons();
    }

    getNavSeenTimes() {
        try {
            const raw = localStorage.getItem(`lovetree_nav_seen_${this.currentUser}`);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    setNavSeenTime(viewId) {
        if (!this.currentUser || !viewId) return;
        const times = this.getNavSeenTimes();
        times[viewId] = Date.now();
        try {
            localStorage.setItem(`lovetree_nav_seen_${this.currentUser}`, JSON.stringify(times));
        } catch (e) {}
    }

    renderNavBadge(badgeId, count) {
        const el = document.getElementById(badgeId);
        if (!el) return;
        if (count > 0) {
            el.textContent = count > 99 ? '99+' : count;
            el.classList.remove('hidden');
        } else {
            el.textContent = '';
            el.classList.add('hidden');
        }
    }

    updateNavBadges() {
        if (!this.currentUser || this.currentUser === '') return;
        const data = window.appStorage.getLocalData();
        const times = this.getNavSeenTimes();
        const partnerId = this.currentUser === 'nether' ? 'Pooja' : 'nether';
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Chat Badge: unread messages from partner
        let chatCount = 0;
        if (this.currentView === 'view-chat') {
            this.setNavSeenTime('view-chat');
        } else {
            const lastChatTime = times['view-chat'] || 0;
            chatCount = (data.chatMessages || []).filter(m => 
                m.sender !== this.currentUser && (!m.readByPartner || new Date(m.timestamp).getTime() > lastChatTime)
            ).length;
        }
        this.renderNavBadge('badgeNavChat', chatCount);

        // 2. Quests Badge: incomplete daily quests for currentUser
        let questCount = 0;
        if (this.currentView === 'view-quests') {
            this.setNavSeenTime('view-quests');
        } else {
            const questList = (data.quests && Array.isArray(data.quests) && data.quests.length > 0)
                ? data.quests
                : (typeof DEFAULT_QUESTS !== 'undefined' ? DEFAULT_QUESTS : []);

            questList.forEach(q => {
                const isCompleted = this.isQuestCompleted(q, data, todayStr, data.users[this.currentUser]);
                if (!isCompleted) questCount++;
            });
        }
        this.renderNavBadge('badgeNavQuests', questCount);

        // 3. Notes Badge: notes created or updated by partner since last visit
        let notesCount = 0;
        if (this.currentView === 'view-notes') {
            this.setNavSeenTime('view-notes');
        } else {
            const lastNotesTime = times['view-notes'] || 0;
            notesCount = (data.notes || []).filter(n => 
                (n.updatedBy === partnerId || n.author === partnerId) && 
                new Date(n.updatedAt || n.createdAt).getTime() > lastNotesTime
            ).length;
        }
        this.renderNavBadge('badgeNavNotes', notesCount);

        // 4. Meals Badge: partner recorded meal/snack activity since last visit
        let mealsCount = 0;
        if (this.currentView === 'view-meals') {
            this.setNavSeenTime('view-meals');
        } else {
            const lastMealsTime = times['view-meals'] || 0;
            const partnerMeals = data.meals?.[todayStr]?.[partnerId];
            if (partnerMeals) {
                if (partnerMeals.breakfast?.eaten && partnerMeals.breakfast.time) mealsCount++;
                if (partnerMeals.lunch?.eaten && partnerMeals.lunch.time) mealsCount++;
                if (partnerMeals.dinner?.eaten && partnerMeals.dinner.time) mealsCount++;
                if (partnerMeals.snacks && partnerMeals.snacks.length > 0) {
                    mealsCount += partnerMeals.snacks.length;
                }
            }
            if (lastMealsTime > 0 && new Date(lastMealsTime).toISOString().startsWith(todayStr)) {
                mealsCount = Math.max(0, mealsCount - (times['seen_meal_count_' + todayStr] || 0));
            }
        }
        this.renderNavBadge('badgeNavMeals', mealsCount);

        // 5. Calendar Badge: partner bedtime mood submitted today
        let calendarCount = 0;
        if (this.currentView === 'view-calendar') {
            this.setNavSeenTime('view-calendar');
        } else {
            const lastCalTime = times['view-calendar'] || 0;
            const partnerMood = data.calendarMoods?.[todayStr]?.[partnerId];
            if (partnerMood && partnerMood.timestamp && new Date(partnerMood.timestamp).getTime() > lastCalTime) {
                calendarCount = 1;
            }
        }
        this.renderNavBadge('badgeNavCalendar', calendarCount);

        // 6. Quiz Badge: today's quiz ready or partner played
        let quizCount = 0;
        if (this.currentView === 'view-quiz') {
            this.setNavSeenTime('view-quiz');
        } else {
            const lastQuizTime = times['view-quiz'] || 0;
            const todayQuiz = (data.quizzes || []).find(qz => qz.date === todayStr);
            if (todayQuiz) {
                const partnerPlayed = todayQuiz.completedBy && todayQuiz.completedBy.includes(partnerId);
                const userPlayed = todayQuiz.completedBy && todayQuiz.completedBy.includes(this.currentUser);
                if ((partnerPlayed || !userPlayed) && (!lastQuizTime || new Date(todayQuiz.createdAt || todayStr).getTime() > lastQuizTime)) {
                    quizCount = 1;
                }
            }
        }
        this.renderNavBadge('badgeNavQuiz', quizCount);

        // 7. Postits Badge: new postits created since last visit
        let postitsCount = 0;
        if (this.currentView === 'view-postits') {
            this.setNavSeenTime('view-postits');
        } else {
            const lastPostitTime = times['view-postits'] || 0;
            postitsCount = (data.postits || []).filter(p => new Date(p.createdAt).getTime() > lastPostitTime).length;
        }
        this.renderNavBadge('badgeNavPostits', postitsCount);

        // 8. Garden Badge: urgent cat attention needed
        let gardenCount = 0;
        if (this.currentView === 'view-garden') {
            this.setNavSeenTime('view-garden');
        } else if (data.cat) {
            if ((data.cat.fullnessLevel !== undefined && data.cat.fullnessLevel < 30) || (data.cat.health !== undefined && data.cat.health < 30) || data.cat.hasFever || data.cat.hasLongNails) {
                gardenCount = 1;
            }
        }
        this.renderNavBadge('badgeNavGarden', gardenCount);
    }

    checkMorningReport() {
        const data = window.appStorage.getLocalData();
        if (!data.cat) return; // Guard: unadopted state

        const todayStr = new Date().toISOString().split('T')[0];
        const me = data.users ? data.users[this.currentUser] : null;
        if (!me) return;

        // Recalculate continuous growthDay based on adoptedDate
        if (data.cat.adoptedDate) {
            try {
                const adoptedTime = new Date(data.cat.adoptedDate.split('T')[0] + 'T00:00:00').getTime();
                const nowTime = new Date(todayStr + 'T00:00:00').getTime();
                const diffDays = Math.max(1, Math.floor((nowTime - adoptedTime) / (1000 * 60 * 60 * 24)) + 1);
                if (!data.cat.growthDay || diffDays > data.cat.growthDay) {
                    data.cat.growthDay = diffDays;
                }
            } catch (e) {
                console.warn('growthDay calc error:', e);
            }
        }

        // On day rollover, rollover yesterdayGrowthPercent
        if (data.cat.lastCareDate && data.cat.lastCareDate !== todayStr) {
            data.cat.yesterdayGrowthPercent = data.cat.growthPercent || 5;
            data.cat.lastCareDate = todayStr;
            window.appStorage.saveLocalData(data);
        }

        if (me.morningReportViewedDate !== todayStr) {
            setTimeout(() => {
                this.openMorningReportModal();
                me.morningReportViewedDate = todayStr;
                window.appStorage.saveLocalData(data);
                this.syncGardenState();
            }, 600);
        }
    }

    openMorningReportModal() {
        const data = window.appStorage.getLocalData();
        const cat = data.cat;
        if (!cat) {
            this.showToast('ยังไม่มีแมวในสวน โปรดรับเลี้ยงก่อนนะ 🐾');
            return;
        }

        const diff = (cat.growthPercent || 5) - (cat.yesterdayGrowthPercent || 5);
        const sign = diff >= 0 ? `+${diff}%` : `${diff}%`;
        const growthDay = cat.growthDay || 1;

        const nameEl = document.getElementById('reportCatName');
        if (nameEl) nameEl.innerText = cat.name;

        const greetingEl = document.getElementById('reportGreetingSubtext');
        if (greetingEl) {
            greetingEl.innerHTML = `อรุณสวัสดิ์! วันที่ <strong>${growthDay}</strong> แห่งความผูกพัน 🐾<br>น้องแมวได้รับการดูแลอย่างอบอุ่นจากความรักของคุณทั้งสอง`;
        }

        const growthDayEl = document.getElementById('reportGrowthDayText');
        if (growthDayEl) growthDayEl.innerText = `วันที่ ${growthDay} / 365 วันแห่งความผูกพัน`;

        const yGrowthEl = document.getElementById('reportYesterdayGrowth');
        if (yGrowthEl) yGrowthEl.innerText = `${cat.yesterdayGrowthPercent || 5}%`;

        const tGrowthEl = document.getElementById('reportTodayGrowth');
        if (tGrowthEl) tGrowthEl.innerText = `${cat.growthPercent || 5}% (${sign})`;

        const obsEl = document.getElementById('reportObstacleStatus');
        if (obsEl) {
            if (cat.hasFever || cat.hasLongNails) {
                obsEl.innerText = 'น้องแมวเริ่มซึมหรือขนรุงรัง ต้องการการดูแล 🩹';
                obsEl.style.color = '#E65100';
            } else {
                obsEl.innerText = 'สุขภาพดี ร่าเริงสดใส 100% ✨';
                obsEl.style.color = 'var(--accent-mint)';
            }
        }

        this.openModal('modalMorningReport');
        window.soundManager.playReward();
    }

    syncGardenState() {
        if (!this.garden3D) return;
        const data = window.appStorage.getLocalData();
        const cat = data.cat;

        const adoptionHero = document.getElementById('adoptionHeroCard');
        const liveControls = document.getElementById('catLiveCareControls');
        const obstacleBanner = document.getElementById('obstacleBanner');

        if (!cat) {
            if (adoptionHero) {
                adoptionHero.style.display = 'block';
                adoptionHero.classList.remove('hidden');
            }
            if (liveControls) {
                liveControls.style.display = 'none';
                liveControls.classList.add('hidden');
            }
            if (obstacleBanner) obstacleBanner.classList.add('hidden');

            if (this.garden3D) this.garden3D.showEmptyAdoptionBed();

            const catNameEl = document.getElementById('gardenCatName');
            if (catNameEl) catNameEl.innerText = 'ยังไม่มีแมว 🐾 (รอการรับเลี้ยง)';
            const growthDayEl = document.getElementById('gardenGrowthDay');
            if (growthDayEl) growthDayEl.innerText = '0';
            const growthBadgeEl = document.getElementById('growthPercentBadge');
            if (growthBadgeEl) growthBadgeEl.innerText = 'ยังไม่ได้รับเลี้ยง';
            const waterTextEl = document.getElementById('waterPercentText');
            if (waterTextEl) waterTextEl.innerText = '0%';
            const waterBarEl = document.getElementById('waterProgressBar');
            if (waterBarEl) waterBarEl.style.width = '0%';
            const fertTextEl = document.getElementById('fertPercentText');
            if (fertTextEl) fertTextEl.innerText = '0%';
            const fertBarEl = document.getElementById('fertProgressBar');
            if (fertBarEl) fertBarEl.style.width = '0%';
            const healthTextEl = document.getElementById('healthPercentText');
            if (healthTextEl) healthTextEl.innerText = '100%';
            const healthBarEl = document.getElementById('healthProgressBar');
            if (healthBarEl) healthBarEl.style.width = '100%';

            // Inventory counts
            const countWater = document.getElementById('countWaterInv');
            if (countWater) countWater.innerText = `เหลือ ${data.inventory.main_food}`;
            const countFert = document.getElementById('countFertInv');
            if (countFert) countFert.innerText = `เหลือ ${data.inventory.creamy_treat}`;
            const countPest = document.getElementById('countPestInv');
            if (countPest) countPest.innerText = `เหลือ ${data.inventory.vaccine}`;
            const countWeed = document.getElementById('countWeedInv');
            if (countWeed) countWeed.innerText = `เหลือ ${data.inventory.grooming_kit}`;
            return;
        }

        if (adoptionHero) {
            adoptionHero.style.display = 'none';
            adoptionHero.classList.add('hidden');
        }
        if (liveControls) {
            liveControls.style.display = 'block';
            liveControls.classList.remove('hidden');
        }

        // Auto-reveal breed if reached 60 days
        if (cat.growthDay >= 60 && !cat.isRevealed) {
            const revealed = window.appStorage.revealCatBreed();
            if (revealed) {
                Swal.fire({
                    title: '🎉 เผยสายพันธุ์แท้จริงแล้ว! 🐾✨',
                    text: `ยินดีด้วย! คุณทั้งสองช่วยกันดูแลน้องแมวมาครบ 2 เดือน (60 วัน) แล้ว น้องแมวเผยสายพันธุ์ที่แท้จริงคือ: "${revealed.name}" (${revealed.personality})`,
                    icon: 'success'
                });
            }
        }

        if (this.garden3D) {
            this.garden3D.buildCat(cat.breed, cat.growthPercent);
            this.garden3D.setSicknessState(cat.hasFever, cat.hasLongNails);
        }

        const catNameEl = document.getElementById('gardenCatName');
        const yearPillEl = document.getElementById('catYearPill');
        if (catNameEl) {
            if (!cat.isRevealed) {
                catNameEl.innerHTML = `${cat.name} <span>🎁❓</span> <small style="font-size: 11px; color: #8D6E63; font-weight: 600;">(ลูกแมวปริศนา)</small>`;
                if (yearPillEl) yearPillEl.innerText = `ลุ้นพันธุ์: วันที่ ${cat.growthDay}/60`;
            } else {
                const bInfo = CAT_BREEDS[cat.breed] || { name: 'แมวความรัก' };
                catNameEl.innerHTML = `${cat.name} <span>🐾</span> <small style="font-size: 11px; color: var(--accent-coral); font-weight: 700;">(${bInfo.name})</small>`;
                if (yearPillEl) yearPillEl.innerText = cat.growthDay >= 180 ? 'ครบ 6 เดือน (พร้อมเกษียณ)' : `วันที่ ${cat.growthDay}/180`;
            }
        }

        const growthDayEl = document.getElementById('gardenGrowthDay');
        if (growthDayEl) growthDayEl.innerText = cat.growthDay;

        let growthStage = 'ลูกแมวตัวน้อย (Kitten)';
        if (cat.growthPercent >= 60) growthStage = 'แมวโตเต็มวัยสง่างาม (Adult)';
        else if (cat.growthPercent >= 30) growthStage = 'แมววัยรุ่นคล่องแคล่ว (Teen)';

        const growthBadgeEl = document.getElementById('growthPercentBadge');
        if (growthBadgeEl) growthBadgeEl.innerText = `เติบโต ${cat.growthPercent}% (${growthStage})`;
        const waterTextEl = document.getElementById('waterPercentText');
        if (waterTextEl) waterTextEl.innerText = `${cat.fullnessLevel}%`;
        const waterBarEl = document.getElementById('waterProgressBar');
        if (waterBarEl) waterBarEl.style.width = `${cat.fullnessLevel}%`;
        const fertTextEl = document.getElementById('fertPercentText');
        if (fertTextEl) fertTextEl.innerText = `${cat.affectionLevel}%`;
        const fertBarEl = document.getElementById('fertProgressBar');
        if (fertBarEl) fertBarEl.style.width = `${cat.affectionLevel}%`;
        const healthTextEl = document.getElementById('healthPercentText');
        if (healthTextEl) healthTextEl.innerText = `${cat.health}%`;
        const healthBarEl = document.getElementById('healthProgressBar');
        if (healthBarEl) healthBarEl.style.width = `${cat.health}%`;

        // Real-time Inventory Counts
        const countWater = document.getElementById('countWaterInv');
        if (countWater) countWater.innerText = `เหลือ ${data.inventory.main_food}`;
        const countFert = document.getElementById('countFertInv');
        if (countFert) countFert.innerText = `เหลือ ${data.inventory.creamy_treat}`;
        const countPest = document.getElementById('countPestInv');
        if (countPest) countPest.innerText = `เหลือ ${data.inventory.vaccine}`;
        const countWeed = document.getElementById('countWeedInv');
        if (countWeed) countWeed.innerText = `เหลือ ${data.inventory.grooming_kit}`;

        // Anti-Spam 100% Care Caps UI Styling
        const actWater = document.getElementById('actWaterBtn');
        if (actWater) {
            if (cat.fullnessLevel >= 100) {
                actWater.style.opacity = '0.55';
                actWater.title = 'ความอิ่ม 100% แล้ว (ไม่สามารถป้อนเพิ่มได้ เพื่อกันการอัดของ)';
            } else {
                actWater.style.opacity = '1';
                actWater.title = 'ให้อาหารหลัก';
            }
        }
        const actFert = document.getElementById('actFertBtn');
        if (actFert) {
            if (cat.affectionLevel >= 100) {
                actFert.style.opacity = '0.55';
                actFert.title = 'ความสุขผูกพัน 100% แล้ว (ไม่สามารถให้ขนมเพิ่มได้ เพื่อกันการอัดของ)';
            } else {
                actFert.style.opacity = '1';
                actFert.title = 'ให้แมวเลีย';
            }
        }
        const actPest = document.getElementById('actPestBtn');
        const actWeed = document.getElementById('actWeedBtn');
        const isHealthMaxed = cat.health >= 100 && !cat.hasFever && !cat.hasLongNails;
        if (actPest) {
            actPest.style.opacity = isHealthMaxed ? '0.55' : '1';
            actPest.title = isHealthMaxed ? 'สุขภาพกาย 100% แล้ว (เพื่อกันการอัดของ)' : 'ฉีดวัคซีน';
        }
        if (actWeed) {
            actWeed.style.opacity = isHealthMaxed ? '0.55' : '1';
            actWeed.title = isHealthMaxed ? 'สุขภาพกาย 100% แล้ว (เพื่อกันการอัดของ)' : 'ตัดขนตัดเล็บ';
        }

        // Sickness banner
        if (cat.hasFever || cat.hasLongNails) {
            if (obstacleBanner) obstacleBanner.classList.remove('hidden');
            if (cat.hasFever && cat.hasLongNails) {
                document.getElementById('obstacleBannerText').innerText = 'น้องแมวไม่สบายและขนเล็บรุงรัง!';
            } else if (cat.hasFever) {
                document.getElementById('obstacleBannerText').innerText = 'น้องแมวเริ่มซึม มีไข้ ต้องการวัคซีน!';
            } else {
                document.getElementById('obstacleBannerText').innerText = 'น้องแมวเล็บยาวและขนพันกัน!';
            }
        } else {
            if (obstacleBanner) obstacleBanner.classList.add('hidden');
        }
    }

    renderAll() {
        if (!this.currentUser || !window.appStorage) return;

        try { this.updateAllUINames(); } catch (e) { console.error('updateAllUINames error:', e); }
        try { this.renderGardenView(); } catch (e) { console.error('GardenView error:', e); }
        try { this.renderQuestsView(); } catch (e) { console.error('QuestsView error:', e); }
        try { this.renderMealsView(); } catch (e) { console.error('MealsView error:', e); }
        try { this.renderNotesView(); } catch (e) { console.error('NotesView error:', e); }
        try { this.renderCalendarView(); } catch (e) { console.error('CalendarView error:', e); }
        try { this.renderChatView(); } catch (e) { console.error('ChatView error:', e); }
        try { this.renderQuizView(); } catch (e) { console.error('QuizView error:', e); }
        try { this.renderPostitView(); } catch (e) { console.error('PostitView error:', e); }
        try { this.renderYearCollection(); } catch (e) { console.error('YearCollection error:', e); }
        try { this.renderActivityLogs(); } catch (e) { console.error('ActivityLogs error:', e); }
        try { this.renderResetSection(); } catch (e) { console.error('ResetSection error:', e); }
        try { this.updateFirebaseSettingsUI(); } catch (e) { console.error('FirebaseSettings error:', e); }
        try { this.updateHeaderPoints(); } catch (e) { console.error('HeaderPoints error:', e); }
        try { this.updateNavBadges(); } catch (e) { console.error('NavBadges error:', e); }

        if (window.lucide) window.lucide.createIcons();
    }

    updateHeaderPoints() {
        if (!this.currentUser) return;
        const data = window.appStorage.getLocalData();
        const me = data.users[this.currentUser];
        if (me) {
            document.getElementById('userPointsDisplay').innerText = me.points;
        }
    }

    renderGardenView() {
        this.syncGardenState();
    }

    isQuestCompleted(q, data, todayStr, me) {
        if (!data) data = window.appStorage.getLocalData();
        if (!todayStr) todayStr = new Date().toISOString().split('T')[0];
        if (!me && this.currentUser && data.users) me = data.users[this.currentUser];

        // 1. Check direct multi-device completedQuests registry
        if (data.completedQuests && data.completedQuests[todayStr] && data.completedQuests[todayStr][this.currentUser] && data.completedQuests[todayStr][this.currentUser][q.id]) {
            return true;
        }

        // 2. Category specific evaluations
        if (q.category === 'checkin') {
            return !!(me && me.lastCheckin === todayStr);
        } else if (q.category === 'care') {
            const userCare = data.dailyCare && data.dailyCare[todayStr] && data.dailyCare[todayStr][this.currentUser];
            return !!(userCare && (userCare.food > 0 || userCare.treats > 0 || userCare.health > 0));
        } else if (q.category === 'play') {
            const userCare = data.dailyCare && data.dailyCare[todayStr] && data.dailyCare[todayStr][this.currentUser];
            const hasPlayCare = !!(userCare && userCare.playTime > 0);
            const hasPlayBy = !!(data.dailyCare && data.dailyCare[todayStr] && data.dailyCare[todayStr].playBy && data.dailyCare[todayStr].playBy[this.currentUser]);
            return hasPlayCare || hasPlayBy;
        } else if (q.category === 'meals') {
            const userMeals = data.meals && data.meals[todayStr] && data.meals[todayStr][this.currentUser];
            return !!(userMeals && (userMeals.breakfast?.eaten || userMeals.lunch?.eaten || userMeals.dinner?.eaten || (userMeals.snacks && userMeals.snacks.length > 0)));
        } else if (q.category === 'notes') {
            const userCare = data.dailyCare && data.dailyCare[todayStr] && data.dailyCare[todayStr][this.currentUser];
            const hasNoteAction = !!(userCare && userCare.noteAction);
            const hasNoteToday = !!(data.notes && data.notes.some(n => 
                (n.author === this.currentUser || n.updatedBy === this.currentUser) && 
                ((n.createdAt && n.createdAt.startsWith(todayStr)) || (n.updatedAt && n.updatedAt.startsWith(todayStr)))
            ));
            return hasNoteAction || hasNoteToday;
        } else if (q.category === 'chat') {
            return !!(data.chatMessages && data.chatMessages.some(m => m.sender === this.currentUser && m.timestamp && m.timestamp.startsWith(todayStr)));
        } else if (q.category === 'bedtime') {
            return !!(data.calendarMoods && data.calendarMoods[todayStr] && data.calendarMoods[todayStr][this.currentUser]);
        } else if (q.category === 'quiz') {
            // Task: เปลี่ยนภารกิจตอบคำถามทายใจประจำวัน เป็นตั้งคำถามทายใจประจำวันแทน
            const hasCreatedQuizToday = !!(
                (data.quizzes && data.quizzes.some(qz => qz.date === todayStr && qz.creator === this.currentUser)) ||
                (data.pastQuizzes && data.pastQuizzes.some(qz => qz.date === todayStr && qz.creator === this.currentUser))
            );
            return hasCreatedQuizToday;
        }
        return false;
    }

    markQuestCompleted(questId) {
        if (!this.currentUser) return;
        const data = window.appStorage.getLocalData();
        const todayStr = new Date().toISOString().split('T')[0];
        if (!data.completedQuests) data.completedQuests = {};
        if (!data.completedQuests[todayStr]) data.completedQuests[todayStr] = {};
        if (!data.completedQuests[todayStr][this.currentUser]) data.completedQuests[todayStr][this.currentUser] = {};
        data.completedQuests[todayStr][this.currentUser][questId] = true;
        window.appStorage.saveLocalData(data);
    }

    // Quests with Clear Tabs and Direct Jump
    renderQuestsView() {
        const data = window.appStorage.getLocalData();
        const me = data.users[this.currentUser];
        const todayStr = new Date().toISOString().split('T')[0];

        document.getElementById('streakCountText').innerText = me.streak;

        const checkinBtn = document.getElementById('dailyCheckinBtn');
        if (me.lastCheckin === todayStr) {
            checkinBtn.disabled = true;
            checkinBtn.innerHTML = `<span>เช็คอินแล้ววันนี้ ✨</span><i data-lucide="check-circle"></i>`;
        } else {
            checkinBtn.disabled = false;
            checkinBtn.innerHTML = `<span>เช็คอินวันนี้ (+40 แต้ม)</span><i data-lucide="check"></i>`;
        }

        const incompContainer = document.getElementById('incompletedQuestsContainer');
        const compContainer = document.getElementById('completedQuestsContainer');
        incompContainer.innerHTML = '';
        compContainer.innerHTML = '';

        let incompleteCount = 0;
        let completeCount = 0;

        const questList = (data.quests && Array.isArray(data.quests) && data.quests.length > 0)
            ? data.quests
            : (typeof DEFAULT_QUESTS !== 'undefined' ? DEFAULT_QUESTS : []);

        questList.forEach(q => {
            const isCompleted = this.isQuestCompleted(q, data, todayStr, me);

            const card = document.createElement('div');
            card.className = `quest-item-card ${isCompleted ? 'completed-quest' : 'clickable-quest'}`;

            card.innerHTML = `
                <div class="quest-left">
                    <div class="quest-icon">🐾</div>
                    <div class="quest-meta">
                        <h4>${q.title}</h4>
                        <p>${q.detail}</p>
                    </div>
                </div>
                <button class="quest-reward-badge ${isCompleted ? 'done' : ''}">
                    ${isCompleted ? 'สำเร็จแล้ว ✓' : `+${q.reward} แต้ม`}
                </button>
            `;

            if (isCompleted) {
                completeCount++;
                compContainer.appendChild(card);
            } else {
                incompleteCount++;
                card.addEventListener('click', () => {
                    this.navigateTo(q.targetView);
                    window.soundManager.playClick();
                });
                incompContainer.appendChild(card);
            }
        });

        document.getElementById('questIncompleteCountBadge').innerText = `รอทำ ${incompleteCount} ข้อ`;
        document.getElementById('questCompleteCountBadge').innerText = `สำเร็จ ${completeCount} ข้อ`;

        // Render Shop
        const shopContainer = document.getElementById('shopItemsContainer');
        shopContainer.innerHTML = '';
        SHOP_ITEMS.forEach(item => {
            const card = document.createElement('div');
            card.className = 'shop-item-card';
            const itemIcon = item.id === 'main_food' ? '🐟' :
                             item.id === 'creamy_treat' ? '💖' :
                             item.id === 'vaccine' ? '💉' :
                             item.id === 'grooming_kit' ? '✂️' :
                             item.id === 'cat_toy_feather' ? '🪶' :
                             item.id === 'cat_toy_yarn' ? '🧶' :
                             item.id === 'cat_toy_laser' ? '⭐' : '🐾';

            card.innerHTML = `
                <div>
                    <div class="shop-item-top">
                        <span class="shop-item-icon">${itemIcon}</span>
                        <span class="shop-item-name">${item.name}</span>
                    </div>
                    <div class="shop-item-desc">${item.desc}</div>
                </div>
                <button class="shop-buy-btn" data-shop-id="${item.id}">
                    <span>แลก ${item.cost} แต้ม</span>
                </button>
            `;
            card.querySelector('.shop-buy-btn').addEventListener('click', () => this.buyShopItem(item));
            shopContainer.appendChild(card);
        });
    }

    renderMealsView() {
        const data = window.appStorage.getLocalData();
        const todayStr = new Date().toISOString().split('T')[0];

        // Auto-initialize today's 3 main meals for both partners if missing!
        if (!data.meals) data.meals = {};
        if (!data.meals[todayStr]) {
            data.meals[todayStr] = {
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
            };
            window.appStorage.saveLocalData(data);
        } else {
            let neededSave = false;
            ['nether', 'Pooja'].forEach(p => {
                if (!data.meals[todayStr][p]) {
                    data.meals[todayStr][p] = {
                        breakfast: { eaten: false, time: '', name: '' },
                        lunch: { eaten: false, time: '', name: '' },
                        dinner: { eaten: false, time: '', name: '' },
                        snacks: []
                    };
                    neededSave = true;
                } else {
                    ['breakfast', 'lunch', 'dinner'].forEach(mKey => {
                        if (!data.meals[todayStr][p][mKey]) {
                            data.meals[todayStr][p][mKey] = { eaten: false, time: '', name: '' };
                            neededSave = true;
                        }
                    });
                    if (!data.meals[todayStr][p].snacks) {
                        data.meals[todayStr][p].snacks = [];
                        neededSave = true;
                    }
                }
            });
            if (neededSave) window.appStorage.saveLocalData(data);
        }

        const dayMeals = data.meals[todayStr][this.currentMealPartner];

        const container = document.getElementById('mealCardsContainer');
        container.innerHTML = '';

        if (!dayMeals) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">ไม่มีข้อมูลมื้ออาหารสำหรับวันนี้</div>`;
            return;
        }

        const mealDefs = [
            { key: 'breakfast', name: 'มื้อเช้า', icon: '☀️' },
            { key: 'lunch', name: 'มื้อเที่ยง / กลางวัน', icon: '🍲' },
            { key: 'dinner', name: 'มื้อเย็น / ค่ำ', icon: '🌙' }
        ];

        mealDefs.forEach(m => {
            const mealData = dayMeals[m.key] || { eaten: false, time: '', name: '' };
            const isEaten = mealData.eaten;
            const card = document.createElement('div');
            card.className = `meal-card ${isEaten ? 'eaten-card' : ''}`;
            card.innerHTML = `
                <div class="meal-card-header">
                    <div class="meal-title-wrap">
                        <span class="meal-icon">${m.icon}</span>
                        <span class="meal-type-title">${m.name}</span>
                    </div>
                    <span class="meal-status-pill ${isEaten ? 'status-eaten' : 'status-waiting'}">
                        ${isEaten ? 'ทานเรียบร้อยแล้ว' : 'ยังไม่ได้รับประทาน'}
                    </span>
                </div>
                <div class="meal-content-text">
                    ${isEaten ? (mealData.name || 'ทานเรียบร้อย (ไม่ได้ระบุเมนู)') : 'รอให้อีกฝ่ายอัปเดต หรือทักไปถามด้วยความห่วงใย'}
                </div>
                <div class="meal-actions-row">
                    <span class="meal-time-stamp">${mealData.time ? `เวลา ${mealData.time} น.` : ''}</span>
                    ${this.currentMealPartner === this.currentUser ? `
                        <button class="edit-meal-btn toggle-meal-btn" data-meal-key="${m.key}">
                            ${isEaten ? 'แก้ไขเมนู' : 'กดว่าทานแล้ว'}
                        </button>
                    ` : `
                        <span style="font-size: 11px; color: var(--text-muted);">ข้อมูลของ ${this.currentMealPartner}</span>
                    `}
                </div>
            `;
            const toggleBtn = card.querySelector('.toggle-meal-btn');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => this.openEditMealModal(m.key, mealData));
            }
            container.appendChild(card);
        });

        if (dayMeals.snacks && dayMeals.snacks.length > 0) {
            dayMeals.snacks.forEach(s => {
                const card = document.createElement('div');
                card.className = 'meal-card eaten-card';
                card.innerHTML = `
                    <div class="meal-card-header">
                        <div class="meal-title-wrap">
                            <span class="meal-icon">🧋</span>
                            <span class="meal-type-title">ของว่าง / ขนมจุกจิก</span>
                        </div>
                        <span class="meal-status-pill status-eaten">มื้อย่อย</span>
                    </div>
                    <div class="meal-content-text">${s.name}</div>
                    <div class="meal-actions-row">
                        <span class="meal-time-stamp">${s.time ? `เวลา ${s.time} น.` : ''}</span>
                        ${this.currentMealPartner === this.currentUser ? `
                            <button class="edit-meal-btn delete-snack-btn" data-snack-id="${s.id}">ลบมื้อนี้</button>
                        ` : ''}
                    </div>
                `;
                const delBtn = card.querySelector('.delete-snack-btn');
                if (delBtn) {
                    delBtn.addEventListener('click', () => this.deleteSnack(s.id));
                }
                container.appendChild(card);
            });
        }
    }

    renderNotesView() {
        const data = window.appStorage.getLocalData();
        const container = document.getElementById('notesGridContainer');
        container.innerHTML = '';

        if (!data.notes || data.notes.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 25px;">ยังไม่มีโน้ตเตือนกัน กดเขียนใหม่ด้านบนได้เลย!</div>`;
            return;
        }

        data.notes.forEach(note => {
            const card = document.createElement('div');
            card.className = 'note-card';

            card.innerHTML = `
                <div class="note-top">
                    <span class="note-title">${note.title}</span>
                    <span class="note-tag">${note.category}</span>
                </div>
                <div class="note-body">${note.content}</div>
                <div class="note-footer">
                    <span>อัปเดตโดย ${note.updatedBy}</span>
                    <div class="note-crud-actions">
                        <button class="note-crud-btn edit-note-btn" title="แก้ไขโน้ต"><i data-lucide="edit-3" style="width: 14px; height: 14px;"></i></button>
                        <button class="note-crud-btn del delete-note-btn" title="ลบโน้ต"><i data-lucide="trash-2" style="width: 14px; height: 14px;"></i></button>
                    </div>
                </div>
            `;

            card.querySelector('.edit-note-btn').addEventListener('click', () => this.openEditNoteModal(note));
            card.querySelector('.delete-note-btn').addEventListener('click', () => this.deleteNote(note.id));

            container.appendChild(card);
        });
    }

    // Bedtime Mood with Time Gating (Locked before 18:00)
    renderCalendarView() {
        const data = window.appStorage.getLocalData();
        const year = this.calendarDate.getFullYear();
        const month = this.calendarDate.getMonth();

        const monthNamesThai = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        document.getElementById('calCurrentMonthTitle').innerText = `${monthNamesThai[month]} ${year}`;

        const grid = document.getElementById('calendarDaysGrid');
        grid.innerHTML = '';

        const firstDayIndex = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const todayStr = new Date().toISOString().split('T')[0];

        for (let i = 0; i < firstDayIndex; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day-cell';
            emptyCell.style.opacity = '0.2';
            grid.appendChild(emptyCell);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const cell = document.createElement('div');
            cell.className = 'calendar-day-cell';
            if (dateStr === todayStr) cell.classList.add('today-cell');
            if (dateStr === this.selectedCalendarDateStr) cell.classList.add('selected-day');

            const dayMoods = data.calendarMoods ? data.calendarMoods[dateStr] : null;
            let dotsHtml = '';
            if (dayMoods) {
                dotsHtml = '<div class="cal-mood-dots">';
                if (dayMoods.nether) dotsHtml += '<span class="mood-dot-item dot-nether" title="Nether บันทึกแล้ว"></span>';
                if (dayMoods.Pooja) dotsHtml += '<span class="mood-dot-item dot-pooja" title="Pooja บันทึกแล้ว"></span>';
                dotsHtml += '</div>';
            }

            cell.innerHTML = `<span>${d}</span>${dotsHtml}`;
            cell.addEventListener('click', () => {
                this.selectedCalendarDateStr = dateStr;
                this.renderCalendarView();
                this.showDateMoodDetail(dateStr, dayMoods);
            });
            grid.appendChild(cell);
        }

        // Time Gating: Check if current time is before 18:00
        const currentHour = new Date().getHours();
        const submitBtn = document.getElementById('submitBedtimeMoodBtn');
        const timeNotice = document.getElementById('bedtimeTimeGateNotice');

        const hasSubmittedToday = !!(data.calendarMoods && data.calendarMoods[todayStr] && data.calendarMoods[todayStr][this.currentUser]);
        if (hasSubmittedToday) {
            submitBtn.disabled = true;
            submitBtn.innerText = 'บันทึกความรู้สึกก่อนนอนวันนี้แล้ว ✨';
            timeNotice.innerText = '✅ คุณได้ส่งความรู้สึกก่อนนอนของวันนี้แล้ว (บันทึกได้วันละ 1 ครั้ง)';
            timeNotice.style.color = '#81C784';
        } else if (currentHour < 18) {
            submitBtn.disabled = true;
            submitBtn.innerText = 'บันทึกความรู้สึกก่อนนอน (+60 แต้ม)';
            timeNotice.innerText = `🔒 เปิดให้บันทึกตั้งแต่เวลา 18:00 น. เป็นต้นไป (ขณะนี้ ${currentHour}:00 น.)`;
            timeNotice.style.color = '#FFA726';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerText = 'บันทึกความรู้สึกก่อนนอน (+60 แต้ม)';
            timeNotice.innerText = '✨ พร้อมส่งความรู้สึกบอกฝันดีให้แฟนแล้ว (+60 แต้ม)';
            timeNotice.style.color = 'rgba(255, 255, 255, 0.9)';
        }
    }

    showDateMoodDetail(dateStr, dayMoods) {
        window.soundManager.playClick();
        if (!dayMoods || (!dayMoods.nether && !dayMoods.Pooja)) {
            this.showToast(`วันที่ ${dateStr} ยังไม่มีบันทึกความรู้สึกก่อนนอน`);
            return;
        }

        let html = '';
        if (dayMoods.nether) {
            html += `
                <div style="background: #FFF3EB; padding: 12px; border-radius: 12px; margin-bottom: 10px; text-align: left;">
                    <strong style="color: var(--accent-coral);">Nether 👨‍💻 : ${dayMoods.nether.label}</strong>
                    <p style="margin-top: 4px; font-size: 13px;">"${dayMoods.nether.note}"</p>
                </div>
            `;
        }
        if (dayMoods.Pooja) {
            html += `
                <div style="background: #FFE4EC; padding: 12px; border-radius: 12px; text-align: left;">
                    <strong style="color: var(--accent-rose);">Pooja 🌸 : ${dayMoods.Pooja.label}</strong>
                    <p style="margin-top: 4px; font-size: 13px;">"${dayMoods.Pooja.note}"</p>
                </div>
            `;
        }

        Swal.fire({
            title: `🌙 บันทึกก่อนนอนวันที่ ${dateStr}`,
            html: html,
            confirmButtonText: 'ปิด',
            customClass: { popup: 'swal2-popup' }
        });
    }

    renderChatView() {
        const data = window.appStorage.getLocalData();
        const container = document.getElementById('chatMessagesContainer');
        container.innerHTML = '';

        const msgCount = data.chatMessages.length;
        document.getElementById('chatCountText').innerText = `${msgCount} ข้อความ`;

        if (msgCount === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); margin: auto;">ยังไม่มีข้อความ หรือล้างอัตโนมัติประจำสัปดาห์แล้ว ส่งข้อความแรกเลย! 🐾</div>`;
            return;
        }

        // Mark incoming messages as read by the opposite partner
        let hasNewRead = false;
        data.chatMessages.forEach(msg => {
            if (msg.sender !== this.currentUser && !msg.readByPartner) {
                msg.readByPartner = true;
                hasNewRead = true;
            }
        });
        if (hasNewRead) {
            window.appStorage.saveLocalData(data);
        }

        data.chatMessages.forEach(msg => {
            const isOutgoing = msg.sender === this.currentUser;
            const timeFormatted = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const senderUser = data.users && data.users[msg.sender] ? data.users[msg.sender].name : msg.sender;

            let readStatusHtml = '';
            if (isOutgoing) {
                if (msg.readByPartner) {
                    readStatusHtml = `<span class="read-receipt-badge" style="font-size: 10px; color: #4CAF50; font-weight: 700; margin-left: 6px;">อ่านแล้ว ✓✓</span>`;
                } else {
                    readStatusHtml = `<span class="read-receipt-badge" style="font-size: 10px; opacity: 0.65; margin-left: 6px;">ส่งแล้ว ✓</span>`;
                }
            }

            let imagesHtml = '';
            if (msg.images && Array.isArray(msg.images) && msg.images.length > 0) {
                const count = msg.images.length;
                const gridClass = count === 1 ? 'grid-1' : (count === 2 ? 'grid-2' : 'grid-multi');
                const imgsHtml = msg.images.map((src) => `
                    <img src="${src}" class="chat-thumb-img" alt="ภาพแนบ" loading="lazy">
                `).join('');
                imagesHtml = `<div class="chat-image-grid ${gridClass}">${imgsHtml}</div>`;
            }

            const textHtml = msg.text ? `<div class="chat-text-content">${msg.text}</div>` : '';

            const wrap = document.createElement('div');
            wrap.className = `chat-bubble-wrap ${isOutgoing ? 'outgoing-bubble' : 'incoming-bubble'}`;
            wrap.innerHTML = `
                <div class="chat-bubble">
                    ${imagesHtml}
                    ${textHtml}
                </div>
                <div class="chat-meta-row">
                    <span>${senderUser} • ${timeFormatted} ${readStatusHtml}</span>
                </div>
            `;

            wrap.querySelectorAll('.chat-thumb-img').forEach(imgEl => {
                imgEl.addEventListener('click', () => {
                    this.openImageLightbox(imgEl.src);
                });
            });

            container.appendChild(wrap);
        });

        container.scrollTop = container.scrollHeight;
    }

    // Daily 1-Question Quiz
    renderQuizView() {
        const data = window.appStorage.getLocalData();
        const container = document.getElementById('quizCardsContainer');
        container.innerHTML = '';

        let netherPoints = 0;
        let poojaPoints = 0;
        data.pastQuizzes.concat(data.quizzes).forEach(q => {
            if (q.completedBy && q.completedBy.includes('nether')) {
                const pts = (q.pointsAwarded && q.pointsAwarded['nether'] !== undefined) ? q.pointsAwarded['nether'] : q.reward;
                netherPoints += pts;
            }
            if (q.completedBy && (q.completedBy.includes('Pooja') || q.completedBy.includes('pooja'))) {
                const poojaKey = (q.pointsAwarded && q.pointsAwarded['Pooja'] !== undefined) ? 'Pooja' : ((q.pointsAwarded && q.pointsAwarded['pooja'] !== undefined) ? 'pooja' : null);
                const pts = poojaKey ? q.pointsAwarded[poojaKey] : q.reward;
                poojaPoints += pts;
            }
        });

        document.getElementById('netherQuizScore').innerText = netherPoints;
        document.getElementById('poojaQuizScore').innerText = poojaPoints;

        // Daily Question Button Control: 1 question per day per user (allows both partners to ask!)
        const todayStr = new Date().toISOString().split('T')[0];
        const myTodayQuiz = data.quizzes && data.quizzes.find(q => q.date === todayStr && q.creator === this.currentUser);
        const newQuizBtn = document.getElementById('openNewQuizBtn');
        if (newQuizBtn) {
            if (myTodayQuiz) {
                const partnerId = this.currentUser === 'nether' ? 'Pooja' : 'nether';
                const isFinished = myTodayQuiz.completedBy && myTodayQuiz.completedBy.includes(partnerId);
                newQuizBtn.disabled = true;
                newQuizBtn.style.opacity = '0.5';
                newQuizBtn.style.cursor = 'not-allowed';
                newQuizBtn.title = isFinished
                    ? 'คุณตั้งคำถามประจำวันนี้และแฟนตอบเสร็จสิ้นแล้ว'
                    : 'คุณตั้งคำถามประจำวันนี้แล้ว (กำลังรอแฟนตอบ)';
                newQuizBtn.classList.add('disabled-btn');
            } else {
                newQuizBtn.disabled = false;
                newQuizBtn.style.opacity = '1';
                newQuizBtn.style.cursor = 'pointer';
                newQuizBtn.title = 'ตั้งคำถามวันนี้ (+30 แต้ม)';
                newQuizBtn.classList.remove('disabled-btn');
            }
        }

        if (data.quizzes.length === 0) {
            container.innerHTML = `
                <div style="background: var(--bg-surface); padding: 25px; border-radius: var(--radius-lg); text-align: center; border: 1px solid var(--border-light);">
                    <div style="font-size: 36px; margin-bottom: 8px;">🎯</div>
                    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">วันนี้ยังไม่มีคำถามท้าดวล กดปุ่มตั้งคำถามประจำวันได้เลย (วันละ 1 ข้อ)</p>
                </div>
            `;
            return;
        }

        data.quizzes.forEach(q => {
            const isCreatedByMe = q.creator === this.currentUser;
            const hasAnswered = q.completedBy && q.completedBy.includes(this.currentUser);
            const userAttempts = (q.userAttempts && q.userAttempts[this.currentUser]) || 0;
            const wrongPicks = (q.wrongPicks && q.wrongPicks[this.currentUser]) || [];

            const partnerId = q.creator === 'nether' ? 'Pooja' : 'nether';
            const partnerName = q.creator === 'nether' ? 'Pooja 🌸' : 'Nether 👨‍💻';
            const partnerAnswer = q.partnerAnswered || (q.answers && q.answers[partnerId]);
            const isPartnerAnswered = !!partnerAnswer;

            const card = document.createElement('div');
            card.className = 'quiz-card';

            const optionsHtml = q.options.map((opt, idx) => {
                const isWrongPicked = wrongPicks.includes(idx);
                const isCorrectRevealed = (hasAnswered || isCreatedByMe) && idx === q.correctIndex;
                const isPartnerPicked = isCreatedByMe && partnerAnswer && partnerAnswer.selectedOptionIndex === idx;

                let btnClass = 'quiz-opt-btn';
                if (isWrongPicked) btnClass += ' wrong-choice';
                if (isCorrectRevealed) btnClass += ' correct-choice';
                const isDisabled = isCreatedByMe || hasAnswered || isWrongPicked;

                let badgeHtml = '';
                if (isCreatedByMe) {
                    if (isCorrectRevealed) {
                        badgeHtml += `<span style="font-size: 10px; background: #C8E6C9; color: #2E7D32; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-left: auto;">🎯 คำตอบเฉลยของคุณ</span>`;
                    }
                    if (isPartnerPicked) {
                        const correctColor = partnerAnswer.isCorrect ? '#2E7D32' : '#C62828';
                        const bgColor = partnerAnswer.isCorrect ? '#E8F5E9' : '#FFEBEE';
                        badgeHtml += `<span style="font-size: 10px; background: ${bgColor}; color: ${correctColor}; padding: 2px 6px; border-radius: 4px; font-weight: 800; margin-left: auto;">👉 แฟนตอบข้อนี้ (${partnerAnswer.isCorrect ? '✅ ถูกต้อง' : '❌ ผิด'})</span>`;
                    }
                }

                return `
                    <button class="${btnClass}" data-quiz-id="${q.id}" data-opt-idx="${idx}" ${isDisabled ? 'disabled' : ''} style="${isPartnerPicked ? 'border: 2px solid #FF5376; background: #FFF0F3;' : ''}">
                        <span>${idx + 1}. ${opt}</span>
                        ${badgeHtml}
                    </button>
                `;
            }).join('');

            let footerStatusHtml = '';
            if (isCreatedByMe) {
                if (isPartnerAnswered) {
                    const isCorrect = partnerAnswer.isCorrect;
                    footerStatusHtml = `
                        <div style="background: ${isCorrect ? '#E8F5E9' : '#FFF3E0'}; border: 1.5px solid ${isCorrect ? '#A5D6A7' : '#FFCC80'}; border-radius: 8px; padding: 10px 12px; margin-top: 10px;">
                            <div style="font-size: 12px; font-weight: 800; color: ${isCorrect ? '#2E7D32' : '#E65100'}; display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                <span>💌 ${partnerName} ตอบคำถามข้อนี้แล้ว!</span>
                                <span style="font-size: 10.5px; opacity: 0.85;">${partnerAnswer.answeredAt ? new Date(partnerAnswer.answeredAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.' : 'เมื่อสักครู่'}</span>
                            </div>
                            <div style="font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">
                                คำตอบที่แฟนเลือก: <span style="color: ${isCorrect ? '#2E7D32' : '#C62828'};">ข้อ ${partnerAnswer.selectedOptionIndex + 1}. "${partnerAnswer.selectedOptionText}"</span>
                            </div>
                            <div style="font-size: 11px; color: var(--text-secondary);">
                                ${isCorrect 
                                    ? `🎉 รู้ใจกันสุดๆ! ตอบถูกในรอบที่ ${partnerAnswer.attemptNumber || 1} (ได้รับแต้ม +${q.pointsAwarded && q.pointsAwarded[partnerId] ? q.pointsAwarded[partnerId] : q.reward} แต้ม)` 
                                    : (partnerAnswer.attemptNumber === 1 
                                        ? `⚠️ ตอบครั้งแรกยังไม่ถูก กำลังรอให้แฟนเลือกใหม่อีก 1 ครั้ง` 
                                        : `😢 ตอบไม่ถูกทั้ง 2 ครั้ง (เฉลยคือข้อ ${q.correctIndex + 1}. "${q.options[q.correctIndex]}")`)}
                            </div>
                        </div>
                    `;
                } else {
                    footerStatusHtml = `
                        <div style="font-size: 11.5px; color: #D84315; font-weight: 700; background: #FBE9E7; border: 1.5px dashed #FFAB91; padding: 8px 12px; border-radius: 8px; margin-top: 10px;">
                            ⏳ คุณเป็นผู้สร้างคำถามนี้ (กำลังรอให้ ${partnerName} มาตอบคำถาม...)
                        </div>
                    `;
                }
            } else if (hasAnswered) {
                const awardGiven = q.pointsAwarded && q.pointsAwarded[this.currentUser] !== undefined ? q.pointsAwarded[this.currentUser] : 0;
                footerStatusHtml = `
                    <div style="font-size: 12px; color: var(--accent-mint); font-weight: 700; background: #E8F5E9; padding: 6px 10px; border-radius: 8px; margin-top: 10px;">
                        ✅ คุณได้ตอบคำถามนี้แล้ว (ได้รับ +${awardGiven} แต้ม)
                    </div>
                `;
            } else if (userAttempts === 1) {
                footerStatusHtml = `
                    <div style="font-size: 11px; color: #E65100; font-weight: 700; background: #FFF3E0; padding: 6px 10px; border-radius: 8px; margin-top: 10px;">
                        ⚠️ ตอบครั้งแรกยังไม่ถูก! เหลือโอกาสเลือกครั้งที่ 2 (หากตอบถูกจะได้คะแนนครึ่งนึง: +${Math.floor(q.reward / 2)} แต้ม)
                    </div>
                `;
            } else {
                footerStatusHtml = `
                    <div style="font-size: 11px; color: #5D4037; opacity: 0.85; margin-top: 10px;">
                        💡 สามารถเลือกตอบได้ 2 ครั้ง: ครั้งแรกถูกได้เต็ม (+${q.reward} แต้ม), ครั้งที่สองถูกได้ครึ่งนึง (+${Math.floor(q.reward / 2)} แต้ม)
                    </div>
                `;
            }

                const creatorUser = data.users && data.users[q.creator] ? data.users[q.creator] : null;
                const creatorText = creatorUser ? `${creatorUser.name} ${creatorUser.avatar}` : (q.creator === 'nether' ? 'Nether 👨‍💻' : 'Pooja 🌸');
                const isMe = q.creator === this.currentUser;

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 11px; font-weight: 700; color: var(--accent-coral);">
                            ${isMe ? '💌 คำถามที่คุณสร้างให้คนรัก' : `💖 คำถามจาก ${creatorText}`} (คำถามวันนี้)
                        </span>
                        <span class="tree-badge-pill" style="font-size: 10px;">รางวัลสูงสุด +${q.reward} แต้ม</span>
                    </div>
                <h4 class="quiz-question-title">${q.question}</h4>
                <div class="quiz-options-list">${optionsHtml}</div>
                ${footerStatusHtml}
            `;

            const optBtns = card.querySelectorAll('.quiz-opt-btn');
            optBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const optIdx = parseInt(e.target.getAttribute('data-opt-idx'), 10);
                    this.answerQuiz(q, optIdx, e.target);
                });
            });

            container.appendChild(card);
        });
    }

    // Post-its exclusively from Lucky Bell harvests
    renderPostitView(filterYear = 'all') {
        const data = window.appStorage.getLocalData();
        const container = document.getElementById('postitGridContainer');
        container.innerHTML = '';

        let list = data.postits || [];
        if (filterYear !== 'all') {
            list = list.filter(p => String(p.year) === String(filterYear));
        }

        if (list.length === 0) {
            container.innerHTML = `<div style="grid-column: span 2; text-align: center; color: var(--text-muted); padding: 30px;">ยังไม่มีบันทึกลูกแก้วนำโชค (เปิดให้เก็บเกี่ยวทุกวันที่ 1 และ 16 ของเดือน)</div>`;
            return;
        }

        list.forEach(p => {
            const card = document.createElement('div');
            card.className = 'postit-card';
            card.style.backgroundColor = p.color || '#FFF3E0';

            const luckyNums = (p.luckyNumbers && Array.isArray(p.luckyNumbers) && p.luckyNumbers.length === 3)
                ? p.luckyNumbers
                : (p.luckyNumber ? p.luckyNumber.split(' - ') : ['782', '045', '913']);

            const orbsPillHtml = luckyNums.map(n => `<span class="lucky-orb-pill">✨ ${n}</span>`).join('');

            card.innerHTML = `
                <div class="postit-pin"></div>
                <div class="lucky-numbers-badge-row">
                    <span class="lucky-numbers-title">🔮 3 เลขนำโชค:</span>
                    <div class="lucky-orbs-inline">
                        ${orbsPillHtml}
                    </div>
                </div>
                <div class="postit-header">${p.title}</div>
                <div class="postit-content">${p.content}</div>
                <div style="margin: 10px 0 6px;">
                    <button type="button" class="postit-blessing-btn" data-postit-id="${p.id}">
                        ✨ ดูพร & สถิติหวย 10 ปี
                    </button>
                </div>
                <div class="postit-footer">
                    <span>${p.date}</span>
                    <span>โดย ${p.author}</span>
                </div>
            `;

            const blessBtn = card.querySelector('.postit-blessing-btn');
            if (blessBtn) {
                blessBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.triggerFullScreenBlessingVFX(p);
                });
            }

            container.appendChild(card);
        });
    }

    renderYearCollection() {
        const data = window.appStorage.getLocalData();
        const container = document.getElementById('yearCollectionContainer');
        container.innerHTML = '';

        const list = (data.cat && data.cat.yearCollection) ? data.cat.yearCollection : [];
        if (list.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">กำลังอยู่ในปีแรกแห่งความผูกพัน (365 วัน)</div>`;
            return;
        }

        list.forEach(y => {
            const card = document.createElement('div');
            card.style.background = 'var(--bg-subtle)';
            card.style.border = '1px solid var(--border-light)';
            card.style.borderRadius = 'var(--radius-md)';
            card.style.padding = '12px 14px';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 14px; margin-bottom: 6px;">
                    <span>🌟 ปี ${y.year}: ${y.catName}</span>
                    <span style="color: var(--accent-coral);">${y.finalGrowthPercent}%</span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    renderPastQuizHistory(filter = 'all') {
        const container = document.getElementById('pastQuizHistoryList');
        if (!container) return;
        container.innerHTML = '';

        const data = window.appStorage.getLocalData();
        let history = [];
        if (Array.isArray(data.pastQuizzes)) history = history.concat(data.pastQuizzes);
        if (Array.isArray(data.quizzes)) {
            data.quizzes.forEach(q => {
                if (!history.find(h => h.id === q.id)) history.unshift(q);
            });
        }

        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7);
        const currentYear = now.getFullYear().toString();

        if (filter === 'month') {
            history = history.filter(q => q.date && q.date.startsWith(currentMonth));
        } else if (filter === 'year') {
            history = history.filter(q => q.date && q.date.startsWith(currentYear));
        }

        if (history.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 24px; font-size: 12px;">ยังไม่มีประวัติคำถามควิซในช่วงเวลานี้</div>`;
            return;
        }

        history.forEach(q => {
            const card = document.createElement('div');
            card.style.cssText = 'background: #fff; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 12px; box-shadow: var(--shadow-sm); margin-bottom: 8px;';
            const creatorId = q.creator || q.createdBy;
            const creatorName = (data.users && data.users[creatorId]) ? data.users[creatorId].name : creatorId;
            const correctOpt = (q.options && q.correctIndex !== undefined) ? q.options[q.correctIndex] : 'ไม่มีเฉลย';

            let statusHtml = '';
            const partnerAns = q.partnerAnswered || {};
            const isAnswered = q.answered || !!q.partnerAnswered || (q.completedBy && q.completedBy.length > 0);
            if (isAnswered) {
                const chosenIdx = partnerAns.selectedOptionIndex !== undefined ? partnerAns.selectedOptionIndex : q.selectedOptionIndex;
                const chosenText = partnerAns.selectedOptionText || (q.options && chosenIdx !== undefined ? q.options[chosenIdx] : '');
                const isCorrect = partnerAns.isCorrect !== undefined ? partnerAns.isCorrect : (chosenIdx === q.correctIndex);
                const answeredUserId = partnerAns.userId || q.answeredBy || (q.completedBy && q.completedBy[0]);
                const answeredByName = partnerAns.userName || ((data.users && answeredUserId && data.users[answeredUserId]) ? data.users[answeredUserId].name : (answeredUserId || 'แฟน'));
                
                const ptsWon = (q.pointsAwarded && answeredUserId && q.pointsAwarded[answeredUserId] !== undefined)
                    ? q.pointsAwarded[answeredUserId]
                    : (isCorrect ? (partnerAns.attemptNumber === 2 ? 25 : (q.reward || 50)) : 0);

                statusHtml = `
                    <div style="margin-top: 6px; font-size: 11px; padding: 6px 10px; border-radius: 6px; background: ${isCorrect ? '#E8F5E9' : '#FFEBEE'}; color: ${isCorrect ? '#2E7D32' : '#C62828'}; font-weight: 700;">
                        <div>${isCorrect ? `✅ ตอบถูกต้อง (+${ptsWon} แต้ม)` : '❌ ตอบผิด (0 แต้ม)'} โดย ${answeredByName}</div>
                        ${chosenText ? `<div style="font-weight: 500; margin-top: 2px; color: var(--text-primary);">คำตอบที่แฟนเลือก: <strong>ข้อ ${(chosenIdx !== undefined ? chosenIdx + 1 : '')}. "${chosenText}"</strong></div>` : ''}
                    </div>
                `;
            } else {
                statusHtml = `
                    <div style="margin-top: 6px; font-size: 11px; padding: 4px 8px; border-radius: 6px; background: #FFF8E1; color: #E65100; font-weight: 700;">
                        ⏳ ยังรอคำตอบจากแฟน
                    </div>
                `;
            }

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 11px; font-weight: 700; color: var(--text-muted);">📅 ${q.date || 'วันนี้'}</span>
                    <span style="font-size: 10.5px; background: #EDE7F6; color: #6A1B9A; padding: 1px 6px; border-radius: 6px; font-weight: 700;">ผู้ตั้ง: ${creatorName}</span>
                </div>
                <div style="font-size: 13px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
                    ❓ ${q.question}
                </div>
                <div style="font-size: 11px; color: var(--text-secondary);">
                    💡 คำตอบที่ถูกต้อง: <strong style="color: var(--accent-mint);">${correctOpt}</strong>
                </div>
                ${statusHtml}
            `;
            container.appendChild(card);
        });
    }

    getActivityCategory(log) {
        if (log.category) return log.category;
        const text = `${log.actionTitle || ''} ${log.detail || ''}`.toLowerCase();
        if (text.includes('แมว') || text.includes('ปลา') || text.includes('ขนมเลีย') || text.includes('วัคซีน') || text.includes('ตัดขน') || text.includes('สายพันธุ์') || text.includes('ผสมพันธุ์') || text.includes('คอลเล็กชัน') || text.includes('เช็คอิน') || text.includes('เล่นกับน้อง') || text.includes('ของเล่น') || text.includes('ลูกแก้ว') || text.includes('ระฆัง') || text.includes('สั่นระฆัง') || text.includes('รับโชค') || text.includes('ดาวนำโชค') || text.includes('โพสต์อิท') || text.includes('post-it')) {
            return 'cat';
        }
        if (text.includes('มื้อ') || text.includes('อาหาร') || text.includes('ของว่าง') || text.includes('ทาน') || text.includes('กินข้าว') || text.includes('snack') || text.includes('ชานม')) {
            return 'meal';
        }
        if (text.includes('โน้ต') || text.includes('บันทึกเตือน') || text.includes('note')) {
            return 'note';
        }
        if (text.includes('คำถาม') || text.includes('ควิซ') || text.includes('ทายใจ') || text.includes('quiz') || text.includes('ท้าดวล') || text.includes('ตอบถูก') || text.includes('ตอบผิด')) {
            return 'quiz';
        }
        return 'system';
    }

    renderActivityLogs() {
        const data = window.appStorage.getLocalData();
        const container = document.getElementById('activityHistoryList');
        if (!container) return;
        container.innerHTML = '';

        const logs = data.activityLogs || [];
        if (logs.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 30px;">ยังไม่มีประวัติการกระทำ</div>`;
            return;
        }

        const selectedCat = this.activeActivityCategory || 'all';
        const searchKw = (this.activitySearchTerm || '').toLowerCase();

        const filteredLogs = logs.filter(log => {
            const cat = this.getActivityCategory(log);
            const matchesCategory = (selectedCat === 'all' || cat === selectedCat);
            if (!matchesCategory) return false;
            if (!searchKw) return true;
            const fullStr = `${log.userName || ''} ${log.actionTitle || ''} ${log.detail || ''}`.toLowerCase();
            return fullStr.includes(searchKw);
        });

        if (filteredLogs.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 30px;">ไม่พบประวัติการกระทำตามเงื่อนไขที่เลือก 🔍</div>`;
            return;
        }

        const categoryMeta = {
            cat: { label: 'น้องแมว', icon: '🐱', badgeClass: 'badge-cat' },
            meal: { label: 'มื้ออาหาร', icon: '🍱', badgeClass: 'badge-meal' },
            note: { label: 'โน้ตคู่', icon: '📝', badgeClass: 'badge-note' },
            quiz: { label: 'คำถาม', icon: '🎯', badgeClass: 'badge-quiz' },
            system: { label: 'ระบบ', icon: '⚙️', badgeClass: 'badge-system' }
        };

        filteredLogs.forEach(log => {
            const dateObj = new Date(log.timestamp);
            const dateStr = dateObj.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

            const cat = this.getActivityCategory(log);
            const meta = categoryMeta[cat] || categoryMeta.system;

            const item = document.createElement('div');
            item.className = 'activity-log-item';
            item.innerHTML = `
                <div class="activity-log-header">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-weight: 800; color: var(--accent-coral);">${log.userName || 'สมาชิก'}</span>
                        <span class="activity-category-badge ${meta.badgeClass}">
                            <span>${meta.icon}</span>
                            <span>${meta.label}</span>
                        </span>
                    </div>
                    <span class="activity-log-time">${dateStr} เวลา ${timeStr} น.</span>
                </div>
                <div style="font-weight: 700; font-size: 12px; color: var(--text-primary); margin-top: 4px;">${log.actionTitle || ''}</div>
                <div class="activity-log-detail">${log.detail || ''}</div>
            `;
            container.appendChild(item);
        });
    }

    renderCatCatalog() {
        const container = document.getElementById('catCatalogList');
        if (!container) return;
        container.innerHTML = '';
        try {
            const data = window.appStorage.getLocalData();
            const breedsList = window.CAT_BREEDS || (typeof CAT_BREEDS !== 'undefined' ? CAT_BREEDS : []);
            const currentBreed = (data.cat && data.cat.isRevealed) ? data.cat.breed : null;

            breedsList.filter(b => b && b.id !== 'mystery_kitten').forEach(b => {
                const item = document.createElement('div');
                const isSelected = b.id === currentBreed;
                item.style.background = isSelected ? 'var(--card-tint-peach)' : 'var(--bg-surface)';
                item.style.border = isSelected ? '2px solid var(--accent-coral)' : '1px solid var(--border-light)';
                item.style.borderRadius = 'var(--radius-md)';
                item.style.padding = '12px 14px';
                item.style.cursor = 'default';

                const mainFood = b.mainFoodReq || '2 มื้อ/วัน 🐟';
                const treat = b.treatReq || '1 ซอง/วัน 💖';
                const growth = b.growthSpeed || 'ปกติ (+2% ต่อวัน) 📈';

                item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="font-size: 18px;">${b.badge || '🐾'}</span>
                            <strong style="font-size: 13.5px; color: var(--text-primary);">${b.name || 'สายพันธุ์แมว'}</strong>
                        </div>
                        ${isSelected ? `<span class="tree-badge-pill" style="font-size: 10px;">สายพันธุ์ของน้อง</span>` : `<span style="font-size: 10px; color: var(--text-muted); background: var(--bg-subtle); padding: 2px 6px; border-radius: 4px;">ข้อมูลสายพันธุ์</span>`}
                    </div>
                    <p style="font-size: 11px; color: var(--text-secondary); margin-bottom: 6px;">${b.tagline || ''}</p>
                    <div style="background: rgba(106, 27, 154, 0.06); border: 1px dashed rgba(171, 71, 188, 0.35); border-radius: 6px; padding: 6px 8px; margin-bottom: 6px; font-size: 10.5px;">
                        <div style="font-weight: 700; color: #6A1B9A; display: flex; align-items: center; gap: 4px;">
                            <span>💤 เวลานอน:</span>
                            <span>${b.sleepSchedule ? b.sleepSchedule.timeRange : '22:00 - 06:00 น.'} (${b.sleepSchedule ? b.sleepSchedule.totalHours : '8 ชม./วัน'})</span>
                        </div>
                        <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">
                            🌙 ${b.sleepSchedule ? b.sleepSchedule.habit : 'นอนพักผ่อนอย่างสงบนิ่ง'}
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10.5px; color: var(--text-muted);">
                        <span>🐟 อาหาร: ${mainFood}</span>
                        <span>💖 แมวเลีย: ${treat}</span>
                        <span>📈 เติบโต: ${growth}</span>
                        <span style="display: inline-flex; align-items: center; gap: 4px;">🎨 Post-it: <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background: ${b.postitColor || '#FFF3E0'}; border: 1px solid rgba(0,0,0,0.15);"></span> ${b.postitColor || ''}</span>
                    </div>
                    <div style="margin-top: 6px; font-size: 11px; font-weight: 700; color: var(--accent-mint);">
                        🎁 ${b.specialBonus || ''}
                    </div>
                `;
                container.appendChild(item);
            });
        } catch (e) {
            console.error('renderCatCatalog error:', e);
            container.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted);">ไม่สามารถโหลดข้อมูลสายพันธุ์ได้</div>`;
        }
    }

    openCatAdoptionModal() {
        const defaultInput = document.getElementById('adoptCatNameInput');
        if (defaultInput && !defaultInput.value) {
            defaultInput.value = 'น้องเหมียวปริศนา';
        }
        this.openModal('modalCatAdoption');
    }

    confirmCatAdoption() {
        if (!this.currentUser) {
            this.showToast('โปรดเข้าสู่ระบบก่อนรับเลี้ยงแมว');
            return;
        }

        const nameInput = document.getElementById('adoptCatNameInput');
        const catName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'น้องเหมียวปริศนา';

        if (!window.appStorage) {
            Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ระบบจัดเก็บข้อมูลไม่พร้อมใช้งาน', icon: 'error' });
            return;
        }

        window.appStorage.adoptCat(catName, this.currentUser);
        this.closeModal('modalCatAdoption');

        const data = window.appStorage.getLocalData();
        const me = data.users[this.currentUser];

        // Real-time cross-browser notification to partner
        window.appStorage.sendNotification({
            type: 'CAT_ACTION',
            title: `🐾 ${me.name} รับเลี้ยงน้องแมวตัวใหม่!`,
            message: `รับเลี้ยง "${catName}" เข้ามาเป็นส่วนหนึ่งในบ้านแล้วนะ! 🐱💖`,
            sender: this.currentUser,
            senderName: me.name
        });

        if (window.soundManager) window.soundManager.playReward();
        if (typeof confetti === 'function') {
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        }

        this.syncGardenState();
        this.renderAll();

        Swal.fire({
            title: `🎁 สุ่มรับเลี้ยง ${catName} สำเร็จ! 🐾`,
            text: `ลูกแมวน้อยเข้ามาอยู่ในบ้านแล้ว! สายพันธุ์จะถูกเก็บเป็นความลับจนกว่าคุณทั้งสองจะช่วยกันดูแลจนครบ 2 เดือน (60 วัน) ถึงจะเฉลยนะจ๊ะ!`,
            icon: 'success',
            confirmButtonText: 'เริ่มดูแลลูกแมวน้อยเลย'
        });
    }

    // -------------------------------------------------------------------------
    // User Action Handlers (Feeding, Treats, Grooming, Vaccine)
    // -------------------------------------------------------------------------

    // 1. Feed Main Meal (Blocked if fullness is 100%)
    feedCatMainMeal() {
        const data = window.appStorage.getLocalData();
        if (!data.cat) {
            this.showToast('โปรดรับเลี้ยงน้องแมวก่อนเริ่มดูแลนะ 🐾');
            this.openCatAdoptionModal();
            return;
        }

        // Anti-spam cap: Cannot feed if fullness is 100%
        if (data.cat.fullnessLevel >= 100) {
            Swal.fire({
                title: 'น้องแมวอิ่มท้อง 100% แล้ว! 🐟',
                text: 'น้องแมวกินอิ่มแปล้พุงกางแล้ว ไม่สามารถป้อนอาหารเพิ่มได้ รอให้น้องย่อยก่อนนะจ๊ะ (กันการอัดของทำคะแนน)',
                icon: 'info'
            });
            return;
        }

        const me = data.users[this.currentUser];

        if (data.inventory.main_food <= 0) {
            Swal.fire({
                title: 'อาหารเปียกหมดแล้ว! 🐟',
                text: 'ต้องการใช้ 50 แต้มความรักแลกอาหารเปียกปลาแซลมอนทันทีหรือไม่?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'แลก 50 แต้ม',
                cancelButtonText: 'ไว้ทีหลัง'
            }).then((res) => {
                if (res.isConfirmed) {
                    if (me.points >= 50) {
                        me.points -= 50;
                        data.inventory.main_food += 1;
                        window.appStorage.saveLocalData(data);
                        this.feedCatMainMeal();
                    } else {
                        window.soundManager.playError();
                        this.showToast('แต้มไม่พอ (ต้องการ 50 แต้ม)');
                    }
                }
            });
            return;
        }

        // Decrement in real-time
        data.inventory.main_food -= 1;
        data.cat.fullnessLevel = Math.min(100, data.cat.fullnessLevel + 25);
        data.cat.growthPercent = Math.min(100, data.cat.growthPercent + 2);
        data.cat.totalFed = (data.cat.totalFed || 0) + 1;
        me.points += 15;

        // Cumulative Daily Care & 1-Month Bonding Tracking
        const todayStr = new Date().toISOString().split('T')[0];
        if (!data.dailyCare) data.dailyCare = {};
        if (!data.dailyCare[todayStr]) data.dailyCare[todayStr] = {};
        if (!data.dailyCare[todayStr][this.currentUser]) data.dailyCare[todayStr][this.currentUser] = { food: 0, treats: 0, health: 0, playTime: 0 };
        data.dailyCare[todayStr][this.currentUser].food = (data.dailyCare[todayStr][this.currentUser].food || 0) + 1;

        if (data.cat.bondingScores && data.cat.bondingScores[this.currentUser]) {
            data.cat.bondingScores[this.currentUser].food = (data.cat.bondingScores[this.currentUser].food || 0) + 1;
        }

        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(this.currentUser, me.name, 'ให้อาหารหลักน้องแมว 🐟', 'ให้อาหารเปียกปลาแซลมอน เพิ่มความอิ่ม +25%');

        // Mark quest completed
        this.markQuestCompleted('q_care');

        // Real-time cross-browser notification to partner
        window.appStorage.sendNotification({
            type: 'CAT_ACTION',
            title: `🐟 ${me.name} ป้อนข้าวปลาแซลมอนน้องแมวแล้ว`,
            message: `ความอิ่มเพิ่มเป็น ${data.cat.fullnessLevel}% (พุงกางแล้วนะ!)`,
            sender: this.currentUser,
            senderName: me.name
        });

        if (this.garden3D) this.garden3D.triggerFeedAnimation();

        this.syncGardenState();
        this.updateHeaderPoints();
        this.renderQuestsView();
        if (typeof this.updateNavBadges === 'function') this.updateNavBadges();

        this.showToast(`ให้อาหารหลักเรียบร้อย! 🐟 ความอิ่ม +25% (+15 แต้ม)`);
    }

    // 2. Give Creamy Treat (Blocked if affection is 100%)
    giveCatTreat() {
        const data = window.appStorage.getLocalData();
        if (!data.cat) {
            this.showToast('โปรดรับเลี้ยงน้องแมวก่อนเริ่มดูแลนะ 🐾');
            this.openCatAdoptionModal();
            return;
        }

        // Anti-spam cap: Cannot give creamy treat if affection is 100%
        if (data.cat.affectionLevel >= 100) {
            Swal.fire({
                title: 'ความสุขผูกพันเต็ม 100% แล้ว! 💖',
                text: 'น้องแมวได้รับความรักและความสุขเต็มเปี่ยมแล้ว ไม่สามารถให้ขนมแมวเลียเพิ่มได้จ้า (กันการอัดของทำคะแนน)',
                icon: 'info'
            });
            return;
        }

        const me = data.users[this.currentUser];

        if (data.inventory.creamy_treat <= 0) {
            Swal.fire({
                title: 'ขนมแมวเลียหมดแล้ว! 💖',
                text: 'ต้องการใช้ 80 แต้มความรักแลกขนมแมวเลียสูตรหัวใจหวานหรือไม่?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'แลก 80 แต้ม',
                cancelButtonText: 'ไว้ทีหลัง'
            }).then((res) => {
                if (res.isConfirmed) {
                    if (me.points >= 80) {
                        me.points -= 80;
                        data.inventory.creamy_treat += 1;
                        window.appStorage.saveLocalData(data);
                        this.giveCatTreat();
                    } else {
                        window.soundManager.playError();
                        this.showToast('แต้มไม่พอ (ต้องการ 80 แต้ม)');
                    }
                }
            });
            return;
        }

        data.inventory.creamy_treat -= 1;
        data.cat.affectionLevel = Math.min(100, data.cat.affectionLevel + 30);
        data.cat.growthPercent = Math.min(100, data.cat.growthPercent + 3);
        data.cat.totalTreated = (data.cat.totalTreated || 0) + 1;
        me.points += 20;

        // Cumulative Daily Care & 1-Month Bonding Tracking
        const todayStr = new Date().toISOString().split('T')[0];
        if (!data.dailyCare) data.dailyCare = {};
        if (!data.dailyCare[todayStr]) data.dailyCare[todayStr] = {};
        if (!data.dailyCare[todayStr][this.currentUser]) data.dailyCare[todayStr][this.currentUser] = { food: 0, treats: 0, health: 0, playTime: 0 };
        data.dailyCare[todayStr][this.currentUser].treats = (data.dailyCare[todayStr][this.currentUser].treats || 0) + 1;

        if (data.cat.bondingScores && data.cat.bondingScores[this.currentUser]) {
            data.cat.bondingScores[this.currentUser].treats = (data.cat.bondingScores[this.currentUser].treats || 0) + 1;
        }

        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(this.currentUser, me.name, 'ให้ขนมแมวเลีย 💖', 'ป้อนแมวเลียรสทูน่า เพิ่มความผูกพัน +30%');

        // Mark quest completed
        this.markQuestCompleted('q_care');

        // Real-time cross-browser notification to partner
        window.appStorage.sendNotification({
            type: 'CAT_ACTION',
            title: `💖 ${me.name} ป้อนขนมแมวเลียสูตรหัวใจหวาน`,
            message: `ความสุขผูกพันเพิ่มเป็น ${data.cat.affectionLevel}% อ้อนสุดๆ!`,
            sender: this.currentUser,
            senderName: me.name
        });

        if (this.garden3D) this.garden3D.triggerTreatAnimation();

        this.syncGardenState();
        this.updateHeaderPoints();
        this.renderQuestsView();
        if (typeof this.updateNavBadges === 'function') this.updateNavBadges();

        this.showToast(`ป้อนแมวเลียสำเร็จ! 💖 ความสุขผูกพัน +30% (+20 แต้ม)`);
    }

    // 3. Cure Vaccine or Grooming (Blocked if health is 100% and no fever or long nails)
    cureObstacles(isVaccine) {
        const data = window.appStorage.getLocalData();
        if (!data.cat) {
            this.showToast('โปรดรับเลี้ยงน้องแมวก่อนเริ่มดูแลนะ 🐾');
            this.openCatAdoptionModal();
            return;
        }

        // Anti-spam cap: Cannot cure/groom if health is 100% and no symptoms
        if (data.cat.health >= 100 && !data.cat.hasFever && !data.cat.hasLongNails) {
            Swal.fire({
                title: 'สุขภาพกายน้องแมวเต็ม 100% แล้ว! ✨',
                text: 'น้องแมวมีสุขภาพแข็งแรง ขนสวยเล็บเรียบร้อยดีแล้ว ไม่จำเป็นต้องฉีดวัคซีนหรือตัดขนตัดเล็บเพิ่มจ้า (กันการอัดของทำคะแนน)',
                icon: 'info'
            });
            return;
        }

        const me = data.users[this.currentUser];
        const itemKey = isVaccine ? 'vaccine' : 'grooming_kit';
        const cost = 100;
        const itemName = isVaccine ? 'วัคซีนรวมสุขภาพ' : 'ชุดกรรไกรตัดขนตัดเล็บ';

        if (data.inventory[itemKey] <= 0) {
            Swal.fire({
                title: `ต้องการ${itemName}!`,
                text: `ต้องใช้ ${cost} แต้มเพื่อแลกของใช้ดูแลน้องแมว คุณต้องการแลกทันทีหรือไม่?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: `แลก ${cost} แต้ม`,
                cancelButtonText: 'ยกเลิก'
            }).then((res) => {
                if (res.isConfirmed) {
                    if (me.points >= cost) {
                        me.points -= cost;
                        data.inventory[itemKey] += 1;
                        window.appStorage.saveLocalData(data);
                        this.cureObstacles(isVaccine);
                    } else {
                        window.soundManager.playError();
                        this.showToast(`แต้มไม่พอ ต้องการ ${cost} แต้ม`);
                    }
                }
            });
            return;
        }

        data.inventory[itemKey] -= 1;
        if (isVaccine) {
            data.cat.hasFever = false;
        } else {
            data.cat.hasLongNails = false;
        }
        data.cat.health = 100;
        me.points += 30;

        // Cumulative Daily Care & 1-Month Bonding Tracking
        const todayStr = new Date().toISOString().split('T')[0];
        if (!data.dailyCare) data.dailyCare = {};
        if (!data.dailyCare[todayStr]) data.dailyCare[todayStr] = {};
        if (!data.dailyCare[todayStr][this.currentUser]) data.dailyCare[todayStr][this.currentUser] = { food: 0, treats: 0, health: 0, playTime: 0 };
        data.dailyCare[todayStr][this.currentUser].health = (data.dailyCare[todayStr][this.currentUser].health || 0) + 1;

        if (data.cat.bondingScores && data.cat.bondingScores[this.currentUser]) {
            data.cat.bondingScores[this.currentUser].health = (data.cat.bondingScores[this.currentUser].health || 0) + 1;
        }

        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(this.currentUser, me.name, isVaccine ? 'พาไปฉีดวัคซีน 💉' : 'ตัดขนและตัดเล็บ ✂️', isVaccine ? 'รักษาไข้หวัด สุขภาพกลับมาเต็ม 100%' : 'ตัดเล็บแหลมและแปรงขนเรียบร้อย');

        // Mark quest completed
        this.markQuestCompleted('q_care');

        // Real-time cross-browser notification to partner
        window.appStorage.sendNotification({
            type: 'CAT_ACTION',
            title: isVaccine ? `💉 ${me.name} พาน้องแมวไปฉีดวัคซีนแล้ว` : `✂️ ${me.name} ตัดขนและเล็บให้น้องแมวแล้ว`,
            message: isVaccine ? 'รักษาไข้หวัด สุขภาพกลับมาเต็ม 100%!' : 'ตัดเล็บและแปรงขนเรียบร้อย น้องแมวสบายตัวเดินคล่องแคล่ว!',
            sender: this.currentUser,
            senderName: me.name
        });

        if (this.garden3D) {
            if (isVaccine) {
                this.garden3D.triggerVaccineAnimation();
            } else {
                this.garden3D.triggerGroomingAnimation();
            }
            this.garden3D.setSicknessState(data.cat.hasFever, data.cat.hasLongNails);
        }

        this.syncGardenState();
        this.updateHeaderPoints();
        this.renderQuestsView();
        if (typeof this.updateNavBadges === 'function') this.updateNavBadges();

        Swal.fire({
            title: 'ดูแลสำเร็จ! 🐾✨',
            text: isVaccine ? 'ฉีดวัคซีนป้องกันโรคเรียบร้อย น้องแมวกลับมาร่าเริง 100%!' : 'ตัดขนและเล็บเรียบร้อย น้องแมวสบายตัวเดินคล่องแคล่ว!',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    }

    // 4. Daily Checkin
    performDailyCheckin() {
        const data = window.appStorage.getLocalData();
        const todayStr = new Date().toISOString().split('T')[0];
        const me = data.users[this.currentUser];

        if (me.lastCheckin === todayStr || (data.completedQuests && data.completedQuests[todayStr] && data.completedQuests[todayStr][this.currentUser] && data.completedQuests[todayStr][this.currentUser]['q_checkin'])) {
            this.showToast('คุณเช็คอินไปแล้วสำหรับวันนี้ ✨');
            return;
        }

        me.lastCheckin = todayStr;
        me.streak += 1;
        me.points += 40;
        data.inventory.main_food += 1; // Free daily can

        if (!data.completedQuests) data.completedQuests = {};
        if (!data.completedQuests[todayStr]) data.completedQuests[todayStr] = {};
        if (!data.completedQuests[todayStr][this.currentUser]) data.completedQuests[todayStr][this.currentUser] = {};
        data.completedQuests[todayStr][this.currentUser]['q_checkin'] = true;

        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(this.currentUser, me.name, 'เช็คอินประจำวัน 📅', `เช็คอินความรักติดต่อกันวันที่ ${me.streak} (+40 แต้ม, อาหารฟรี 1 กระป๋อง)`);

        // Real-time cross-browser notification to partner
        window.appStorage.sendNotification({
            type: 'CHECKIN',
            title: `📅 ${me.name} เช็คอินประจำวันแล้ว`,
            message: `รักษา Daily Streak ได้ ${me.streak} วันติดกันแล้วนะ! 🔥`,
            sender: this.currentUser,
            senderName: me.name
        });

        this.markQuestCompleted('q_checkin');

        window.soundManager.playReward();
        if (typeof confetti === 'function') confetti({ particleCount: 70, spread: 60 });

        Swal.fire({
            title: 'เช็คอินสำเร็จ! 🎉',
            text: `รักษา Daily Streak ได้ ${me.streak} วันติดกัน! รับฟรี +40 แต้ม และอาหารเปียก 1 กระป๋อง`,
            icon: 'success',
            confirmButtonText: 'เย้!'
        });
    }

    // 5. Point Shop Buy
    buyShopItem(item) {
        const data = window.appStorage.getLocalData();
        const me = data.users[this.currentUser];

        if (me.points < item.cost) {
            window.soundManager.playError();
            this.showToast(`แต้มไม่เพียงพอ (ต้องการ ${item.cost} แต้ม)`);
            return;
        }

        // 1. Deduct points immediately
        me.points -= item.cost;

        // 2. Add item to general inventory (food, treats, vaccine, grooming_kit, toys)
        if (!data.inventory) data.inventory = {};
        data.inventory[item.id] = (data.inventory[item.id] || 0) + 1;

        // 3. If item is a cat toy, also add to toyInventory
        if (!data.toyInventory) data.toyInventory = {};
        if (item.id.startsWith('cat_toy_')) {
            data.toyInventory[item.id] = (data.toyInventory[item.id] || 0) + 1;
        }

        // 4. Save data & log
        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(this.currentUser, me.name, `แลกซื้อ ${item.name}`, `ใช้ ${item.cost} แต้มความรัก (ตัดแต้มและเพิ่มของเข้าคลังทันที)`);

        // 5. Sound & immediate UI refresh
        window.soundManager.playSuccess();
        this.updateHeaderPoints();
        this.syncGardenState();
        this.renderQuestsView();
        if (typeof this.updateNavBadges === 'function') this.updateNavBadges();

        Swal.fire({
            title: 'แลกของสำเร็จ! 🛍️✨',
            text: `แลกซื้อ "${item.name}" สำเร็จ! ตัด ${item.cost} แต้ม และเพิ่มของเข้าคลังทันที (คงเหลือ ${me.points} แต้ม ⭐)`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    }

    // 6. Edit Meal
    openEditMealModal(mealKey, currentData) {
        document.getElementById('mealEditType').value = mealKey;
        const thaiNames = { breakfast: 'มื้อเช้า ☀️', lunch: 'มื้อเที่ยง 🍲', dinner: 'มื้อเย็น 🌙' };
        document.getElementById('mealModalTitle').innerText = `อัปเดต ${thaiNames[mealKey] || 'มื้ออาหาร'}`;
        document.getElementById('mealInputName').value = currentData.name || '';
        document.getElementById('mealInputTime').value = currentData.time || new Date().toTimeString().slice(0, 5);
        this.openModal('modalEditMeal');
    }

    saveMealData(mealKey, foodName, timeStr) {
        const data = window.appStorage.getLocalData();
        const todayStr = new Date().toISOString().split('T')[0];

        if (!data.meals[todayStr]) data.meals[todayStr] = {};
        if (!data.meals[todayStr][this.currentUser]) {
            data.meals[todayStr][this.currentUser] = { breakfast: { eaten: false }, lunch: { eaten: false }, dinner: { eaten: false }, snacks: [] };
        }

        data.meals[todayStr][this.currentUser][mealKey] = { eaten: true, time: timeStr, name: foodName };
        data.users[this.currentUser].points += 15;
        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(this.currentUser, data.users[this.currentUser].name, `อัปเดตมื้ออาหาร (${mealKey})`, `ทาน: ${foodName} เวลา ${timeStr} น.`);

        const me = data.users[this.currentUser];
        const mealLabels = { breakfast: 'มื้อเช้า ☀️', lunch: 'มื้อเที่ยง 🍲', dinner: 'มื้อเย็น 🌙' };

        // Real-time cross-browser notification to partner
        window.appStorage.sendNotification({
            type: 'MEAL',
            title: `🍱 ${me.name} บันทึก${mealLabels[mealKey] || 'มื้ออาหาร'}`,
            message: `เมนู: ${foodName} (เวลา ${timeStr} น.)`,
            sender: this.currentUser,
            senderName: me.name
        });

        this.markQuestCompleted('q_meals');

        window.soundManager.playSuccess();
        this.closeModal('modalEditMeal');
        this.renderMealsView();
        this.renderQuestsView();
        this.updateHeaderPoints();
        if (typeof this.updateNavBadges === 'function') this.updateNavBadges();
        this.showToast(`อัปเดตมื้ออาหารเรียบร้อยแล้ว (+15 แต้ม)`);
    }

    deleteSnack(snackId) {
        const data = window.appStorage.getLocalData();
        const todayStr = new Date().toISOString().split('T')[0];
        if (data.meals[todayStr] && data.meals[todayStr][this.currentUser]) {
            const currentSnacks = data.meals[todayStr][this.currentUser].snacks || [];
            const snackToDelete = currentSnacks.find(s => s.id === snackId);
            const snackName = snackToDelete ? (snackToDelete.name || 'ของว่าง') : 'ของว่าง';

            data.meals[todayStr][this.currentUser].snacks = currentSnacks.filter(s => s.id !== snackId);

            // Deduct 10 points to prevent point farming / laundering!
            const me = data.users[this.currentUser];
            if (me) {
                me.points = Math.max(0, (me.points || 0) - 10);
            }

            // Log activity for deduction with category meal
            if (!data.activityLogs) data.activityLogs = [];
            data.activityLogs.unshift({
                id: 'log_' + Date.now(),
                userId: this.currentUser,
                userName: me ? me.name : this.currentUser,
                actionTitle: 'ลบมื้อย่อย / ของว่าง 🗑️',
                detail: `ลบ ${snackName} (หักแต้มสะสมคืน -10 แต้ม ป้องกันการปั๊มแต้ม)`,
                category: 'meal',
                timestamp: new Date().toISOString()
            });

            window.appStorage.saveLocalData(data);

            // Real-time cross-browser notification to partner
            window.appStorage.sendNotification({
                type: 'MEAL',
                title: `🗑️ ${me ? me.name : this.currentUser} ลบรายการของว่าง`,
                message: `ลบรายการ ${snackName} (-10 แต้ม)`,
                sender: this.currentUser,
                senderName: me ? me.name : this.currentUser
            });

            this.updateHeaderPoints();
            this.renderMealsView();
            this.renderQuestsView();
            if (typeof this.updateNavBadges === 'function') this.updateNavBadges();
            this.showToast('ลบรายการของว่างแล้ว (หักแต้มคืน -10 แต้ม)');
        }
    }

    // 7. Notes Edit and Delete
    openEditNoteModal(note = null) {
        if (note) {
            document.getElementById('noteModalHeaderTitle').innerText = '✏️ แก้ไขบันทึก';
            document.getElementById('editNoteId').value = note.id;
            document.getElementById('noteTitleInput').value = note.title;
            document.getElementById('noteContentInput').value = note.content;
            document.getElementById('noteCategorySelect').value = note.category;
            document.getElementById('noteRemindTime').value = note.remindAt || '';
            document.getElementById('saveNoteBtn').innerText = 'บันทึกการแก้ไข';
        } else {
            document.getElementById('noteModalHeaderTitle').innerText = '📝 เขียนบันทึกเตือนกัน';
            document.getElementById('editNoteId').value = '';
            document.getElementById('noteTitleInput').value = '';
            document.getElementById('noteContentInput').value = '';
            document.getElementById('noteRemindTime').value = '';
            document.getElementById('saveNoteBtn').innerText = 'บันทึกโน้ต';
        }
        this.openModal('modalNewNote');
    }

    saveNote(noteId, title, content, category, remindAt) {
        const data = window.appStorage.getLocalData();
        const todayStr = new Date().toISOString().split('T')[0];
        const me = data.users[this.currentUser];

        if (noteId) {
            const note = data.notes.find(n => n.id === noteId);
            if (note) {
                note.title = title;
                note.content = content;
                note.category = category;
                note.remindAt = remindAt;
                note.updatedBy = this.currentUser;
                note.updatedAt = new Date().toISOString();
                if (me) me.points += 15;

                if (!data.activityLogs) data.activityLogs = [];
                data.activityLogs.unshift({
                    id: 'log_' + Date.now(),
                    userId: this.currentUser,
                    userName: me ? me.name : this.currentUser,
                    actionTitle: 'แก้ไขโน้ตคู่รัก 📝',
                    detail: `แก้ไข: ${title} (+15 แต้ม)`,
                    category: 'note',
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            const newNote = {
                id: 'note_' + Date.now(),
                title: title,
                content: content,
                category: category,
                remindAt: remindAt,
                author: this.currentUser,
                createdAt: new Date().toISOString(),
                updatedBy: this.currentUser,
                updatedAt: new Date().toISOString()
            };
            data.notes.unshift(newNote);
            if (me) me.points += 20;

            if (!data.activityLogs) data.activityLogs = [];
            data.activityLogs.unshift({
                id: 'log_' + Date.now(),
                userId: this.currentUser,
                userName: me ? me.name : this.currentUser,
                actionTitle: 'เขียนโน้ตคู่ใหม่ 📝',
                detail: `สร้าง: ${title} (+20 แต้ม)`,
                category: 'note',
                timestamp: new Date().toISOString()
            });
        }

        // Daily Quest Note Completion: Triggered for both creating & editing
        if (!data.dailyCare) data.dailyCare = {};
        if (!data.dailyCare[todayStr]) data.dailyCare[todayStr] = {};
        if (!data.dailyCare[todayStr][this.currentUser]) {
            data.dailyCare[todayStr][this.currentUser] = { food: 0, treats: 0, health: 0, playTime: 0 };
        }
        data.dailyCare[todayStr][this.currentUser].noteAction = true;

        if (!data.completedQuests) data.completedQuests = {};
        if (!data.completedQuests[todayStr]) data.completedQuests[todayStr] = {};
        if (!data.completedQuests[todayStr][this.currentUser]) data.completedQuests[todayStr][this.currentUser] = {};
        data.completedQuests[todayStr][this.currentUser]['q_notes'] = true;

        window.appStorage.saveLocalData(data);

        // Real-time notification to partner
        window.appStorage.sendNotification({
            type: 'NOTE',
            title: `📝 ${me ? me.name : this.currentUser} ${noteId ? 'แก้ไข' : 'เขียน'}โน๊ตคู่ใหม่`,
            message: `หัวข้อ: "${title}"`,
            sender: this.currentUser,
            senderName: me ? me.name : this.currentUser
        });

        if (window.soundManager) window.soundManager.playSuccess();
        this.closeModal('modalNewNote');
        this.updateHeaderPoints();
        this.renderNotesView();
        this.renderQuestsView();
        if (typeof this.updateNavBadges === 'function') this.updateNavBadges();
        this.showToast('บันทึกข้อมูลโน้ตสำเร็จ (ทำภารกิจโน้ตเรียบร้อย ✨)');
    }

    deleteNote(noteId) {
        Swal.fire({
            title: 'ลบโน้ตนี้? 🗑️',
            text: 'ต้องการลบโน้ตเตือนความจำนี้หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ลบทันที',
            cancelButtonText: 'ยกเลิก'
        }).then((res) => {
            if (res.isConfirmed) {
                const data = window.appStorage.getLocalData();
                const noteToDelete = data.notes.find(n => n.id === noteId);
                const titleToDelete = noteToDelete ? noteToDelete.title : 'โน้ตคู่';
                data.notes = data.notes.filter(n => n.id !== noteId);
                const me = data.users[this.currentUser];

                if (!data.activityLogs) data.activityLogs = [];
                data.activityLogs.unshift({
                    id: 'log_' + Date.now(),
                    userId: this.currentUser,
                    userName: me ? me.name : this.currentUser,
                    actionTitle: 'ลบโน้ตคู่รัก 🗑️',
                    detail: `ลบโน้ต: "${titleToDelete}"`,
                    category: 'note',
                    timestamp: new Date().toISOString()
                });

                window.appStorage.saveLocalData(data);

                // Real-time notification to partner
                window.appStorage.sendNotification({
                    type: 'NOTE',
                    title: `🗑️ ${me ? me.name : this.currentUser} ลบโน๊ตคู่`,
                    message: `ลบโน๊ต "${titleToDelete}" เรียบร้อยแล้ว`,
                    sender: this.currentUser,
                    senderName: me ? me.name : this.currentUser
                });

                this.renderNotesView();
                this.showToast('ลบโน้ตเรียบร้อยแล้ว');
            }
        });
    }

    // 8. Bedtime Mood Record (Time Gated >= 18:00)
    submitBedtimeMood(noteText) {
        const currentHour = new Date().getHours();
        if (currentHour < 18) {
            Swal.fire({
                title: 'ยังไม่ถึงเวลาเข้านอน ☀️',
                text: 'ฟังก์ชันบันทึกความรู้สึกก่อนนอนจะเปิดให้บันทึกตั้งแต่เวลา 18:00 น. เป็นต้นไปนะจ๊ะ',
                icon: 'info'
            });
            return;
        }

        if (!noteText.trim()) {
            this.showToast('โปรดใส่ข้อความสั้นๆ ถึงแฟนก่อนนอน');
            return;
        }

        const data = window.appStorage.getLocalData();
        const todayStr = new Date().toISOString().split('T')[0];

        // Strict limit: strictly once per day per user
        if (data.calendarMoods && data.calendarMoods[todayStr] && data.calendarMoods[todayStr][this.currentUser]) {
            Swal.fire({
                title: 'บันทึกไปแล้วในวันนี้ 🌙',
                text: 'คุณได้ส่งความรู้สึกบอกฝันดีของวันนี้เรียบร้อยแล้ว บันทึกได้เพียง 1 ครั้งต่อวันเท่านั้นจ้า',
                icon: 'info'
            });
            return;
        }

        if (!data.calendarMoods[todayStr]) data.calendarMoods[todayStr] = {};

        const moodLabels = {
            happy: 'มีความสุข 🥰',
            miss_you: 'คิดถึงมาก 🥺',
            tired: 'เหนื่อยล้า 😴',
            hug: 'อยากกอด 🫂',
            heart_full: 'ใจฟูซึ้งใจ 💖',
            yummy: 'อิ่มฟินอร่อย 😋',
            hustle: 'สู้ตายลุยงาน 😤',
            needy: 'อ้อนแฟนสุดๆ 🧸'
        };

        data.calendarMoods[todayStr][this.currentUser] = {
            mood: this.selectedBedtimeMood,
            label: moodLabels[this.selectedBedtimeMood] || 'อบอุ่นใจ',
            rating: 5,
            note: noteText.trim()
        };

        data.users[this.currentUser].points += 60;
        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(this.currentUser, data.users[this.currentUser].name, 'บันทึกความรู้สึกก่อนนอน 🌙', `อารมณ์: ${moodLabels[this.selectedBedtimeMood]}`);

        const me = data.users[this.currentUser];

        // Real-time cross-browser notification to partner
        window.appStorage.sendNotification({
            type: 'BEDTIME',
            title: `🌙 ${me.name} บันทึกความรู้สึกก่อนนอน`,
            message: `อารมณ์: ${moodLabels[this.selectedBedtimeMood] || 'อบอุ่นใจ'} - "${noteText.trim()}"`,
            sender: this.currentUser,
            senderName: me.name
        });

        this.markQuestCompleted('q_bedtime');

        window.soundManager.playReward();
        if (typeof confetti === 'function') confetti({ particleCount: 60, spread: 50 });

        document.getElementById('bedtimeNoteInput').value = '';

        this.renderCalendarView();
        this.renderQuestsView();
        this.updateHeaderPoints();
        if (typeof this.updateNavBadges === 'function') this.updateNavBadges();

        Swal.fire({
            title: 'ส่งความรู้สึกบอกฝันดีสำเร็จ 🌙',
            text: 'บันทึกลงปฏิทินเรียบร้อยแล้ว หลับฝันดีนะที่รัก (+60 แต้ม)',
            icon: 'success'
        });
    }

    // 9. Chat Message & Multi-image Attachment
    async compressImageFile(file, maxWidth = 800, maxHeight = 800, quality = 0.75) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressedDataUrl);
                };
                img.onerror = () => resolve(null);
                img.src = e.target.result;
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    }

    renderChatImagePreviewTray() {
        const tray = document.getElementById('chatImagePreviewTray');
        const thumbs = document.getElementById('chatPreviewThumbnails');
        if (!tray || !thumbs) return;

        if (!this.pendingChatImages || this.pendingChatImages.length === 0) {
            tray.style.display = 'none';
            thumbs.innerHTML = '';
            return;
        }

        tray.style.display = 'flex';
        thumbs.innerHTML = '';
        this.pendingChatImages.forEach((imgSrc, idx) => {
            const chip = document.createElement('div');
            chip.className = 'preview-thumb-chip';
            chip.innerHTML = `
                <img src="${imgSrc}" alt="รูปภาพแนบ">
                <button type="button" class="preview-thumb-remove" title="ลบรูปนี้">×</button>
            `;
            chip.querySelector('.preview-thumb-remove').addEventListener('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                this.pendingChatImages.splice(idx, 1);
                this.renderChatImagePreviewTray();
            });
            thumbs.appendChild(chip);
        });
    }

    openImageLightbox(src) {
        Swal.fire({
            imageUrl: src,
            imageAlt: 'รูปภาพในแชท',
            showConfirmButton: false,
            showCloseButton: true,
            background: 'rgba(0, 0, 0, 0.88)',
            customClass: { popup: 'swal2-image-lightbox', image: 'chat-lightbox-img' }
        });
    }

    sendChatMessage(text) {
        const trimmed = (text || '').trim();
        const hasImages = this.pendingChatImages && this.pendingChatImages.length > 0;
        if (!trimmed && !hasImages) return;

        const data = window.appStorage.getLocalData();
        const newMsg = {
            id: 'msg_' + Date.now(),
            sender: this.currentUser,
            text: trimmed,
            timestamp: new Date().toISOString()
        };

        if (hasImages) {
            newMsg.images = [...this.pendingChatImages];
        }

        data.chatMessages.push(newMsg);
        data.users[this.currentUser].points += 2;
        window.appStorage.saveLocalData(data);
        if (window.soundManager) window.soundManager.playMessage(false);

        const me = data.users[this.currentUser];
        const previewText = trimmed || (hasImages ? '📷 ส่งรูปภาพ' : 'ส่งข้อความ');

        // Real-time cross-browser notification to partner
        window.appStorage.sendNotification({
            type: 'CHAT',
            title: `💬 ข้อความใหม่จาก ${me.name}`,
            message: previewText,
            sender: this.currentUser,
            senderName: me.name
        });

        this.markQuestCompleted('q_chat');

        const inputEl = document.getElementById('chatMessageInput');
        if (inputEl) inputEl.value = '';

        this.pendingChatImages = [];
        this.renderChatImagePreviewTray();
        this.renderChatView();
        this.renderQuestsView();
        this.updateHeaderPoints();
        if (typeof this.updateNavBadges === 'function') this.updateNavBadges();
    }

    // 10. Quiz (Daily 1-Question Limit)
    // 10. Quiz (Daily 1-Question Limit - Max 2 Attempts)
    answerQuiz(quiz, optIdx, buttonElement) {
        if (quiz.creator === this.currentUser) {
            Swal.fire({
                title: 'ไม่สามารถตอบคำถามของตนเองได้ 🔒',
                text: 'คุณเป็นผู้สร้างคำถามข้อนี้ ต้องรอให้อีกฝ่ายเป็นคนตอบเท่านั้นนะค้าบ',
                icon: 'warning'
            });
            return;
        }

        const data = window.appStorage.getLocalData();
        const target = data.quizzes.find(q => q.id === quiz.id);
        if (!target) return;

        if (!target.completedBy) target.completedBy = [];
        if (!target.userAttempts) target.userAttempts = {};
        if (!target.wrongPicks) target.wrongPicks = {};
        if (!target.pointsAwarded) target.pointsAwarded = {};

        if (target.completedBy.includes(this.currentUser)) return;

        const currentAttempts = target.userAttempts[this.currentUser] || 0;
        const newAttempts = currentAttempts + 1;
        target.userAttempts[this.currentUser] = newAttempts;

        const isCorrect = optIdx === target.correctIndex;

        // Record partner's selected answer so creator sees it immediately
        target.partnerAnswered = {
            userId: this.currentUser,
            userName: data.users[this.currentUser].name,
            selectedOptionIndex: optIdx,
            selectedOptionText: target.options[optIdx],
            isCorrect: isCorrect,
            attemptNumber: newAttempts,
            answeredAt: new Date().toISOString()
        };
        target.answered = isCorrect || newAttempts >= 2;
        target.answeredBy = this.currentUser;
        target.selectedOptionIndex = optIdx;
        target.selectedOptionText = target.options[optIdx];
        if (!target.answers) target.answers = {};
        target.answers[this.currentUser] = target.partnerAnswered;

        // Real-time cross-browser notification to quiz creator
        const ansResultText = isCorrect 
            ? `ตอบถูกในครั้งที่ ${newAttempts}! (${target.options[optIdx]}) 🎉`
            : (newAttempts === 1 
                ? `ตอบข้อ "${target.options[optIdx]}" (ยังไม่ถูก เหลือโอกาสรอบที่ 2) 💡` 
                : `ตอบผิดทั้ง 2 ครั้ง (ข้อที่เลือก: "${target.options[optIdx]}") 😢`);

        window.appStorage.sendNotification({
            type: 'QUIZ_ANSWER',
            title: `🎯 ${data.users[this.currentUser].name} ตอบคำถามทายใจแล้ว!`,
            message: ansResultText,
            sender: this.currentUser,
            senderName: data.users[this.currentUser].name
        });

        if (isCorrect) {
            target.completedBy.push(this.currentUser);
            // 1st attempt = 100%, 2nd attempt = 50%
            const pointsWon = newAttempts === 1 ? target.reward : Math.floor(target.reward / 2);
            target.pointsAwarded[this.currentUser] = pointsWon;
            data.users[this.currentUser].points += pointsWon;

            if (!data.activityLogs) data.activityLogs = [];
            data.activityLogs.unshift({
                id: 'log_' + Date.now(),
                userId: this.currentUser,
                userName: data.users[this.currentUser].name,
                actionTitle: `ตอบควิซท้าดวล: ข้อ ${optIdx + 1}. "${target.options[optIdx]}" (✅ ถูกต้อง!) 🎯`,
                detail: `รับรางวัล +${pointsWon} แต้ม (${newAttempts === 1 ? 'เต็ม 100%' : '50%'})`,
                category: 'quiz',
                timestamp: new Date().toISOString()
            });

            window.appStorage.saveLocalData(data);

            window.soundManager.playReward();
            if (typeof confetti === 'function') confetti({ particleCount: 60, spread: 50 });

            Swal.fire({
                title: newAttempts === 1 ? 'ตอบถูกในครั้งแรก! 🎉' : 'ตอบถูกในครั้งที่สอง! 👏',
                text: `รู้ใจแฟนที่สุด! ได้รับแต้มสะสม +${pointsWon} แต้ม (${newAttempts === 1 ? 'คะแนนเต็ม 100%' : 'คะแนนครึ่งนึง 50%'})`,
                icon: 'success',
                timer: 2800,
                showConfirmButton: false
            });

            this.renderQuizView();
        } else {
            if (!target.wrongPicks[this.currentUser]) target.wrongPicks[this.currentUser] = [];
            target.wrongPicks[this.currentUser].push(optIdx);

            if (newAttempts === 1) {
                // First wrong pick - give second chance
                if (!data.activityLogs) data.activityLogs = [];
                data.activityLogs.unshift({
                    id: 'log_' + Date.now(),
                    userId: this.currentUser,
                    userName: data.users[this.currentUser].name,
                    actionTitle: `ตอบควิซท้าดวล: ข้อ ${optIdx + 1}. "${target.options[optIdx]}" (❌ ผิดรอบแรก) 🎯`,
                    detail: `เหลือโอกาสเลือกอีก 1 ครั้ง (ตอบถูกรอบสองได้ครึ่งนึง +25 แต้ม)`,
                    category: 'quiz',
                    timestamp: new Date().toISOString()
                });

                window.appStorage.saveLocalData(data);
                window.soundManager.playError();
                
                Swal.fire({
                    title: 'ยังไม่ถูกต้องนะค้าบ 💡',
                    text: `เหลือโอกาสเลือกอีก 1 ครั้ง! ถ้าตอบถูกในครั้งที่สองจะได้คะแนนครึ่งนึง (+${Math.floor(target.reward / 2)} แต้ม)`,
                    icon: 'info',
                    confirmButtonText: 'ลองตอบใหม่อีกครั้ง'
                });

                this.renderQuizView();
            } else {
                // Second wrong pick - failed, reveal answer
                target.completedBy.push(this.currentUser);
                target.pointsAwarded[this.currentUser] = 0;

                if (!data.activityLogs) data.activityLogs = [];
                data.activityLogs.unshift({
                    id: 'log_' + Date.now(),
                    userId: this.currentUser,
                    userName: data.users[this.currentUser].name,
                    actionTitle: `ตอบควิซท้าดวล: ข้อ ${optIdx + 1}. "${target.options[optIdx]}" (❌ ผิดทั้ง 2 ครั้ง) 🎯`,
                    detail: `เฉลยคือข้อ ${target.correctIndex + 1}. "${target.options[target.correctIndex]}"`,
                    category: 'quiz',
                    timestamp: new Date().toISOString()
                });

                window.appStorage.saveLocalData(data);
                window.soundManager.playError();

                Swal.fire({
                    title: 'ตอบไม่ถูกต้องทั้ง 2 ครั้ง 😢',
                    html: `เสียดายจัง ไม่ได้รับแต้มในรอบนี้<br><br>💡 <strong>เฉลยที่ถูกต้อง:</strong> ข้อ ${target.correctIndex + 1}. <span style="color: #2E7D32; font-weight: 700;">${target.options[target.correctIndex]}</span>`,
                    icon: 'warning'
                });

                this.renderQuizView();
            }
        }
    }

    saveNewQuiz(question, opts, correctIdx) {
        const data = window.appStorage.getLocalData();
        const todayStr = new Date().toISOString().split('T')[0];

        // Check if question already created today by current user (1 question/day per user)
        const myTodayQuiz = (data.quizzes || []).find(q => q.date === todayStr && q.creator === this.currentUser);
        if (myTodayQuiz) {
            Swal.fire({
                title: 'คุณตั้งคำถามวันนี้ไปแล้ว ⚠️',
                text: 'คุณได้ตั้งคำถามประจำวันนี้ไปแล้ว สามารถตั้งคำถามใหม่ได้ในวันถัดไปนะ',
                icon: 'warning'
            });
            return;
        }

        // Archive previous quizzes older than today
        if (data.quizzes && data.quizzes.length > 0) {
            data.quizzes.forEach(q => {
                if (q.date !== todayStr) {
                    if (!data.pastQuizzes) data.pastQuizzes = [];
                    if (!data.pastQuizzes.some(pq => pq.id === q.id)) {
                        data.pastQuizzes.unshift(q);
                    }
                }
            });
            data.quizzes = data.quizzes.filter(q => q.date === todayStr);
        }

        const me = data.users[this.currentUser] || { name: this.currentUser };
        const newQuiz = {
            id: 'quiz_' + Date.now(),
            creator: this.currentUser,
            creatorName: me.name || this.currentUser,
            date: todayStr,
            question: question,
            options: opts,
            correctIndex: correctIdx,
            reward: 50,
            completedBy: [],
            answers: {},
            createdAt: new Date().toISOString()
        };

        data.quizzes.unshift(newQuiz);
        if (!data.completedQuests || !data.completedQuests[todayStr] || !data.completedQuests[todayStr][this.currentUser] || !data.completedQuests[todayStr][this.currentUser]['q_quiz']) {
            data.users[this.currentUser].points += 30;
        }

        if (!data.completedQuests) data.completedQuests = {};
        if (!data.completedQuests[todayStr]) data.completedQuests[todayStr] = {};
        if (!data.completedQuests[todayStr][this.currentUser]) data.completedQuests[todayStr][this.currentUser] = {};
        data.completedQuests[todayStr][this.currentUser]['q_quiz'] = true;

        if (!data.activityLogs) data.activityLogs = [];
        data.activityLogs.unshift({
            id: 'log_' + Date.now(),
            userId: this.currentUser,
            userName: me ? me.name : this.currentUser,
            actionTitle: 'ตั้งคำถามประจำวัน 🎯',
            detail: `คำถาม: ${question}`,
            category: 'quiz',
            timestamp: new Date().toISOString()
        });

        window.appStorage.saveLocalData(data);

        // Real-time cross-browser notification to partner
        window.appStorage.sendNotification({
            type: 'QUIZ',
            title: `🎯 ${me.name} ตั้งคำถามทายใจใหม่!`,
            message: `คำถาม: "${question}" เข้ามาร่วมตอบทายใจกันเถอะ!`,
            sender: this.currentUser,
            senderName: me.name
        });

        window.soundManager.playSuccess();
        this.closeModal('modalNewQuiz');
        this.updateHeaderPoints();
        this.renderQuestsView();
        if (typeof this.updateNavBadges === 'function') this.updateNavBadges();
        this.showToast('ส่งคำถามวันนี้ให้แฟนสำเร็จ (+30 แต้ม)! 🎯');
    }

    // 11. Lucky Bell Harvest (Only 1st & 16th of month)
    checkAndOpenHarvestModal() {
        const data = window.appStorage.getLocalData();
        if (!data.cat) {
            this.showToast('โปรดรับเลี้ยงน้องแมวก่อนรับโชคนะ 🐾');
            return;
        }

        const today = new Date();
        const dayOfMonth = today.getDate(); // 1 to 31

        // Check date requirement: 1st or 16th
        if (dayOfMonth !== 1 && dayOfMonth !== 16) {
            Swal.fire({
                title: 'ยังไม่ถึงวันเปิดรับโชค 🔔',
                text: `ลูกแก้วให้โชคจะเปิดให้เก็บเกี่ยวใน "วันที่ 1" และ "วันที่ 16" ของทุกเดือนเท่านั้น (วันนี้วันที่ ${dayOfMonth}) รออีกนิดนะ! ✨`,
                icon: 'info',
                confirmButtonText: 'รับทราบ'
            });
            return;
        }

        // Set breed color info in modal
        const breed = CAT_BREEDS.find(b => b.id === data.cat.breed) || CAT_BREEDS[0];
        document.getElementById('harvestBreedColorName').innerText = `${breed.name} (${breed.postitColor})`;

        this.openModal('modalHarvest');
    }

    submitHarvestPostit(title, message) {
        const data = window.appStorage.getLocalData();
        const breedId = data.cat ? data.cat.breed : 'orange_tabby';
        const breed = CAT_BREEDS.find(b => b.id === breedId) || CAT_BREEDS[0];

        // 3 Lucky Numbers generation
        const luckyGen = (typeof generate3LuckyNumbers === 'function')
            ? generate3LuckyNumbers()
            : { luckyNumber: '782', lucky2: '82', luckyNumbers: ['782', '082', '913'], topDigits: ['7', '8', '2'] };
        const lotteryRef = (typeof getThaiLotteryHistory === 'function')
            ? getThaiLotteryHistory(new Date())
            : null;

        const newPostit = {
            id: 'postit_' + Date.now(),
            author: this.currentUser,
            color: breed.postitColor, // Fixed by breed
            luckyNumber: luckyGen.luckyNumbers.join(' - '),
            luckyNumbers: luckyGen.luckyNumbers,
            lotteryRef: lotteryRef,
            year: new Date().getFullYear(),
            month: new Date().toLocaleDateString('th-TH', { month: 'long' }),
            title: title,
            content: message,
            date: new Date().toISOString().split('T')[0]
        };

        data.postits.unshift(newPostit);
        data.users[this.currentUser].points += 100;

        const me = data.users[this.currentUser];
        if (!data.activityLogs) data.activityLogs = [];
        data.activityLogs.unshift({
            id: 'log_' + Date.now(),
            userId: this.currentUser,
            userName: me ? me.name : this.currentUser,
            actionTitle: 'รับลูกแก้วให้โชค 3 เลขมงคล 🔮',
            detail: `คำอวยพร: "${title}" ได้รับ 3 เลขนำโชค [${luckyGen.luckyNumbers.join(', ')}] พร้อมประวัติหวย 10 ปี (+100 แต้ม)`,
            category: 'cat',
            timestamp: new Date().toISOString()
        });

        window.appStorage.saveLocalData(data);

        // Real-time cross-browser notification to partner
        window.appStorage.sendNotification({
            type: 'POSTIT',
            title: `🔮 ${me.name} แปะโพสต์อิทความทรงจำ`,
            message: `หัวข้อ: "${title}" (3 เลขนำโชค: ${luckyGen.luckyNumbers.join(', ')})`,
            sender: this.currentUser,
            senderName: me.name
        });

        this.closeModal('modalHarvest');
        this.updateHeaderPoints();
        if (typeof this.renderPostitView === 'function') this.renderPostitView();
        if (typeof this.updateNavBadges === 'function') this.updateNavBadges();

        // Trigger Fullscreen Divine Blessing VFX
        this.triggerFullScreenBlessingVFX(newPostit);
    }

    triggerFullScreenBlessingVFX(postit) {
        if (!postit) return;
        const overlay = document.getElementById('blessingFullScreenOverlay');
        const card = document.getElementById('blessingContentCard');
        const particlesWrap = document.getElementById('blessingParticlesContainer');
        if (!overlay || !card) return;

        // Generate 24 floating sacred stardust particles
        if (particlesWrap) {
            particlesWrap.innerHTML = '';
            for (let i = 0; i < 24; i++) {
                const p = document.createElement('div');
                p.className = 'blessing-particle';
                const left = Math.floor(Math.random() * 100);
                const size = Math.floor(4 + Math.random() * 10);
                const dur = (3.5 + Math.random() * 3.5).toFixed(1);
                const delay = (Math.random() * 2.5).toFixed(1);
                p.style.setProperty('--x', `${left}%`);
                p.style.setProperty('--dur', `${dur}s`);
                p.style.animationDelay = `${delay}s`;
                p.style.width = `${size}px`;
                p.style.height = `${size}px`;
                particlesWrap.appendChild(p);
            }
        }

        const luckyNums = (postit.luckyNumbers && Array.isArray(postit.luckyNumbers) && postit.luckyNumbers.length === 3)
            ? postit.luckyNumbers
            : (postit.luckyNumber ? postit.luckyNumber.split(' - ') : ['782', '082', '913']);

        const lotteryRef = postit.lotteryRef || (typeof getThaiLotteryHistory === 'function' ? getThaiLotteryHistory(postit.date || new Date()) : null);

        let tableRowsHtml = '';
        if (lotteryRef && lotteryRef.records && lotteryRef.records.length > 0) {
            tableRowsHtml = lotteryRef.records.map(r => `
                <tr>
                    <td style="font-weight: 700; color: #1565C0;">${r.beYear}</td>
                    <td class="highlight-draw" style="font-weight: 800; font-family: monospace; font-size: 12px;">${r.prize1}</td>
                    <td style="font-weight: 800; color: #2E7D32; font-family: monospace;">${r.last2}</td>
                    <td style="font-size: 10px; color: #555;">${r.front3 || '-'}</td>
                    <td style="font-size: 10px; color: #555;">${r.back3 || '-'}</td>
                </tr>
            `).join('');
        } else {
            tableRowsHtml = `<tr><td colspan="5" style="text-align: center; color: #888; padding: 12px;">ไม่มีข้อมูลสถิติสลากในงวดนี้</td></tr>`;
        }

        card.innerHTML = `
            <div class="blessing-halo-top"></div>
            <div class="blessing-orb-icon">🔮</div>
            <h2 class="blessing-title">✨ ได้รับพรอันศักดิ์สิทธิ์ ✨</h2>
            <p class="blessing-sub">ลูกแก้วสวรรค์บันดาลโชคลาภ นำพาความสุขและความมงคลมาสู่คู่รัก</p>

            <div class="lucky-orbs-container">
                <div class="lucky-single-orb">
                    <span class="lucky-orb-label">เลขมงคลหลัก</span>
                    <span class="lucky-orb-num">${luckyNums[0] || '782'}</span>
                </div>
                <div class="lucky-single-orb">
                    <span class="lucky-orb-label">เลขมงคลรอง</span>
                    <span class="lucky-orb-num">${luckyNums[1] || '082'}</span>
                </div>
                <div class="lucky-single-orb">
                    <span class="lucky-orb-label">เลขนำโชคพิเศษ</span>
                    <span class="lucky-orb-num">${luckyNums[2] || '913'}</span>
                </div>
            </div>

            <div class="blessing-postit-preview">
                <div class="blessing-postit-title">📝 ข้อความอวยพรบน Post-it: "${postit.title || 'คำอธิษฐาน'}"</div>
                <div class="blessing-postit-msg">"${postit.content || ''}"</div>
            </div>

            <div class="lottery-history-drawer" id="blessingLotteryDrawer">
                <div class="lottery-history-header" id="blessingLotteryToggle">
                    <h4>
                        <span>📊</span>
                        <span>สถิติผลสลากกินแบ่งรัฐบาลย้อนหลัง 10 ปี (${lotteryRef ? lotteryRef.drawTitle : 'งวดประจำวันที่ 1 และ 16'})</span>
                    </h4>
                    <span class="lottery-toggle-icon">▼</span>
                </div>
                <div class="lottery-table-wrap">
                    <table class="lottery-history-table">
                        <thead>
                            <tr>
                                <th>ปี พ.ศ.</th>
                                <th>รางวัลที่ 1</th>
                                <th>เลขท้าย 2 ตัว</th>
                                <th>3 ตัวหน้า</th>
                                <th>3 ตัวท้าย</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style="margin-top: 16px;">
                <button type="button" class="blessing-close-btn" id="closeBlessingOverlayBtn">
                    🌟 น้อมรับพร & ปิดหน้าต่าง
                </button>
            </div>
        `;

        // Toggle lottery history drawer
        const toggleBtn = card.querySelector('#blessingLotteryToggle');
        const drawer = card.querySelector('#blessingLotteryDrawer');
        if (toggleBtn && drawer) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                drawer.classList.toggle('expanded');
            });
        }

        // Close actions
        const closeOverlay = () => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.classList.remove('active', 'fade-out');
            }, 320);
        };

        const closeBtn = card.querySelector('#closeBlessingOverlayBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeOverlay();
            });
        }

        overlay.onclick = (e) => {
            if (e.target === overlay || e.target.classList.contains('blessing-sunbeams') || e.target.classList.contains('blessing-pillar')) {
                closeOverlay();
            }
        };

        // Play SFX & Grand Confetti
        window.soundManager.playReward();
        if (typeof confetti === 'function') {
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            setTimeout(() => {
                confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } });
                confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } });
            }, 250);
        }

        // Show Full Screen VFX
        overlay.classList.remove('fade-out');
        overlay.style.display = 'flex';
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
    }

    selectCatBreed(breedId) {
        const data = window.appStorage.getLocalData();
        const breed = CAT_BREEDS.find(b => b.id === breedId);
        if (!breed) return;

        if (!data.cat) {
            this.selectedAdoptBreed = breedId;
            this.closeModal('modalTreeCatalog');
            this.openCatAdoptionModal();
            return;
        }

        Swal.fire({
            title: `เปลี่ยนเป็นแมวพันธุ์ "${breed.name}"? 🐱`,
            text: `ต้องการเริ่มเลี้ยงน้องแมวพันธุ์ ${breed.name} ร่วมกันหรือไม่?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ตกลงเลี้ยงสายพันธุ์นี้',
            cancelButtonText: 'ยกเลิก'
        }).then((res) => {
            if (res.isConfirmed) {
                data.cat.breed = breedId;
                data.cat.name = `น้อง${breed.name}ของเรา`;
                window.appStorage.saveLocalData(data);
                window.appStorage.logActivity(this.currentUser, data.users[this.currentUser].name, 'เปลี่ยนสายพันธุ์แมว 🐱', `เลือกเลี้ยง: ${breed.name}`);

                this.closeModal('modalTreeCatalog');
                window.soundManager.playReward();
                this.showToast(`เปลี่ยนเป็น ${breed.name} สำเร็จ!`);
            }
        });
    }

    sendMissYouNudge() {
        const data = window.appStorage.getLocalData();
        const me = data.users[this.currentUser];
        const partnerId = this.currentUser === 'nether' ? 'Pooja' : 'nether';
        const partner = data.users[partnerId];

        window.soundManager.playNudge('heartbeat');

        // Immediate visual immersion for sender
        this.triggerFullScreenMissYouVFX(me.name, `ส่งสัญญาณบอกรักและความคิดถึงไปยัง ${partner.name} แล้วนะ 💖`, true);

        window.appStorage.sendNudgeBroadcast({
            sender: this.currentUser,
            senderName: me.name,
            target: partnerId,
            message: `${me.name} กดส่งหัวใจบอกว่าคิดถึงเธอสุดหัวใจนะ 💖`
        });

        // Cross-browser real-time notification to partner
        window.appStorage.sendNotification({
            type: 'NUDGE',
            title: `💕 ${me.name} ส่งความคิดถึงมาหา!`,
            message: `${me.name} กดส่งสัญญาณคิดถึงเธอสุดหัวใจนะ 💖`,
            sender: this.currentUser,
            senderName: me.name
        });

        window.appStorage.logActivity(this.currentUser, me.name, 'ส่งสัญญาณคิดถึง 💖', `สะกิดบอก ${partner.name} ว่าคิดถึง`);
        this.showToast(`ส่งสัญญาณบอก ${partner.name} แล้วว่าคิดถึง! 💖`);
    }

    triggerFullScreenMissYouVFX(senderName, message, isSelf = false) {
        // Remove existing overlay if any
        const existing = document.getElementById('missYouFullScreenOverlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'missYouFullScreenOverlay';

        // Ripple glowing rings
        const ripples = document.createElement('div');
        ripples.className = 'miss-you-ripples-container';
        ripples.innerHTML = `
            <div class="miss-you-ripple-ring"></div>
            <div class="miss-you-ripple-ring"></div>
            <div class="miss-you-ripple-ring"></div>
        `;
        overlay.appendChild(ripples);

        // Particle explosion wrap
        const particlesWrap = document.createElement('div');
        particlesWrap.className = 'miss-you-particles-wrap';
        const symbols = ['💖', '💕', '💗', '✨', '🌸', '😽', '💌', '🌟', '💓', '🐾', '🥰'];
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('span');
            p.className = 'miss-you-particle';
            p.innerText = symbols[Math.floor(Math.random() * symbols.length)];
            const tx = (Math.random() - 0.5) * 520;
            const ty = -90 - Math.random() * 380;
            const rot = (Math.random() - 0.5) * 360;
            const delay = Math.random() * 0.55;
            p.style.setProperty('--tx', `${tx}px`);
            p.style.setProperty('--ty', `${ty}px`);
            p.style.setProperty('--rot', `${rot}deg`);
            p.style.left = `${35 + Math.random() * 30}%`;
            p.style.top = `${45 + Math.random() * 20}%`;
            p.style.animationDelay = `${delay}s`;
            p.style.fontSize = `${18 + Math.random() * 24}px`;
            particlesWrap.appendChild(p);
        }
        overlay.appendChild(particlesWrap);

        // Center Glassmorphism Card
        const card = document.createElement('div');
        card.className = 'miss-you-card';
        card.innerHTML = `
            <div class="miss-you-big-heart">💖</div>
            <div class="miss-you-sender-badge">
                <span>💌</span>
                <span>${isSelf ? 'ส่งสัญญาณบอกรักเรียบร้อย' : 'สัญญาณความคิดถึงจากคนพิเศษ'}</span>
            </div>
            <h2 class="miss-you-title">
                ${isSelf ? `ส่งคลื่น <span>ความคิดถึง</span> ถึงแฟนแล้ว!` : `<span>${senderName}</span> คิดถึงคุณสุดหัวใจ!`}
            </h2>
            <p class="miss-you-text">${message || 'ส่งหัวใจบอกว่าคิดถึงเธอสุดหัวใจนะ 💖'}</p>
            <p class="miss-you-subhint">✨ แตะที่ใดก็ได้เพื่อปิดหน้าต่างนี้ ✨</p>
        `;
        overlay.appendChild(card);

        // Dismiss handler
        let isClosed = false;
        const dismiss = () => {
            if (isClosed) return;
            isClosed = true;
            overlay.classList.add('fade-out');
            setTimeout(() => {
                if (overlay.parentNode) overlay.remove();
            }, 500);
        };
        overlay.addEventListener('click', dismiss);

        document.body.appendChild(overlay);

        // Trigger entrance transition
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });

        // Auto fade out & remove after 3.8s
        setTimeout(() => {
            dismiss();
        }, 3800);
    }

    showFloatingHeart() {
        const heart = document.createElement('div');
        heart.className = 'floating-nudge-heart';
        heart.innerText = '💖';
        heart.style.left = '50%';
        heart.style.top = '40%';
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1600);
    }

    showToast(text, icon = '✨') {
        const toast = document.getElementById('globalToastNotice');
        document.getElementById('toastIcon').innerText = icon;
        document.getElementById('toastText').innerText = text;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2800);
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('open');
            if (window.soundManager && typeof window.soundManager.playClick === 'function') {
                try { window.soundManager.playClick(); } catch (e) { /* ignore sound error */ }
            }
        }
    }

    closeModal(modalId) {
        if (!modalId) {
            document.querySelectorAll('.custom-modal-backdrop.open').forEach(m => m.classList.remove('open'));
            return;
        }
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('open');
    }

    updateMealPartnerTabs() {
        const tabNether = document.getElementById('mealTabNether');
        const tabPooja = document.getElementById('mealTabPooja');
        if (!tabNether || !tabPooja) return;

        if (this.currentMealPartner === 'nether') {
            tabNether.classList.add('active-tab');
            tabPooja.classList.remove('active-tab');
        } else {
            tabPooja.classList.add('active-tab');
            tabNether.classList.remove('active-tab');
        }
    }

    openWelcomeManual(step = 0) {
        this.currentManualStep = step;
        this.updateManualSlide();
        this.openModal('modalWelcomeManual');
    }

    updateManualSlide() {
        const slides = document.querySelectorAll('.manual-slide-card');
        const dots = document.querySelectorAll('.manual-dot');
        const prevBtn = document.getElementById('manualPrevBtn');
        const nextBtn = document.getElementById('manualNextBtn');
        const finishBtn = document.getElementById('manualFinishBtn');

        slides.forEach((s, idx) => {
            if (idx === this.currentManualStep) s.classList.add('active');
            else s.classList.remove('active');
        });

        dots.forEach((d, idx) => {
            if (idx === this.currentManualStep) d.classList.add('active');
            else d.classList.remove('active');
        });

        if (prevBtn) prevBtn.style.display = this.currentManualStep > 0 ? 'inline-block' : 'none';
        if (nextBtn) nextBtn.style.display = this.currentManualStep < slides.length - 1 ? 'inline-block' : 'none';
        if (finishBtn) finishBtn.style.display = this.currentManualStep === slides.length - 1 ? 'inline-block' : 'none';
    }

    // -------------------------------------------------------------------------
    // Dual-Confirmation System Reset Section (Settings Modal)
    // -------------------------------------------------------------------------
    renderResetSection() {
        const container = document.getElementById('resetActionContainer');
        const badge = document.getElementById('resetStatusBadge');
        if (!container || !this.currentUser || !window.appStorage) return;

        const data = window.appStorage.getLocalData();
        const me = data.users ? data.users[this.currentUser] : null;
        if (!me) return;

        const partnerId = this.currentUser === 'nether' ? 'Pooja' : 'nether';
        const partnerName = data.users && data.users[partnerId] ? data.users[partnerId].name : partnerId;
        const req = data.resetRequest;

        container.innerHTML = '';

        if (!req) {
            // Case 1: No reset requested yet
            if (badge) {
                badge.innerText = 'ต้องยืนยัน 2 ฝ่าย';
                badge.style.background = '#FFEBEE';
                badge.style.color = '#C62828';
            }

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'secondary-btn';
            btn.style.cssText = 'color: #D32F2F; border-color: #FFCDD2; font-weight: 700; width: 100%;';
            btn.innerHTML = '<span>⚠️ ขอส่งคำขอรีเซ็ตระบบเริ่มต้นใหม่</span>';
            btn.addEventListener('click', () => {
                Swal.fire({
                    title: 'ขอรีเซ็ตระบบเริ่มต้นใหม่? ⚠️',
                    text: `คำขอนี้จะถูกส่งไปหา ${partnerName} เพื่อขอความยินยอม ข้อมูลทั้งหมดจะถูกล้างและเริ่มต้นใหม่ได้ก็ต่อเมื่อ ${partnerName} กดยืนยันเท่านั้น`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#D32F2F',
                    cancelButtonColor: '#757575',
                    confirmButtonText: 'ส่งคำขอรีเซ็ต',
                    cancelButtonText: 'ยกเลิก'
                }).then((res) => {
                    if (res.isConfirmed) {
                        window.appStorage.requestSystemReset(this.currentUser, me.name);
                        this.renderResetSection();
                        this.renderActivityLogs();
                        if (window.soundManager) window.soundManager.playClick();
                        Swal.fire({
                            title: 'ส่งคำขอแล้ว! ⏳',
                            text: `ระบบกำลังรอให้ ${partnerName} เข้ามาในหน้าตั้งค่าและกดยืนยันการรีเซ็ต`,
                            icon: 'info',
                            confirmButtonText: 'รับทราบ'
                        });
                    }
                });
            });
            container.appendChild(btn);
        } else if (req.requestedBy === this.currentUser) {
            // Case 2: Current user requested reset, waiting for partner
            if (badge) {
                badge.innerText = `⏳ รอ ${partnerName} กดยืนยัน`;
                badge.style.background = '#FFF3E0';
                badge.style.color = '#E65100';
            }

            const infoBox = document.createElement('div');
            infoBox.style.cssText = 'background: #FFF8E1; border: 1px dashed #FFE082; padding: 10px; border-radius: var(--radius-sm); font-size: 11.5px; color: #795548; line-height: 1.4;';
            infoBox.innerHTML = `คุณได้ส่งคำขอรีเซ็ตระบบเรียบร้อยแล้ว ขณะนี้กำลังรอ <strong>${partnerName}</strong> เข้ามากดยืนยันอนุมัติ`;
            container.appendChild(infoBox);

            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'secondary-btn';
            cancelBtn.style.cssText = 'font-size: 12px; color: var(--text-secondary); width: 100%;';
            cancelBtn.innerText = 'ยกเลิกคำขอรีเซ็ตระบบ';
            cancelBtn.addEventListener('click', () => {
                window.appStorage.cancelSystemReset(this.currentUser, me.name);
                this.renderResetSection();
                this.renderActivityLogs();
                if (window.soundManager) window.soundManager.playClick();
                this.showToast('ยกเลิกคำขอรีเซ็ตเรียบร้อย');
            });
            container.appendChild(cancelBtn);
        } else {
            // Case 3: Partner requested reset, current user needs to approve or reject
            if (badge) {
                badge.innerText = `⚠️ มีคำขอจาก ${req.requestedByName}`;
                badge.style.background = '#FFCDD2';
                badge.style.color = '#B71C1C';
            }

            const alertBox = document.createElement('div');
            alertBox.style.cssText = 'background: #FFEBEE; border: 1px solid #EF9A9A; padding: 10px; border-radius: var(--radius-sm); font-size: 12px; color: #B71C1C; line-height: 1.4;';
            alertBox.innerHTML = `<strong>${req.requestedByName}</strong> ได้ส่งคำขอรีเซ็ตระบบเริ่มต้นใหม่ทั้งหมด หากคุณกดยืนยัน ข้อมูลแมว บันทึก และมื้ออาหารจะถูกล้าง และทั้งคู่จะได้แต้มเริ่มต้นคนละ 300 แต้ม`;
            container.appendChild(alertBox);

            const btnRow = document.createElement('div');
            btnRow.style.cssText = 'display: flex; gap: 8px;';

            const approveBtn = document.createElement('button');
            approveBtn.type = 'button';
            approveBtn.className = 'primary-btn pulse-glow-btn';
            approveBtn.style.cssText = 'background: #D32F2F; flex: 1; padding: 8px 12px; font-size: 12px;';
            approveBtn.innerHTML = '<span>✅ ยืนยันรีเซ็ตระบบ</span>';
            approveBtn.addEventListener('click', () => {
                Swal.fire({
                    title: 'ยืนยันขั้นสุดท้าย! 🚨',
                    text: `คุณและ ${req.requestedByName} เห็นชอบตรงกันที่จะล้างข้อมูลทั้งหมด ข้อมูลจะถูกรีเซ็ตกลับเป็นค่าเริ่มต้นและไม่สามารถกู้คืนได้`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#D32F2F',
                    cancelButtonColor: '#757575',
                    confirmButtonText: 'ยืนยันรีเซ็ตทันที',
                    cancelButtonText: 'ยกเลิก'
                }).then((res) => {
                    if (res.isConfirmed) {
                        const success = window.appStorage.confirmSystemReset(this.currentUser, me.name);
                        if (success) {
                            if (window.soundManager) window.soundManager.playSuccess();
                            this.closeModal('modalSettings');
                            this.renderAll();
                            this.syncGardenState();
                            this.navigateTo('view-garden');
                            Swal.fire({
                                title: 'รีเซ็ตระบบสำเร็จ! 🐾✨',
                                text: 'ข้อมูลทั้งหมดถูกล้างเรียบร้อยแล้ว ทั้งสองคนมีแต้มตั้งต้นคนละ 300 แต้ม เชิญเลือกรับเลี้ยงน้องแมวตัวใหม่ได้เลย!',
                                icon: 'success',
                                confirmButtonText: 'เริ่มรับเลี้ยงน้องแมว'
                            }).then(() => {
                                this.openCatAdoptionModal();
                            });
                        }
                    }
                });
            });

            const rejectBtn = document.createElement('button');
            rejectBtn.type = 'button';
            rejectBtn.className = 'secondary-btn';
            rejectBtn.style.cssText = 'flex: 1; padding: 8px 12px; font-size: 12px;';
            rejectBtn.innerText = '❌ ปฏิเสธคำขอ';
            rejectBtn.addEventListener('click', () => {
                window.appStorage.cancelSystemReset(this.currentUser, me.name);
                this.renderResetSection();
                this.renderActivityLogs();
                if (window.soundManager) window.soundManager.playClick();
                this.showToast('ปฏิเสธคำขอรีเซ็ตเรียบร้อย');
            });

            btnRow.appendChild(approveBtn);
            btnRow.appendChild(rejectBtn);
            container.appendChild(btnRow);
        }

        if (window.lucide) window.lucide.createIcons();
    }

    updateFirebaseSettingsUI() {
        const badge = document.getElementById('firebaseStatusBadge');
        if (badge) {
            if (window.appStorage && window.appStorage.isFirebaseConnected) {
                badge.innerText = '🟢 Cloud Firestore Connected';
                badge.style.color = 'var(--accent-mint)';
            } else {
                badge.innerText = '⚪ รอการเชื่อมต่อ';
                badge.style.color = '#E65100';
            }
        }
        const input = document.getElementById('firebaseConfigInput');
        if (input && window.appStorage) {
            const cfg = window.appStorage.getFirebaseConfig();
            if (cfg && !input.value.trim()) {
                input.value = JSON.stringify(cfg, null, 2);
            }
        }
    }

    // -------------------------------------------------------------------------
    // Cat Play, Monthly Report, Renaming, Collection, Breeding & History Handlers
    // -------------------------------------------------------------------------
    openCatPlayModal() {
        const data = window.appStorage.getLocalData();
        if (!data.cat) {
            Swal.fire('ยังไม่มีน้องแมว 🐱', 'กรุณารับเลี้ยงน้องแมวก่อนเล่นน้า', 'info');
            return;
        }

        const userPlaySecs = (data.cat.playTime && data.cat.playTime[this.currentUser]) || 0;
        const mins = Math.floor(userPlaySecs / 60);
        const secs = userPlaySecs % 60;
        const timeDisplay = document.getElementById('userPlayTimeDisplay');
        if (timeDisplay) timeDisplay.innerText = `${mins} นาที ${secs} วินาที`;

        const grid = document.getElementById('playToySelectGrid');
        if (grid) {
            grid.innerHTML = '';

            // Check 1-hour cooldown for hands / chin scratch
            const lastHandsTime = (data.cat && data.cat.lastHandsPlay && data.cat.lastHandsPlay[this.currentUser]) || 0;
            const elapsedHands = Date.now() - lastHandsTime;
            const cooldownMs = 60 * 60 * 1000;
            const isHandsReady = elapsedHands >= cooldownMs;
            const minsLeft = Math.max(1, Math.ceil((cooldownMs - elapsedHands) / 60000));
            const handsStatusLabel = isHandsReady ? 'พร้อมเกาคาง (+25 แต้ม)' : `รออีก ${minsLeft} น. ⏳`;

            const toys = [
                { id: 'hands', name: '🖐️ มือเปล่า / เกาคาง', icon: '🖐️', count: handsStatusLabel, isAction: true },
                { id: 'cat_toy_feather', name: '🪶 ไม้ล่อขนนก', icon: '🪶', count: (data.toyInventory && data.toyInventory.cat_toy_feather) || 0 },
                { id: 'cat_toy_yarn', name: '🧶 ไหมพรมกลิ้ง', icon: '🧶', count: (data.toyInventory && data.toyInventory.cat_toy_yarn) || 0 },
                { id: 'cat_toy_laser', name: '✨ เลเซอร์ดาว', icon: '✨', count: (data.toyInventory && data.toyInventory.cat_toy_laser) || 0 }
            ];

            // NO DEFAULT STUCK HIGHLIGHT!
            this.activePlayToy = null;

            toys.forEach(t => {
                const item = document.createElement('div');
                item.className = 'toy-select-card';
                item.style.cssText = 'padding: 8px 10px; border: 1.5px solid var(--border-light); border-radius: 8px; cursor: pointer; background: #fff; display: flex; align-items: center; gap: 8px; font-size: 11.5px; transition: all 0.2s;';
                
                const countColor = t.isAction ? (isHandsReady ? '#2E7D32' : '#E65100') : 'var(--text-secondary)';
                item.innerHTML = `
                    <span style="font-size: 20px;">${t.icon}</span>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.name}</div>
                        <div style="font-size: 10px; color: ${countColor}; font-weight: ${t.isAction ? '700' : 'normal'};">${t.isAction ? t.count : 'คงเหลือ: ' + t.count}</div>
                    </div>
                `;

                item.addEventListener('click', () => {
                    if (t.id === 'hands') {
                        this.playHandsImmediate();
                        return;
                    }
                    this.activePlayToy = t.id;
                    grid.querySelectorAll('.toy-select-card').forEach(c => {
                        c.style.borderColor = 'var(--border-light)';
                        c.style.background = '#fff';
                        c.classList.remove('selected-toy');
                    });
                    item.style.borderColor = '#FF6B4A';
                    item.style.background = '#FFF3E0';
                    item.classList.add('selected-toy');
                    window.soundManager.playClick();
                });
                grid.appendChild(item);
            });
        }

        if (this.activePlayTimer) clearInterval(this.activePlayTimer);
        this.activePlayTimer = null;
        this.activePlaySeconds = 0;
        const timerEl = document.getElementById('playSessionTimer');
        if (timerEl) timerEl.innerText = '00:00';
        const statusEl = document.getElementById('playStageStatus');
        if (statusEl) statusEl.innerText = 'เลือกของเล่นแล้วกดปุ่มเริ่มเล่น หรือกดการ์ดมือเปล่าเพื่อเกาคางทันที';
        const animEl = document.getElementById('playStageAnimation');
        if (animEl) animEl.innerText = '🐾✨';

        const startBtn = document.getElementById('startPlaySessionBtn');
        const stopBtn = document.getElementById('stopPlaySessionBtn');
        if (startBtn) startBtn.style.display = 'block';
        if (stopBtn) stopBtn.style.display = 'none';

        this.openModal('modalCatPlay');
    }

    playHandsImmediate() {
        const data = window.appStorage.getLocalData();
        if (!data.cat) return;

        if (!data.cat.lastHandsPlay) data.cat.lastHandsPlay = {};
        const lastTime = data.cat.lastHandsPlay[this.currentUser] || 0;
        const elapsed = Date.now() - lastTime;
        const cooldownMs = 60 * 60 * 1000;

        if (elapsed < cooldownMs) {
            const minsLeft = Math.max(1, Math.ceil((cooldownMs - elapsed) / 60000));
            window.soundManager.playError();
            Swal.fire({
                title: 'เกาคางได้ 1 ชั่วโมงต่อครั้ง ⏳',
                text: `น้องแมวเพิ่งได้รับการเกาคางไป สามารถเกาคางได้อีกครั้งในอีก ${minsLeft} นาทีค้าบ`,
                icon: 'info',
                confirmButtonText: 'รับทราบ'
            });
            return;
        }

        // Grant 25 points immediately!
        data.cat.lastHandsPlay[this.currentUser] = Date.now();
        data.users[this.currentUser].points += 25;
        data.cat.affectionLevel = Math.min(100, (data.cat.affectionLevel || 50) + 15);
        data.cat.happiness = Math.min(100, (data.cat.happiness || 50) + 10);

        if (!data.cat.playTime) data.cat.playTime = { nether: 0, Pooja: 0 };
        data.cat.playTime[this.currentUser] = (data.cat.playTime[this.currentUser] || 0) + 60;

        if (!data.cat.bondingScores) {
            data.cat.bondingScores = {
                nether: { food: 0, treats: 0, toys: 0, health: 0, playTime: 0 },
                Pooja: { food: 0, treats: 0, toys: 0, health: 0, playTime: 0 }
            };
        }
        if (!data.cat.bondingScores[this.currentUser]) {
            data.cat.bondingScores[this.currentUser] = { food: 0, treats: 0, toys: 0, health: 0, playTime: 0 };
        }
        data.cat.bondingScores[this.currentUser].playTime += 60;

        const today = new Date().toISOString().split('T')[0];
        if (!data.dailyCare) data.dailyCare = {};
        if (!data.dailyCare[today]) data.dailyCare[today] = { foodBy: {}, treatBy: {}, healthBy: {}, playBy: {} };
        if (!data.dailyCare[today].playBy) data.dailyCare[today].playBy = {};
        data.dailyCare[today].playBy[this.currentUser] = true;

        if (!data.dailyCare[today][this.currentUser]) {
            data.dailyCare[today][this.currentUser] = { food: 0, treats: 0, health: 0, playTime: 0 };
        }
        data.dailyCare[today][this.currentUser].playTime = (data.dailyCare[today][this.currentUser].playTime || 0) + 60;

        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(
            this.currentUser,
            data.users[this.currentUser].name,
            'มือเปล่า / เกาคางน้องแมว 🖐️',
            'เกาคางน้องแมวฟินๆ ได้รับคะแนนทันที +25 แต้ม (คูลดาวน์ 1 ชม.)'
        );

        const me = data.users[this.currentUser];

        // Real-time cross-browser notification to partner
        window.appStorage.sendNotification({
            type: 'CAT_ACTION',
            title: `🖐️ ${me.name} เกาคางน้องแมวแล้ว`,
            message: `เกาคางน้องแมวฟินๆ ความสุขผูกพันเพิ่มเป็น ${data.cat.affectionLevel}%`,
            sender: this.currentUser,
            senderName: me.name
        });

        this.markQuestCompleted('q_play');

        window.soundManager.playReward();
        if (window.soundManager.playCatVoice) {
            window.soundManager.playCatVoice(data.cat.breed || 'orange_tabby', 'purr');
        }
        if (this.garden3D && typeof this.garden3D.triggerPlayToy === 'function') {
            this.garden3D.triggerPlayToy('hands');
        }
        if (typeof confetti === 'function') confetti({ particleCount: 50, spread: 50 });

        this.updateHeaderPoints();
        this.syncGardenState();
        this.renderQuestsView();
        if (typeof this.updateNavBadges === 'function') this.updateNavBadges();

        const statusEl = document.getElementById('playStageStatus');
        if (statusEl) statusEl.innerText = 'เกาคางน้องแมวฟินๆ สำเร็จ! ได้รับ +25 แต้มทันที (คูลดาวน์ 1 ชม.)';
        const animEl = document.getElementById('playStageAnimation');
        if (animEl) animEl.innerText = '😻 Purrr~';

        Swal.fire({
            title: 'เกาคางฟินเวอร์! 🖐️🐱💖',
            text: 'น้องแมวชอบมาก ครางเพอร์เบาๆ ได้รับคะแนนทันที +25 แต้ม! (เล่นได้อีกครั้งในอีก 1 ชั่วโมง)',
            icon: 'success',
            timer: 2300,
            showConfirmButton: false
        });

        // Refresh play modal to reflect cooldown status
        this.openCatPlayModal();
    }

    startPlaySession() {
        const data = window.appStorage.getLocalData();
        if (!data.cat) return;

        if (!this.activePlayToy || this.activePlayToy === 'hands') {
            Swal.fire({
                title: 'กรุณาเลือกของเล่น 🧶',
                text: 'สำหรับการเล่นจับเวลา ให้เลือกไม้ล่อขนนก ไหมพรม หรือเลเซอร์ (สำหรับมือเปล่า/เกาคางสามารถคลิกที่การ์ดเพื่อรับ 25 แต้มได้ทันที)',
                icon: 'info'
            });
            return;
        }

        if (this.activePlayToy && this.activePlayToy !== 'hands') {
            const count = (data.toyInventory && data.toyInventory[this.activePlayToy]) || 0;
            if (count <= 0) {
                Swal.fire({
                    title: 'ของเล่นชิ้นนี้หมด 🛒',
                    text: 'คุณสามารถไปแลกของเล่นใหม่ได้ในร้านค้า หรือเลือกเล่นมือเปล่าก่อนได้นะค้าบ',
                    icon: 'warning'
                });
                return;
            }
        }

        const startBtn = document.getElementById('startPlaySessionBtn');
        const stopBtn = document.getElementById('stopPlaySessionBtn');
        if (startBtn) startBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'block';

        this.activePlaySeconds = 0;
        const statusEl = document.getElementById('playStageStatus');
        if (statusEl) statusEl.innerText = 'กำลังเล่นกับน้องแมวอย่างเพลิดเพลิน... ดุ๊กดิ๊กๆ 🐱💖';

        if (this.garden3D && typeof this.garden3D.triggerPlayToy === 'function') {
            this.garden3D.triggerPlayToy(this.activePlayToy || 'hands');
        }

        window.soundManager.playClick();
        if (window.soundManager.playCatVoice) {
            window.soundManager.playCatVoice(data.cat.breed || 'orange_tabby', 'purr');
        }

        if (this.activePlayTimer) clearInterval(this.activePlayTimer);
        this.activePlayTimer = setInterval(() => {
            this.activePlaySeconds++;
            const m = String(Math.floor(this.activePlaySeconds / 60)).padStart(2, '0');
            const s = String(this.activePlaySeconds % 60).padStart(2, '0');
            const timerEl = document.getElementById('playSessionTimer');
            if (timerEl) timerEl.innerText = `${m}:${s}`;

            const animEl = document.getElementById('playStageAnimation');
            if (animEl) {
                const icons = ['🧶✨', '🐱💨', '🐾💖', '🪶✨', '⭐🐾', '🐟💕'];
                animEl.innerText = icons[this.activePlaySeconds % icons.length];
            }
        }, 1000);
    }

    stopPlaySession() {
        if (this.activePlayTimer) {
            clearInterval(this.activePlayTimer);
            this.activePlayTimer = null;
        }

        const duration = this.activePlaySeconds || 0;
        if (duration < 2) {
            Swal.fire('เล่นแป๊บเดียวเอง!', 'ลองเล่นกับน้องให้นานขึ้นอีกนิดเพื่อสะสมเวลาและแต้มน้า', 'info');
            const startBtn = document.getElementById('startPlaySessionBtn');
            const stopBtn = document.getElementById('stopPlaySessionBtn');
            if (startBtn) startBtn.style.display = 'block';
            if (stopBtn) stopBtn.style.display = 'none';
            return;
        }

        const pointsEarned = Math.max(15, Math.floor(duration * 2));
        const data = window.appStorage.getLocalData();
        if (!data.cat.playTime) data.cat.playTime = { nether: 0, Pooja: 0 };
        data.cat.playTime[this.currentUser] = (data.cat.playTime[this.currentUser] || 0) + duration;

        if (!data.cat.bondingScores) {
            data.cat.bondingScores = {
                nether: { food: 0, treats: 0, toys: 0, health: 0, playTime: 0 },
                Pooja: { food: 0, treats: 0, toys: 0, health: 0, playTime: 0 }
            };
        }
        if (!data.cat.bondingScores[this.currentUser]) {
            data.cat.bondingScores[this.currentUser] = { food: 0, treats: 0, toys: 0, health: 0, playTime: 0 };
        }
        data.cat.bondingScores[this.currentUser].playTime += duration;

        if (this.activePlayToy && this.activePlayToy !== 'hands') {
            if (data.toyInventory && data.toyInventory[this.activePlayToy] > 0) {
                data.toyInventory[this.activePlayToy]--;
            }
            data.cat.bondingScores[this.currentUser].toys = (data.cat.bondingScores[this.currentUser].toys || 0) + 1;
        }

        const today = new Date().toISOString().split('T')[0];
        if (!data.dailyCare) data.dailyCare = {};
        if (!data.dailyCare[today]) data.dailyCare[today] = { foodBy: {}, treatBy: {}, healthBy: {}, playBy: {} };
        if (!data.dailyCare[today].playBy) data.dailyCare[today].playBy = {};
        data.dailyCare[today].playBy[this.currentUser] = true;

        if (!data.dailyCare[today][this.currentUser]) {
            data.dailyCare[today][this.currentUser] = { food: 0, treats: 0, health: 0, playTime: 0 };
        }
        data.dailyCare[today][this.currentUser].playTime = (data.dailyCare[today][this.currentUser].playTime || 0) + duration;

        data.users[this.currentUser].points += pointsEarned;
        data.cat.affectionLevel = Math.min(100, (data.cat.affectionLevel || 50) + 15);

        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(
            this.currentUser,
            data.users[this.currentUser].name,
            `เล่นกับน้องแมว (${duration} วินาที) 🧶`,
            `เวลาสะสมเพิ่ม +${duration} วิ, รับรางวัล +${pointsEarned} แต้ม`
        );

        const me = data.users[this.currentUser];

        // Real-time cross-browser notification to partner
        window.appStorage.sendNotification({
            type: 'CAT_ACTION',
            title: `🧶 ${me.name} เล่นกับน้องแมวแล้ว`,
            message: `เล่นกับน้องแมว ${duration} วินาที ได้รับแต้ม +${pointsEarned} แต้ม`,
            sender: this.currentUser,
            senderName: me.name
        });

        this.markQuestCompleted('q_play');

        window.soundManager.playReward();
        if (typeof confetti === 'function') confetti({ particleCount: 50, spread: 50 });

        Swal.fire({
            title: 'เล่นกับน้องแมวเสร็จสิ้น! 🧶🎉',
            html: `เล่นไปทั้งหมด: <strong>${duration} วินาที</strong><br>ได้รับแต้มสะสม: <strong style="color: #E65100;">+${pointsEarned} แต้ม</strong> 🌟<br>ระดับความผูกพันน้องแมวเพิ่มขึ้น!`,
            icon: 'success'
        });

        this.closeModal('modalCatPlay');
        this.syncGardenState();
        this.updateHeaderPoints();
        this.renderQuestsView();
        if (typeof this.updateNavBadges === 'function') this.updateNavBadges();
    }

    openMonthlyBondReportModal() {
        const data = window.appStorage.getLocalData();
        if (!data.cat) {
            Swal.fire('ยังไม่มีน้องแมว 🐱', 'กรุณารับเลี้ยงน้องแมวก่อนดูรายงานน้า', 'info');
            return;
        }

        const scores = data.cat.bondingScores || {};
        const nether = scores.nether || { food: 0, treats: 0, toys: 0, health: 0, playTime: 0, vaccine: 0, grooming: 0, play: 0 };
        const pooja = scores.Pooja || { food: 0, treats: 0, toys: 0, health: 0, playTime: 0, vaccine: 0, grooming: 0, play: 0 };

        const getNum = (val) => {
            const num = Number(val);
            return (!isNaN(num) && num > 0) ? num : 0;
        };

        const netherFood = getNum(nether.food);
        const netherTreats = getNum(nether.treats);
        const netherToys = getNum(nether.toys);
        const netherHealth = getNum(nether.health) + getNum(nether.vaccine) + getNum(nether.grooming);
        const netherPlayMin = Math.floor(getNum(nether.playTime || nether.play) / 60);

        const poojaFood = getNum(pooja.food);
        const poojaTreats = getNum(pooja.treats);
        const poojaToys = getNum(pooja.toys);
        const poojaHealth = getNum(pooja.health) + getNum(pooja.vaccine) + getNum(pooja.grooming);
        const poojaPlayMin = Math.floor(getNum(pooja.playTime || pooja.play) / 60);

        const netherTotal = (netherFood * 10) + (netherTreats * 15) + (netherToys * 20) + (netherHealth * 25) + (netherPlayMin * 10);
        const poojaTotal = (poojaFood * 10) + (poojaTreats * 15) + (poojaToys * 20) + (poojaHealth * 25) + (poojaPlayMin * 10);

        const winnerEl = document.getElementById('monthlyWinnerName');
        const winnerSub = document.getElementById('monthlyWinnerSubtext');

        if (winnerEl) {
            if (netherTotal > poojaTotal) {
                const diff = netherTotal - poojaTotal;
                winnerEl.innerHTML = `🥇 ผู้ชนะอันดับ 1: <strong style="color: #1976D2;">Nether 👨‍💻</strong> (${netherTotal} แต้ม)<br><span style="font-size: 13px; font-weight: 700; color: #D81B60;">🥈 ผู้ตามหลัง: Pooja 🌸 (${poojaTotal} แต้ม)</span>`;
                if (winnerSub) {
                    winnerSub.innerHTML = `🎉 Nether เป็นผู้ชนะประจำเดือนนี้ด้วยคะแนนนำ <strong>+${diff} แต้ม!</strong><br>Pooja อย่าเพิ่งยอมแพ้น้า สู้ๆ มาช่วยกันดูแลน้องแมวเพิ่มกันเถอะ 💕`;
                }
            } else if (poojaTotal > netherTotal) {
                const diff = poojaTotal - netherTotal;
                winnerEl.innerHTML = `🥇 ผู้ชนะอันดับ 1: <strong style="color: #D81B60;">Pooja 🌸</strong> (${poojaTotal} แต้ม)<br><span style="font-size: 13px; font-weight: 700; color: #1976D2;">🥈 ผู้ตามหลัง: Nether 👨‍💻 (${netherTotal} แต้ม)</span>`;
                if (winnerSub) {
                    winnerSub.innerHTML = `🎉 Pooja เป็นผู้ชนะประจำเดือนนี้ด้วยคะแนนนำ <strong>+${diff} แต้ม!</strong><br>Nether ต้องเร่งทำคะแนนให้อาหารและเล่นกับน้องแมวเพิ่มแล้วนะ 🐾✨`;
                }
            } else {
                winnerEl.innerHTML = `🤝 <strong>เสมอกันทั้งสองคน!</strong> (${netherTotal} แต้ม)`;
                if (winnerSub) {
                    winnerSub.innerHTML = 'ทั้ง Nether และ Pooja มอบความรักและดูแลน้องแมวได้คะแนนเท่ากันเป๊ะอย่างอบอุ่น! 💕';
                }
            }
        }

        const tableContainer = document.getElementById('monthlyScoreBreakdownTable');
        if (tableContainer) {
            tableContainer.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; font-size: 11.5px; text-align: left; background: #fff; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm);">
                    <thead>
                        <tr style="background: #FFF8E1; border-bottom: 1.5px solid #FFE082;">
                            <th style="padding: 8px 10px; font-weight: 800; color: #5D4037;">กิจกรรมการดูแล</th>
                            <th style="padding: 8px 10px; font-weight: 800; color: #1976D2; text-align: center;">Nether 👨‍💻</th>
                            <th style="padding: 8px 10px; font-weight: 800; color: #C2185B; text-align: center;">Pooja 🌸</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid var(--border-light);">
                            <td style="padding: 7px 10px;">🐟 ให้อาหารหลัก (+10/มื้อ)</td>
                            <td style="padding: 7px 10px; text-align: center; font-weight: 700;">${netherFood} มื้อ</td>
                            <td style="padding: 7px 10px; text-align: center; font-weight: 700;">${poojaFood} มื้อ</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-light);">
                            <td style="padding: 7px 10px;">💖 ขนมแมวเลีย (+15/ซอง)</td>
                            <td style="padding: 7px 10px; text-align: center; font-weight: 700;">${netherTreats} ซอง</td>
                            <td style="padding: 7px 10px; text-align: center; font-weight: 700;">${poojaTreats} ซอง</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-light);">
                            <td style="padding: 7px 10px;">🧶 ของเล่นแมว (+20/ครั้ง)</td>
                            <td style="padding: 7px 10px; text-align: center; font-weight: 700;">${netherToys} ครั้ง</td>
                            <td style="padding: 7px 10px; text-align: center; font-weight: 700;">${poojaToys} ครั้ง</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-light);">
                            <td style="padding: 7px 10px;">💉 ฉีดวัคซีน/สุขภาพ (+25/ครั้ง)</td>
                            <td style="padding: 7px 10px; text-align: center; font-weight: 700;">${netherHealth} ครั้ง</td>
                            <td style="padding: 7px 10px; text-align: center; font-weight: 700;">${poojaHealth} ครั้ง</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-light);">
                            <td style="padding: 7px 10px;">⏱️ เวลาเล่นรวม (+10/นาที)</td>
                            <td style="padding: 7px 10px; text-align: center; font-weight: 700;">${netherPlayMin} นาที</td>
                            <td style="padding: 7px 10px; text-align: center; font-weight: 700;">${poojaPlayMin} นาที</td>
                        </tr>
                        <tr style="background: #FAFAFA; font-weight: 800; font-size: 12.5px;">
                            <td style="padding: 9px 10px; color: #E65100;">⭐ คะแนนความผูกพันรวม</td>
                            <td style="padding: 9px 10px; text-align: center; color: #1976D2;">${netherTotal} แต้ม</td>
                            <td style="padding: 9px 10px; text-align: center; color: #C2185B;">${poojaTotal} แต้ม</td>
                        </tr>
                    </tbody>
                </table>
            `;
        }

        this.openModal('modalMonthlyBondReport');
    }

    populateSettingsRenameInputs() {
        const netherInput = document.getElementById('renameNetherInput');
        const poojaInput = document.getElementById('renamePoojaInput');
        const data = window.appStorage.getLocalData();
        if (netherInput && data.users && data.users.nether) {
            netherInput.value = data.users.nether.name || 'Nether';
        }
        if (poojaInput && data.users && data.users.Pooja) {
            poojaInput.value = data.users.Pooja.name || 'Pooja';
        }
    }

    saveBothUserNames() {
        const netherInput = document.getElementById('renameNetherInput');
        const poojaInput = document.getElementById('renamePoojaInput');
        if (!netherInput || !poojaInput) return;

        const netherName = netherInput.value.trim();
        const poojaName = poojaInput.value.trim();

        if (!netherName || !poojaName) {
            this.showToast('โปรดระบุชื่อให้ครบทั้ง 2 ฝ่าย');
            return;
        }

        const data = window.appStorage.getLocalData();
        if (!data.users) data.users = {};
        if (!data.users.nether) data.users.nether = { name: 'Nether', avatar: '👨‍💻', points: 300, streak: 1 };
        if (!data.users.Pooja) data.users.Pooja = { name: 'Pooja', avatar: '🌸', points: 300, streak: 1 };

        const oldNether = data.users.nether.name;
        const oldPooja = data.users.Pooja.name;
        data.users.nether.name = netherName;
        data.users.Pooja.name = poojaName;

        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(this.currentUser, data.users[this.currentUser].name, 'เปลี่ยนชื่อคู่รัก 👥', `เปลี่ยนชื่อ Nether: "${oldNether}" ➔ "${netherName}", Pooja: "${oldPooja}" ➔ "${poojaName}"`);

        this.updateAllUINames(data);
        if (window.soundManager) window.soundManager.playSuccess();
        Swal.fire({
            title: 'อัปเดตชื่อสำเร็จ! 👥✨',
            text: `ชื่อคู่รักอัปเดตเป็น: Nether (${netherName}) & Pooja (${poojaName}) เรียบร้อยแล้ว`,
            icon: 'success',
            timer: 2200,
            showConfirmButton: false
        });
    }

    updateAllUINames(data) {
        if (!data) data = window.appStorage.getLocalData();
        const nether = data.users?.nether || { name: 'Nether', avatar: '👨‍💻' };
        const pooja = data.users?.Pooja || { name: 'Pooja', avatar: '🌸' };
        const netherName = nether.name || 'Nether';
        const poojaName = pooja.name || 'Pooja';
        const netherFull = `${netherName} ${nether.avatar || '👨‍💻'}`;
        const poojaFull = `${poojaName} ${pooja.avatar || '🌸'}`;

        // Top bar user info
        this.updateHeaderUserInfo();

        // Meals partner tabs
        const tabNether = document.getElementById('mealTabNether');
        if (tabNether) tabNether.innerHTML = `<span>${netherFull}</span>`;
        const tabPooja = document.getElementById('mealTabPooja');
        if (tabPooja) tabPooja.innerHTML = `<span>${poojaFull}</span>`;

        // Meal history filter buttons
        const mealFilterNether = document.querySelector('.meal-history-filter-btn[data-partner="nether"]');
        if (mealFilterNether) mealFilterNether.innerText = netherFull;
        const mealFilterPooja = document.querySelector('.meal-history-filter-btn[data-partner="Pooja"]');
        if (mealFilterPooja) mealFilterPooja.innerText = poojaFull;

        // Presence bar names & avatars
        const presenceNether = document.getElementById('presenceNetherName');
        if (presenceNether) presenceNether.innerText = netherName;
        const presencePooja = document.getElementById('presencePoojaName');
        if (presencePooja) presencePooja.innerText = poojaName;
        const chipNetherAvatar = document.querySelector('#presenceChipNether .presence-avatar');
        if (chipNetherAvatar) chipNetherAvatar.innerText = nether.avatar || '👨‍💻';
        const chipPoojaAvatar = document.querySelector('#presenceChipPooja .presence-avatar');
        if (chipPoojaAvatar) chipPoojaAvatar.innerText = pooja.avatar || '🌸';

        // Settings rename inputs (if not currently focused)
        const renameNether = document.getElementById('renameNetherInput');
        if (renameNether && !renameNether.matches(':focus')) renameNether.value = netherName;
        const renamePooja = document.getElementById('renamePoojaInput');
        if (renamePooja && !renamePooja.matches(':focus')) renamePooja.value = poojaName;

        // Quiz leaderboard score names
        const quizLabelNether = document.getElementById('quizLabelNether');
        if (quizLabelNether) quizLabelNether.innerText = netherFull;
        const quizLabelPooja = document.getElementById('quizLabelPooja');
        if (quizLabelPooja) quizLabelPooja.innerText = poojaFull;

        // Adoption hero description
        const adoptionHeroDesc = document.querySelector('#adoptionHeroCard .adoption-hero-desc');
        if (adoptionHeroDesc) {
            adoptionHeroDesc.innerHTML = `ยินดีต้อนรับ ${netherFull} & ${poojaFull}! ทั้งสองมีแต้มเริ่มต้นคนละ <strong>300 แต้ม ⭐</strong> มาร่วมสุ่มรับเลี้ยงลูกแมวน้อยปริศนาที่ไม่รู้ว่าเป็นสายพันธุ์อะไร เมื่อร่วมกันดูแลจนครบ <strong>2 เดือน (60 วัน)</strong> จะเฉลยสายพันธุ์ และเมื่อครบ <strong>6 เดือน (180 วัน)</strong> สามารถร่วมกันเก็บเข้าคอลเล็กชันเพื่อเลี้ยงตัวใหม่ได้!`;
        }

        // Re-render currently viewed dynamic lists
        if (this.currentView === 'view-meals') this.renderMealsView();
        if (this.currentView === 'view-notes') this.renderNotesView();
        if (this.currentView === 'view-quiz') this.renderQuizView();
        if (this.currentView === 'view-quests') this.renderQuestsView();
        if (this.currentView === 'view-chat') this.renderChatMessages();
    }

    saveUserDisplayName() {
        this.saveBothUserNames();
    }

    updateNotificationSettingsUI() {
        const badge = document.getElementById('browserNotifBadge');
        if (!badge) return;
        if (!("Notification" in window)) {
            badge.innerText = 'ไม่รองรับ';
            badge.style.background = '#FEE2E2';
            badge.style.color = '#B91C1C';
        } else if (Notification.permission === 'granted') {
            badge.innerText = 'เปิดใช้งานแล้ว ✓';
            badge.style.background = '#DCFCE7';
            badge.style.color = '#15803D';
        } else if (Notification.permission === 'denied') {
            badge.innerText = 'ถูกปิดกั้น ✕';
            badge.style.background = '#FEE2E2';
            badge.style.color = '#B91C1C';
        } else {
            badge.innerText = 'ยังไม่เปิด';
            badge.style.background = '#FEF3C7';
            badge.style.color = '#B45309';
        }
    }

    requestBrowserNotificationPermission() {
        if (!("Notification" in window)) {
            Swal.fire({
                title: 'ไม่รองรับการแจ้งเตือน ⚠️',
                text: 'เบราว์เซอร์หรืออุปกรณ์นี้ไม่รองรับ Web Notification API',
                icon: 'warning'
            });
            return;
        }

        Notification.requestPermission().then((permission) => {
            this.updateNotificationSettingsUI();
            if (permission === 'granted') {
                Swal.fire({
                    title: 'เปิดการแจ้งเตือนสำเร็จ! 🔔✨',
                    text: 'คุณจะได้รับการแจ้งเตือนแชท, สัญญาณคิดถึง, ควิซ, โน้ตคู่, มื้ออาหาร และสถานะน้องแมวแบบเรียลไทม์',
                    icon: 'success'
                });
                try {
                    new Notification('SoulGarden พร้อมแจ้งเตือนแล้ว 🐾', {
                        body: 'เชื่อมต่อระบบแจ้งเตือนแบบเรียลไทม์เรียบร้อยแล้ว 💕',
                        icon: 'favicon.ico'
                    });
                } catch (e) {}
            } else {
                Swal.fire({
                    title: 'การแจ้งเตือนยังไม่เปิด 🔒',
                    text: 'สิทธิ์การแจ้งเตือนถูกปิดกั้นไว้ คุณสามารถอนุญาตได้ที่การตั้งค่าของเบราว์เซอร์',
                    icon: 'info'
                });
            }
        });
    }

    testBrowserNotification() {
        if (!("Notification" in window)) {
            this.showToast('เบราว์เซอร์นี้ไม่รองรับ Web Notification API');
            return;
        }

        if (Notification.permission === 'granted') {
            try {
                const n = new Notification('🧪 ทดสอบการแจ้งเตือน SoulGarden 🐾', {
                    body: 'ระบบแจ้งเตือนทำงานได้สมบูรณ์แบบทั้งในและนอกแท็บ! 🐱💕',
                    icon: 'favicon.ico',
                    tag: 'test_notification_' + Date.now()
                });
                n.onclick = () => { window.focus(); n.close(); };
                this.showToast('ส่งแจ้งเตือนทดสอบแล้ว! 🔔');
            } catch (e) {
                this.showToast('เกิดข้อผิดพลาด: ' + e.message);
            }
        } else {
            this.requestBrowserNotificationPermission();
        }
    }

    handleIncomingPartnerNotification(payload) {
        if (!payload) return;
        // Do not alert if sender is currentUser
        if (payload.sender && payload.sender === this.currentUser) return;

        // Play appropriate sound
        try {
            if (window.soundManager) {
                if (payload.type === 'CHAT') {
                    window.soundManager.playMessage(true);
                } else if (payload.type === 'CAT_STATUS') {
                    window.soundManager.playPurr();
                } else {
                    window.soundManager.playReward();
                }
            }
        } catch (e) {}

        // Desktop / OS Web Notification API
        if ("Notification" in window && Notification.permission === "granted") {
            try {
                const n = new Notification(payload.title || 'SoulGarden 🐾', {
                    body: payload.message || '',
                    icon: 'favicon.ico',
                    badge: 'favicon.ico',
                    tag: payload.id || ('soulgarden_' + (payload.type || 'msg')),
                    renotify: true
                });
                n.onclick = () => {
                    window.focus();
                    n.close();
                };
            } catch (e) {
                console.warn('Native Notification error:', e);
            }
        }

        // In-app Toast
        const senderLabel = payload.senderName ? ` [${payload.senderName}]` : '';
        this.showToast(`${payload.title}${senderLabel}: ${payload.message}`);

        // Live refresh views if currently visible
        try {
            if (payload.type === 'CHAT' && this.currentView === 'view-chat') {
                this.renderChatView();
            } else if ((payload.type === 'QUIZ' || payload.type === 'QUIZ_ANSWER') && this.currentView === 'view-quiz') {
                this.renderQuizView();
            } else if (payload.type === 'NOTE' && this.currentView === 'view-notes') {
                this.renderNotesView();
            } else if (payload.type === 'MEAL' && this.currentView === 'view-meals') {
                this.renderMealsView();
            } else if (payload.type === 'POSTIT' && this.currentView === 'view-calendar') {
                this.renderPostitView();
            } else if (payload.type === 'CAT' || payload.type === 'CAT_STATUS') {
                this.syncGardenState();
            }
            this.updateNavBadges();
        } catch (e) {}
    }

    checkCatStatusAlerts() {
        const data = window.appStorage.getLocalData();
        if (!data || !data.cat) return;
        const cat = data.cat;
        const now = Date.now();
        const cooldown = 2.5 * 60 * 60 * 1000; // 2.5 hours cooldown per issue type

        if (!this.lastCatStatusAlertTime) this.lastCatStatusAlertTime = {};

        // 1. Cat is hungry (fullness <= 30)
        const fullness = typeof cat.fullnessLevel === 'number' ? cat.fullnessLevel : 50;
        if (fullness <= 30 && (now - (this.lastCatStatusAlertTime.hunger || 0) > cooldown)) {
            this.lastCatStatusAlertTime.hunger = now;
            window.appStorage.sendNotification({
                type: 'CAT_STATUS',
                title: '🐾 น้องแมวกำลังหิวมากเลย!',
                message: `ระดับความอิ่มลดเหลือ ${fullness}% แล้ว รีบมาให้อาหารน้า 🐟`,
                sender: 'cat',
                senderName: cat.name,
                data: { issue: 'hunger', fullness }
            });
        }

        // 2. Cat has fever
        if (cat.hasFever && (now - (this.lastCatStatusAlertTime.fever || 0) > cooldown)) {
            this.lastCatStatusAlertTime.fever = now;
            window.appStorage.sendNotification({
                type: 'CAT_STATUS',
                title: '🩹 น้องแมวมีไข้ตัวร้อน!',
                message: `${cat.name} รู้สึกไม่สบาย ต้องการวัคซีนและการดูแลด่วนจ้า 💉`,
                sender: 'cat',
                senderName: cat.name,
                data: { issue: 'fever' }
            });
        }

        // 3. Cat has long nails
        if (cat.hasLongNails && (now - (this.lastCatStatusAlertTime.nails || 0) > cooldown)) {
            this.lastCatStatusAlertTime.nails = now;
            window.appStorage.sendNotification({
                type: 'CAT_STATUS',
                title: '✂️ เล็บน้องแมวยาวเกินไปแล้ว!',
                message: `เล็บของ ${cat.name} เริ่มยาวรุงรัง มาช่วยกันตัดเล็บให้น้องหน่อยน้า 🐾`,
                sender: 'cat',
                senderName: cat.name,
                data: { issue: 'nails' }
            });
        }

        // 4. Cat health <= 50
        const health = typeof cat.health === 'number' ? cat.health : 100;
        if (health <= 50 && (now - (this.lastCatStatusAlertTime.health || 0) > cooldown)) {
            this.lastCatStatusAlertTime.health = now;
            window.appStorage.sendNotification({
                type: 'CAT_STATUS',
                title: '⚠️ สุขภาพน้องแมวลดต่ำผิดปกติ!',
                message: `ระดับสุขภาพของ ${cat.name} เหลือเพียง ${health}% ช่วยกันเข้ามาดูแลน้องด้วยนะ`,
                sender: 'cat',
                senderName: cat.name,
                data: { issue: 'health', health }
            });
        }

        // 5. Cat affection <= 30 (lonely)
        const affection = typeof cat.affectionLevel === 'number' ? cat.affectionLevel : 60;
        if (affection <= 30 && (now - (this.lastCatStatusAlertTime.affection || 0) > cooldown)) {
            this.lastCatStatusAlertTime.affection = now;
            window.appStorage.sendNotification({
                type: 'CAT_STATUS',
                title: '😿 น้องแมวเหงาและคิดถึงคุณทั้งสอง',
                message: `ความผูกพันลดเหลือ ${affection}% แวะมาลูบหัวหรือเล่นกับน้องหน่อยนะ 💕`,
                sender: 'cat',
                senderName: cat.name,
                data: { issue: 'affection', affection }
            });
        }
    }

    openCatCollectionModal() {
        const data = window.appStorage.getLocalData();
        if (!data.cat) {
            Swal.fire('ยังไม่มีน้องแมว 🐱', 'กรุณารับเลี้ยงน้องแมวก่อนเปิดคอลเล็กชันน้า', 'info');
            return;
        }

        const catAgeDays = Math.max(1, Math.floor((Date.now() - (data.cat.adoptedAt || Date.now())) / 86400000));
        const ageBadge = document.getElementById('currentCatAgeBadge');
        if (ageBadge) ageBadge.innerText = `อายุ ${catAgeDays} วัน`;

        const noticeEl = document.getElementById('currentCatRetireEligibilityNotice');
        const actionBox = document.getElementById('retireCatActionBox');

        if (catAgeDays < 180) {
            if (noticeEl) {
                noticeEl.innerHTML = `ต้องเลี้ยงให้โตเต็มวัยครบ <strong>6 เดือน (180 วัน)</strong> เพื่อปลดล็อคการเก็บเข้าคอลเล็กชันและเลี้ยงตัวใหม่ (ปัจจุบันอายุ: <strong>${catAgeDays} วัน</strong>, เหลืออีก ${180 - catAgeDays} วัน) ⏳`;
            }
            if (actionBox) {
                actionBox.innerHTML = `
                    <button class="secondary-btn" disabled style="opacity: 0.6; cursor: not-allowed; width: 100%; font-size: 11.5px;">
                        🔒 ปลดล็อคเมื่อครบ 6 เดือน (180 วัน)
                    </button>
                `;
            }
        } else {
            if (noticeEl) {
                noticeEl.innerHTML = `🎉 น้องแมวโตเต็มวัยครบ 6 เดือนแล้ว! สามารถเก็บเข้าคอลเล็กชันแห่งความทรงจำและรับเลี้ยงตัวใหม่ได้ (ต้องได้รับความเห็นชอบจากทั้งสองฝ่าย)`;
            }

            const req = data.catRetireRequest;
            if (actionBox) {
                if (!req) {
                    actionBox.innerHTML = `
                        <button class="primary-btn" id="requestRetireCatBtn" style="background: #6A1B9A; width: 100%; font-size: 12px;">
                            🐾 เสนอขอเก็บเข้าคอลเล็กชัน & เลี้ยงตัวใหม่ (รอแฟนเห็นชอบ)
                        </button>
                    `;
                    const btn = document.getElementById('requestRetireCatBtn');
                    if (btn) btn.addEventListener('click', () => this.handleRetireCatRequest());
                } else if (req.requestedBy === this.currentUser) {
                    actionBox.innerHTML = `
                        <div style="background: #FFF3E0; border: 1px solid #FFE082; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 700; color: #E65100; text-align: center;">
                            ⏳ คุณได้ส่งคำขอแล้ว! กำลังรอให้อีกฝ่ายกดยืนยันเห็นชอบ
                        </div>
                    `;
                } else {
                    actionBox.innerHTML = `
                        <div style="background: #E8F5E9; border: 1px solid #C8E6C9; padding: 10px; border-radius: 8px; margin-bottom: 8px; font-size: 12px; font-weight: 700; color: #2E7D32; text-align: center;">
                            💌 แฟนของคุณเสนอขอเก็บน้องเข้าคอลเล็กชันและรับเลี้ยงตัวใหม่!
                        </div>
                        <button class="primary-btn" id="approveRetireCatBtn" style="background: #2E7D32; width: 100%; font-size: 12px;">
                            ✅ ยืนยันเห็นชอบ & เก็บเข้าคอลเล็กชันทันที ✨
                        </button>
                    `;
                    const btn = document.getElementById('approveRetireCatBtn');
                    if (btn) btn.addEventListener('click', () => this.handleRetireCatApproval());
                }
            }
        }

        const collection = data.catCollection || [];
        const countBadge = document.getElementById('collectionCountBadge');
        if (countBadge) countBadge.innerText = `${collection.length} ตัว`;

        const grid = document.getElementById('retiredCatsGrid');
        if (grid) {
            grid.innerHTML = '';
            if (collection.length === 0) {
                grid.innerHTML = `<div style="grid-column: span 2; text-align: center; color: var(--text-muted); padding: 16px; font-size: 11.5px;">ยังไม่มีแมวในคอลเล็กชัน เลี้ยงให้ครบ 6 เดือนเพื่อบันทึกน้องตัวแรกเข้าสู่คลัง!</div>`;
            } else {
                collection.forEach(c => {
                    const card = document.createElement('div');
                    card.style.cssText = 'background: #fff; border: 1px solid var(--border-light); border-radius: 8px; padding: 8px 10px; display: flex; align-items: center; gap: 8px; font-size: 11.5px;';
                    const icon = c.isHybrid ? '🧬' : '🐱';
                    card.innerHTML = `
                        <div style="font-size: 24px;">${icon}</div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 800; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.name}</div>
                            <div style="font-size: 10px; color: #6A1B9A; font-weight: 700;">${c.breedName || 'แมว'}</div>
                            <div style="font-size: 9.5px; color: var(--text-muted);">บันทึกเมื่อ: ${new Date(c.retiredAt).toLocaleDateString('th-TH')}</div>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            }
        }

        const p1Select = document.getElementById('breedParent1Select');
        const p2Select = document.getElementById('breedParent2Select');
        if (p1Select && p2Select) {
            p1Select.innerHTML = '<option value="">-- เลือกพ่อพันธุ์ --</option>';
            p2Select.innerHTML = '<option value="">-- เลือกแม่พันธุ์ --</option>';
            collection.forEach(c => {
                p1Select.innerHTML += `<option value="${c.id}">${c.name} (${c.breedName || 'แมว'})</option>`;
                p2Select.innerHTML += `<option value="${c.id}">${c.name} (${c.breedName || 'แมว'})</option>`;
            });
        }

        this.openModal('modalCatCollection');
    }

    handleRetireCatRequest() {
        const data = window.appStorage.getLocalData();
        data.catRetireRequest = {
            requestedBy: this.currentUser,
            requestedAt: Date.now()
        };
        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(
            this.currentUser,
            data.users[this.currentUser].name,
            'เสนอขอเก็บแมวเข้าคอลเล็กชัน 🏛️',
            'รอการยืนยันเห็นชอบจากอีกฝ่าย'
        );

        window.soundManager.playSuccess();
        Swal.fire({
            title: 'ส่งคำขอแล้ว! 🐾⏳',
            text: 'ส่งคำขอเก็บน้องแมวเข้าคอลเล็กชันและรับเลี้ยงตัวใหม่ไปยังแฟนแล้ว เมื่อแฟนกดยืนยันเห็นชอบ ระบบจะย้ายน้องเข้าคอลเล็กชันทันที',
            icon: 'info'
        });

        this.openCatCollectionModal();
    }

    handleRetireCatApproval() {
        const res = window.appStorage.retireCatToCollection(this.currentUser);
        if (res.success) {
            window.soundManager.playReward();
            if (typeof confetti === 'function') confetti({ particleCount: 80, spread: 60 });

            Swal.fire({
                title: 'สำเร็จแล้ว! 🐾🎉',
                html: `เก็บเจ้านายตัวเดิมเข้าสู่ <strong>คอลเล็กชันแมวแห่งความทรงจำ</strong> เรียบร้อยแล้ว<br><br>🎁 และได้เปิดกล่องรับเลี้ยง <strong>ลูกแมวปริศนาตัวใหม่</strong> เรียบร้อยแล้ว! มารอลุ้นสายพันธุ์กันนะค้าบ`,
                icon: 'success'
            });

            this.closeModal('modalCatCollection');
            this.syncGardenState();
            if (this.garden3D && typeof this.garden3D.loadCatModel === 'function') {
                const refreshedData = window.appStorage.getLocalData();
                this.garden3D.loadCatModel(refreshedData.cat.breed || 'mystery_kitten');
            }
        } else {
            Swal.fire('ข้อผิดพลาด', res.message, 'error');
        }
    }

    startCrossBreeding() {
        const p1 = document.getElementById('breedParent1Select').value;
        const p2 = document.getElementById('breedParent2Select').value;

        if (!p1 || !p2) {
            Swal.fire('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกทั้งพ่อพันธุ์และแม่พันธุ์จากคอลเล็กชัน', 'warning');
            return;
        }

        if (p1 === p2) {
            Swal.fire('เลือกซ้ำกันไม่ได้', 'กรุณาเลือกแมวคนละตัวเพื่อผสมพันธุ์ข้ามสายพันธุ์', 'warning');
            return;
        }

        const res = window.appStorage.breedCats(p1, p2, this.currentUser);
        if (res.success) {
            window.soundManager.playReward();
            if (typeof confetti === 'function') confetti({ particleCount: 70, spread: 55 });

            Swal.fire({
                title: 'กำเนิดลูกแมวไฮบริดสายพันธุ์ใหม่! 🧬🐾',
                html: `ยินดีด้วย! ได้รับลูกแมวไฮบริด <strong>${res.newCat.name}</strong><br>สายพันธุ์ผสม: <strong style="color: #C2185B;">${res.newCat.breedName}</strong><br>บันทึกเข้าสู่คลังคอลเล็กชันเรียบร้อยแล้ว (+100 แต้ม)`,
                icon: 'success'
            });

            this.openCatCollectionModal();
        } else {
            Swal.fire('ข้อผิดพลาด', res.message, 'error');
        }
    }

    openMealHistoryModal() {
        const data = window.appStorage.getLocalData();
        const recordsMap = new Map();

        // 1. Automatically aggregate from data.meals (stores every meal and snack for all dates & partners)
        if (data.meals) {
            Object.keys(data.meals).forEach(dateStr => {
                const dayObj = data.meals[dateStr];
                if (!dayObj) return;
                ['nether', 'Pooja'].forEach(uId => {
                    const uData = dayObj[uId];
                    if (!uData) return;
                    const key = `${dateStr}_${uId}`;
                    const breakfast = uData.breakfast || { eaten: false, time: '', name: '' };
                    const lunch = uData.lunch || { eaten: false, time: '', name: '' };
                    const dinner = uData.dinner || { eaten: false, time: '', name: '' };
                    const snacks = uData.snacks || [];
                    const hasActivity = breakfast.eaten || lunch.eaten || dinner.eaten || snacks.length > 0;

                    recordsMap.set(key, {
                        id: 'meal_' + key,
                        userId: uId,
                        userName: data.users?.[uId]?.name || (uId === 'nether' ? 'Nether' : 'Pooja'),
                        date: dateStr,
                        archivedAt: dateStr,
                        meals: [
                            { id: 'breakfast', label: 'มื้อเช้า', eaten: !!breakfast.eaten, time: breakfast.time || '', name: breakfast.name || '' },
                            { id: 'lunch', label: 'มื้อเที่ยง', eaten: !!lunch.eaten, time: lunch.time || '', name: lunch.name || '' },
                            { id: 'dinner', label: 'มื้อเย็น', eaten: !!dinner.eaten, time: dinner.time || '', name: dinner.name || '' }
                        ],
                        snacks: snacks,
                        hasActivity: hasActivity
                    });
                });
            });
        }

        // 2. Also incorporate any pre-existing records in data.mealHistory
        if (data.mealHistory && Array.isArray(data.mealHistory)) {
            data.mealHistory.forEach(item => {
                const key = `${item.date}_${item.userId}`;
                if (!recordsMap.has(key)) {
                    recordsMap.set(key, {
                        ...item,
                        hasActivity: true
                    });
                }
            });
        }

        let list = Array.from(recordsMap.values());
        // Sort descending by date
        list.sort((a, b) => b.date.localeCompare(a.date));

        // Filter by partner
        if (this.currentMealHistoryPartner !== 'all') {
            list = list.filter(m => m.userId === this.currentMealHistoryPartner);
        }

        const container = document.getElementById('mealHistoryContainerList');
        if (container) {
            container.innerHTML = '';
            if (list.length === 0) {
                container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 24px; font-size: 12px;">ยังไม่มีประวัติมื้ออาหารที่บันทึกไว้ในคลัง</div>`;
            } else {
                list.forEach(item => {
                    const card = document.createElement('div');
                    card.style.cssText = 'background: #fff; border: 1.5px solid var(--border-light); border-radius: var(--radius-md); padding: 12px; box-shadow: var(--shadow-sm); margin-bottom: 2px;';
                    const userBadge = item.userId === 'nether' 
                        ? '<span style="background: #E3F2FD; color: #1976D2; padding: 2px 8px; border-radius: 8px; font-size: 10.5px; font-weight: 700;">Nether 👨‍💻</span>'
                        : '<span style="background: #FCE4EC; color: #C2185B; padding: 2px 8px; border-radius: 8px; font-size: 10.5px; font-weight: 700;">Pooja 🌸</span>';

                    let mealsHtml = '';
                    (item.meals || []).forEach(m => {
                        const icon = m.id === 'breakfast' ? '🍳' : m.id === 'lunch' ? '🍱' : '🍲';
                        const status = m.eaten 
                            ? `<span style="color: #2E7D32; font-weight: 700;">ทานแล้ว (${m.name || 'อิ่มอร่อย'})${m.time ? ' • ' + m.time : ''}</span>` 
                            : `<span style="color: var(--text-muted); font-size: 11px;">ยังไม่ได้ทาน</span>`;
                        mealsHtml += `
                            <div style="display: flex; justify-content: space-between; font-size: 11.5px; padding: 4px 0; border-bottom: 1px dashed #f0f0f0;">
                                <span>${icon} ${m.label}:</span>
                                <span>${status}</span>
                            </div>
                        `;
                    });

                    let snacksHtml = '';
                    if (item.snacks && item.snacks.length > 0) {
                        snacksHtml = `
                            <div style="margin-top: 6px; padding-top: 5px; border-top: 1px solid #f5f5f5;">
                                <div style="font-size: 11px; font-weight: 700; color: #E65100; margin-bottom: 3px;">🧋 ของว่าง / มื้อย่อย (${item.snacks.length} รายการ):</div>
                                ${item.snacks.map(s => `
                                    <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-secondary); padding: 2px 0;">
                                        <span>• ${s.name || 'ของว่าง'}</span>
                                        <span>${s.time || ''} (+${s.pts || 10} แต้ม)</span>
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    }

                    card.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-weight: 800; font-size: 12.5px; color: var(--text-primary);">📅 ${item.date}</span>
                            ${userBadge}
                        </div>
                        <div style="margin-bottom: 4px;">${mealsHtml}</div>
                        ${snacksHtml}
                    `;
                    container.appendChild(card);
                });
            }
        }

        this.openModal('modalMealHistory');
    }

    handleClearChatAndCareHistory() {
        const data = window.appStorage.getLocalData();
        const userName = data.users[this.currentUser].name;

        Swal.fire({
            title: 'ยืนยันลบแชท & ความผูกพัน 🗑️',
            html: '<p style="font-size:14px; color:#555;">ข้อความแชททั้งหมด บันทึกประวัติการดูแล มื้ออาหาร และ<b>คะแนนความผูกพันของน้องแมว</b>จะถูกล้างออกพร้อมกันอย่างถาวร</p><p style="font-size:13px; color:#E53935; font-weight:bold;">คุณต้องการลบข้อมูลเหล่านี้ทั้งหมดทันทีหรือไม่?</p>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#D32F2F',
            cancelButtonColor: '#78909C',
            confirmButtonText: 'ใช่ ลบแชท & ความผูกพันทันที',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                window.appStorage.clearChatAndCareHistory(this.currentUser, userName);
                window.soundManager.playDelete();
                this.renderChatView();
                this.renderAuditLogs();
                if (this.currentView === 'cat') {
                    this.renderCatView();
                }
                this.showToast('ลบข้อความแชท ประวัติดูแล และคะแนนความผูกพันเรียบร้อยแล้ว 🗑️');
            }
        });
    }

    // -------------------------------------------------------------------------
    // Event Bindings
    // -------------------------------------------------------------------------
    bindEvents() {
        // ---------------------------------------------------------------------
        // Universal Delegated Modal Close & Backdrop Click Handler (Registered first)
        // ---------------------------------------------------------------------
        document.addEventListener('click', (e) => {
            // 1. If clicked a close button or element inside a close button
            const closeTarget = e.target.closest('[data-close], .modal-close-btn');
            if (closeTarget) {
                const targetModalId = closeTarget.getAttribute('data-close');
                if (targetModalId) {
                    this.closeModal(targetModalId);
                } else {
                    const parentModal = closeTarget.closest('.custom-modal-backdrop');
                    if (parentModal) this.closeModal(parentModal.id);
                }
                return;
            }

            // 2. If clicked directly on the modal backdrop outside the dialog box
            if (e.target.classList.contains('custom-modal-backdrop')) {
                this.closeModal(e.target.id);
            }
        });

        // Close on Escape key press
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.custom-modal-backdrop.open');
                openModals.forEach(modal => this.closeModal(modal.id));
            }
        });

        // Safe helper to attach event listeners without throwing if element is missing
        const safeOn = (id, event, callback) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener(event, callback);
            return el;
        };

        // Login Form (Case-insensitive user ID check & password validation)
        safeOn('loginForm', 'submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('loginId')?.value?.trim() || '';
            const pass = document.getElementById('loginPass')?.value?.trim() || '';

            const passErr = document.getElementById('passErrorMsg');
            if (passErr) passErr.classList.remove('show');

            const idLower = id.toLowerCase();
            if (idLower === 'nether' && pass === 'nether28') {
                if (window.soundManager) window.soundManager.playSuccess();
                this.setLoggedInUser('nether');
            } else if (idLower === 'pooja' && (pass === 'Poo_0001' || pass === 'poo_0001')) {
                if (window.soundManager) window.soundManager.playSuccess();
                this.setLoggedInUser('Pooja');
            } else {
                if (window.soundManager) window.soundManager.playError();
                if (passErr) {
                    passErr.innerText = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง โปรดตรวจสอบอีกครั้ง';
                    passErr.classList.add('show');
                }
            }
        });

        // Welcome Manual / Help Button
        safeOn('openWelcomeManualBtn', 'click', () => {
            this.openWelcomeManual(0);
        });

        // Welcome Manual Navigation Handlers
        safeOn('manualPrevBtn', 'click', () => {
            if (this.currentManualStep > 0) {
                this.currentManualStep--;
                this.updateManualSlide();
                window.soundManager.playClick();
            }
        });

        safeOn('manualNextBtn', 'click', () => {
            const slides = document.querySelectorAll('.manual-slide-card');
            if (this.currentManualStep < slides.length - 1) {
                this.currentManualStep++;
                this.updateManualSlide();
                window.soundManager.playClick();
            }
        });

        safeOn('manualFinishBtn', 'click', () => {
            this.closeModal('modalWelcomeManual');
            window.soundManager.playReward();
            const data = window.appStorage.getLocalData();
            if (data.users && data.users[this.currentUser]) {
                data.users[this.currentUser].hasSeenWelcomeManual = true;
                window.appStorage.saveLocalData(data);
            }
            if (!data.cat) {
                this.openCatAdoptionModal();
            }
        });

        const dots = document.querySelectorAll('.manual-dot');
        dots.forEach((d, idx) => {
            d.addEventListener('click', () => {
                this.currentManualStep = idx;
                this.updateManualSlide();
                window.soundManager.playClick();
            });
        });

        // Bottom Nav
        const navBtns = document.querySelectorAll('.nav-item-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('data-target');
                window.soundManager.playClick();
                this.navigateTo(target);
            });
        });

        // Header Actions
        safeOn('headerPointsBtn', 'click', () => {
            this.navigateTo('view-quests');
        });

        safeOn('sendNudgeBtn', 'click', () => {
            this.sendMissYouNudge();
        });

        safeOn('openActivityLogBtn', 'click', () => {
            this.activeActivityCategory = 'all';
            this.activitySearchTerm = '';
            const searchInput = document.getElementById('activitySearchInput');
            if (searchInput) searchInput.value = '';
            const clearBtn = document.getElementById('clearActivitySearchBtn');
            if (clearBtn) clearBtn.style.display = 'none';
            const catSelect = document.getElementById('activityCategorySelect');
            if (catSelect) catSelect.value = 'all';
            const tabBtns = document.querySelectorAll('.activity-tab-btn');
            tabBtns.forEach(b => {
                if (b.getAttribute('data-category') === 'all') b.classList.add('active');
                else b.classList.remove('active');
            });
            this.renderActivityLogs();
            this.openModal('modalActivityHistory');
        });

        // Activity Log Category Dropdown, Tabs & Search
        safeOn('activityCategorySelect', 'change', (e) => {
            this.activeActivityCategory = e.target.value || 'all';
            this.renderActivityLogs();
        });

        const actTabBtns = document.querySelectorAll('.activity-tab-btn');
        actTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                actTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeActivityCategory = btn.getAttribute('data-category') || 'all';
                const catSelect = document.getElementById('activityCategorySelect');
                if (catSelect) catSelect.value = this.activeActivityCategory;
                this.renderActivityLogs();
            });
        });

        safeOn('activitySearchInput', 'input', (e) => {
            this.activitySearchTerm = (e.target.value || '').trim().toLowerCase();
            const clearBtn = document.getElementById('clearActivitySearchBtn');
            if (clearBtn) clearBtn.style.display = this.activitySearchTerm ? 'block' : 'none';
            this.renderActivityLogs();
        });

        safeOn('clearActivitySearchBtn', 'click', () => {
            this.activitySearchTerm = '';
            const searchInput = document.getElementById('activitySearchInput');
            if (searchInput) searchInput.value = '';
            const clearBtn = document.getElementById('clearActivitySearchBtn');
            if (clearBtn) clearBtn.style.display = 'none';
            this.renderActivityLogs();
        });

        safeOn('soundToggleBtn', 'click', () => {
            const isEnabled = window.soundManager.toggle();
            const icon = document.getElementById('soundIcon');
            if (icon) {
                icon.setAttribute('data-lucide', isEnabled ? 'volume-2' : 'volume-x');
                if (window.lucide) window.lucide.createIcons();
            }
            this.showToast(isEnabled ? 'เปิดเสียงเอฟเฟกต์แล้ว' : 'ปิดเสียงแล้ว');
        });

        safeOn('appSettingsBtn', 'click', () => {
            if (this.currentUser !== 'nether') return;
            this.renderResetSection();
            this.updateFirebaseSettingsUI();
            this.populateSettingsRenameInputs();
            this.openModal('modalSettings');
        });

        safeOn('morningReportBtn', 'click', () => {
            this.openMorningReportModal();
        });

        // Cat Care Actions (Real-time inventory deduction & animation)
        safeOn('actWaterBtn', 'click', () => this.feedCatMainMeal());
        safeOn('actFertBtn', 'click', () => this.giveCatTreat());
        safeOn('actPestBtn', 'click', () => this.cureObstacles(true));
        safeOn('actWeedBtn', 'click', () => this.cureObstacles(false));

        safeOn('cureObstacleBtn', 'click', () => {
            const data = window.appStorage.getLocalData();
            if (data.cat && data.cat.hasFever) this.cureObstacles(true);
            else if (data.cat && data.cat.hasLongNails) this.cureObstacles(false);
        });

        // Sub Actions
        safeOn('openAdoptionModalBtn', 'click', () => {
            this.openCatAdoptionModal();
        });

        safeOn('confirmAdoptCatBtn', 'click', () => {
            this.confirmCatAdoption();
        });

        const openCatCatalogHandler = () => {
            this.renderCatCatalog();
            this.openModal('modalTreeCatalog');
        };
        safeOn('openTreeCatalogBtn', 'click', openCatCatalogHandler);
        safeOn('openCatCatalogFromHeroBtn', 'click', openCatCatalogHandler);
        safeOn('openCatCatalogFromAdoptionBtn', 'click', openCatCatalogHandler);
        document.addEventListener('click', (e) => {
            if (e.target && e.target.closest && e.target.closest('.open-cat-catalog-btn')) {
                openCatCatalogHandler();
            }
        });

        safeOn('openHarvestBtn', 'click', () => {
            this.checkAndOpenHarvestModal();
        });

        safeOn('openYearArchiveBtn', 'click', () => {
            this.renderYearCollection();
            this.openModal('modalYearArchive');
        });

        // Daily Checkin
        safeOn('dailyCheckinBtn', 'click', () => {
            this.performDailyCheckin();
        });

        // Meals Toggle
        safeOn('mealTabNether', 'click', () => {
            this.currentMealPartner = 'nether';
            this.updateMealPartnerTabs();
            this.renderMealsView();
            window.soundManager.playClick();
        });

        safeOn('mealTabPooja', 'click', () => {
            this.currentMealPartner = 'Pooja';
            this.updateMealPartnerTabs();
            this.renderMealsView();
            window.soundManager.playClick();
        });

        // Meal Edit Form
        safeOn('mealEditForm', 'submit', (e) => {
            e.preventDefault();
            const mealKey = document.getElementById('mealEditType')?.value;
            const foodName = document.getElementById('mealInputName')?.value?.trim() || '';
            const mealTime = document.getElementById('mealInputTime')?.value || '';
            this.saveMealData(mealKey, foodName, mealTime);
        });

        // Add Snack
        safeOn('openAddSnackBtn', 'click', () => {
            Swal.fire({
                title: 'เพิ่มมื้อย่อย / ของว่าง 🧋',
                input: 'text',
                inputPlaceholder: 'เช่น ชานมไข่มุก / ขนมปังปิ้ง',
                showCancelButton: true,
                confirmButtonText: 'เพิ่มรายการ',
                cancelButtonText: 'ยกเลิก'
            }).then((res) => {
                if (res.isConfirmed && res.value) {
                    const data = window.appStorage.getLocalData();
                    const todayStr = new Date().toISOString().split('T')[0];
                    if (!data.meals[todayStr]) data.meals[todayStr] = {};
                    if (!data.meals[todayStr][this.currentUser]) {
                        data.meals[todayStr][this.currentUser] = { breakfast: { eaten: false }, lunch: { eaten: false }, dinner: { eaten: false }, snacks: [] };
                    }
                    data.meals[todayStr][this.currentUser].snacks.push({
                        id: 'snack_' + Date.now(),
                        time: new Date().toTimeString().slice(0, 5),
                        name: res.value.trim()
                    });
                    data.users[this.currentUser].points += 10;

                    const me = data.users[this.currentUser];
                    if (!data.activityLogs) data.activityLogs = [];
                    data.activityLogs.unshift({
                        id: 'log_' + Date.now(),
                        userId: this.currentUser,
                        userName: me ? me.name : this.currentUser,
                        actionTitle: 'เพิ่มมื้อย่อย / ของว่าง 🧋',
                        detail: `ทาน: ${res.value.trim()} (+10 แต้ม)`,
                        category: 'meal',
                        timestamp: new Date().toISOString()
                    });

                    window.appStorage.saveLocalData(data);

                    // Real-time cross-browser notification to partner
                    window.appStorage.sendNotification({
                        type: 'MEAL',
                        title: `🧋 ${me.name} เพิ่มของว่าง`,
                        message: `ทาน: ${res.value.trim()}`,
                        sender: this.currentUser,
                        senderName: me.name
                    });

                    this.markQuestCompleted('q_meals');

                    window.soundManager.playSuccess();
                    this.showToast('เพิ่มรายการของว่างแล้ว (+10 แต้ม)');
                    this.renderMealsView();
                    this.renderQuestsView();
                    this.updateHeaderPoints();
                    if (typeof this.updateNavBadges === 'function') this.updateNavBadges();
                }
            });
        });

        // Notes Form
        safeOn('openNewNoteBtn', 'click', () => {
            this.openEditNoteModal(null);
        });

        safeOn('saveNoteBtn', 'click', (e) => {
            e.preventDefault();
            const noteId = document.getElementById('editNoteId')?.value;
            const title = document.getElementById('noteTitleInput')?.value?.trim() || '';
            const content = document.getElementById('noteContentInput')?.value?.trim() || '';
            const cat = document.getElementById('noteCategorySelect')?.value;
            const remind = document.getElementById('noteRemindTime')?.value;
            if (!title) {
                this.showToast('โปรดระบุหัวข้อบันทึก');
                return;
            }
            this.saveNote(noteId, title, content, cat, remind);
        });

        safeOn('newNoteForm', 'submit', (e) => {
            e.preventDefault();
            const noteId = document.getElementById('editNoteId')?.value;
            const title = document.getElementById('noteTitleInput')?.value?.trim() || '';
            const content = document.getElementById('noteContentInput')?.value?.trim() || '';
            const cat = document.getElementById('noteCategorySelect')?.value;
            const remind = document.getElementById('noteRemindTime')?.value;
            if (!title) {
                this.showToast('โปรดระบุหัวข้อบันทึก');
                return;
            }
            this.saveNote(noteId, title, content, cat, remind);
        });

        // Calendar Month Nav
        safeOn('calPrevMonthBtn', 'click', () => {
            this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
            this.renderCalendarView();
            window.soundManager.playClick();
        });

        safeOn('calNextMonthBtn', 'click', () => {
            this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
            this.renderCalendarView();
            window.soundManager.playClick();
        });

        // 8 Bedtime Mood Buttons
        const moodBtns = document.querySelectorAll('#moodBtnGroup .mood-btn');
        moodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                moodBtns.forEach(b => b.classList.remove('selected-mood'));
                btn.classList.add('selected-mood');
                this.selectedBedtimeMood = btn.getAttribute('data-mood');
                window.soundManager.playClick();
            });
        });

        safeOn('submitBedtimeMoodBtn', 'click', () => {
            const note = document.getElementById('bedtimeNoteInput')?.value || '';
            this.submitBedtimeMood(note);
        });

        // Chat
        safeOn('chatSendForm', 'submit', (e) => {
            e.preventDefault();
            const msgInput = document.getElementById('chatMessageInput');
            if (msgInput) this.sendChatMessage(msgInput.value);
        });

        // Chat Image Attachment
        safeOn('chatAttachBtn', 'click', () => {
            const fileInput = document.getElementById('chatImageInput');
            if (fileInput) fileInput.click();
        });

        safeOn('chatImageInput', 'change', async (e) => {
            const files = Array.from(e.target.files || []);
            if (files.length === 0) return;

            if (!this.pendingChatImages) this.pendingChatImages = [];
            const remainingSlots = Math.max(0, 6 - this.pendingChatImages.length);
            const toProcess = files.slice(0, remainingSlots);

            for (const file of toProcess) {
                if (!file.type.startsWith('image/')) continue;
                const compressed = await this.compressImageFile(file);
                if (compressed) {
                    this.pendingChatImages.push(compressed);
                }
            }

            e.target.value = '';
            this.renderChatImagePreviewTray();
        });

        const stickers = document.querySelectorAll('.quick-sticker');
        stickers.forEach(stk => {
            stk.addEventListener('click', () => {
                this.sendChatMessage(stk.getAttribute('data-text'));
            });
        });

        // Quiz
        safeOn('openNewQuizBtn', 'click', () => {
            const data = window.appStorage.getLocalData();
            const todayStr = new Date().toISOString().split('T')[0];
            const myTodayQuiz = data.quizzes && data.quizzes.find(q => q.date === todayStr && q.creator === this.currentUser);
            if (myTodayQuiz) {
                const partnerName = this.getPartnerName();
                const partnerId = this.currentUser === 'nether' ? 'Pooja' : 'nether';
                const isFinished = myTodayQuiz.completedBy && myTodayQuiz.completedBy.includes(partnerId);
                Swal.fire({
                    title: isFinished ? 'คุณตั้งคำถามวันนี้เสร็จสิ้นแล้ว 🎯' : 'คุณตั้งคำถามวันนี้ไปแล้ว 🎯',
                    text: isFinished
                        ? `${partnerName} ได้ตอบคำถามของคุณแล้ว สามารถตั้งคำถามใหม่ได้ในวันพรุ่งนี้`
                        : `คุณได้ตั้งคำถามสำหรับวันนี้แล้ว กำลังรอให้ ${partnerName} มาตอบนะจ๊ะ`,
                    icon: 'info'
                });
                return;
            }
            this.openModal('modalNewQuiz');
        });

        safeOn('openQuizHistoryBtn', 'click', () => {
            this.renderPastQuizHistory('all');
            this.openModal('modalQuizHistory');
        });

        const quizFilterBtns = document.querySelectorAll('.quiz-filter-btn');
        quizFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                quizFilterBtns.forEach(b => b.classList.remove('active-tab'));
                btn.classList.add('active-tab');
                this.renderPastQuizHistory(btn.getAttribute('data-filter') || 'all');
            });
        });

        safeOn('newQuizForm', 'submit', (e) => {
            e.preventDefault();
            const q = document.getElementById('quizQuestionInput')?.value?.trim() || '';
            const o1 = document.getElementById('quizOpt1')?.value?.trim() || '';
            const o2 = document.getElementById('quizOpt2')?.value?.trim() || '';
            const o3 = document.getElementById('quizOpt3')?.value?.trim() || '';
            const o4 = document.getElementById('quizOpt4')?.value?.trim() || '';
            const correctIdx = parseInt(document.getElementById('quizCorrectSelect')?.value || '0', 10);
            this.saveNewQuiz(q, [o1, o2, o3, o4], correctIdx);
        });

        // Harvest Form (Lucky Bell)
        safeOn('harvestForm', 'submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('harvestTitleInput')?.value?.trim() || '';
            const content = document.getElementById('harvestMsgInput')?.value?.trim() || '';
            this.submitHarvestPostit(title, content);
        });

        // Post-it Filter
        const filterBtns = document.querySelectorAll('.postit-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active-tab'));
                btn.classList.add('active-tab');
                this.renderPostitView(btn.getAttribute('data-year'));
            });
        });

        // Logout Button
        safeOn('logoutBtn', 'click', () => {
            this.closeModal('modalSettings');
            this.logout();
        });

        // Save Firebase Config
        safeOn('saveFirebaseConfigBtn', 'click', () => {
            const raw = document.getElementById('firebaseConfigInput')?.value?.trim() || '';
            if (!raw) {
                this.showToast('โปรดวาง Firebase Config JSON');
                return;
            }
            try {
                const parsed = JSON.parse(raw);
                const res = window.appStorage.saveFirebaseConfig(parsed);
                if (res.success) {
                    const statusBadge = document.getElementById('firebaseStatusBadge');
                    if (statusBadge) {
                        statusBadge.innerText = '🟢 Cloud Firestore Connected';
                        statusBadge.style.color = 'var(--accent-mint)';
                    }
                    this.showToast('เชื่อมต่อ Cloud Firestore สำเร็จ!');
                }
            } catch (err) {
                window.soundManager.playError();
                Swal.fire({ title: 'JSON ไม่ถูกต้อง', text: err.message, icon: 'error' });
            }
        });

        // ---------------------------------------------------------------------
        // New Features Event Bindings
        // ---------------------------------------------------------------------
        // 1. Play with Cat
        safeOn('openCatPlayBtn', 'click', () => this.openCatPlayModal());
        safeOn('startPlaySessionBtn', 'click', () => this.startPlaySession());
        safeOn('stopPlaySessionBtn', 'click', () => this.stopPlaySession());
        // 2. Monthly Bond Report
        safeOn('openMonthlyBondReportBtn', 'click', () => this.openMonthlyBondReportModal());

        // 3. Cat Collection & Breeding (Age Debug button deleted)
        safeOn('openCatCollectionBtn', 'click', () => this.openCatCollectionModal());
        safeOn('startCrossBreedBtn', 'click', () => this.startCrossBreeding());

        // 4. Player Rename (Dual-Partner Renaming)
        safeOn('saveUserNameBtn', 'click', () => this.saveBothUserNames());
        safeOn('saveBothUserNamesBtn', 'click', () => this.saveBothUserNames());

        // 5. Meal History (Automatic all-days archive)
        safeOn('viewMealHistoryBtn', 'click', () => this.openMealHistoryModal());

        const mealHistFilters = document.querySelectorAll('.meal-history-filter-btn');
        mealHistFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                mealHistFilters.forEach(b => b.classList.remove('active-tab'));
                btn.classList.add('active-tab');
                this.currentMealHistoryPartner = btn.getAttribute('data-partner');
                this.openMealHistoryModal();
            });
        });

        // 6. Clear Chat & Care History
        safeOn('clearChatAndCareBtn', 'click', () => this.handleClearChatAndCareHistory());

        // 7. Morning Report Confirmation Button
        safeOn('confirmMorningReportBtn', 'click', () => {
            this.closeModal('modalMorningReport');
            this.syncGardenState();
            const data = window.appStorage.getLocalData();
            const growthDay = data.cat?.growthDay || 1;
            this.showToast(`เริ่มต้นวันที่ ${growthDay} ไปด้วยกันนะ! 🐾✨`, '☀️');
        });

        // 8. Browser Real-Time Notifications
        safeOn('requestNotifPermissionBtn', 'click', () => this.requestBrowserNotificationPermission());
        safeOn('testBrowserNotifBtn', 'click', () => this.testBrowserNotification());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppController();
});

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
        const savedUserId = sessionStorage.getItem('lovetree_active_user');
        if (savedUserId && (savedUserId === 'nether' || savedUserId === 'Pooja')) {
            this.setLoggedInUser(savedUserId);
        } else {
            this.currentUser = null;
            sessionStorage.removeItem('lovetree_active_user');
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
        this.renderAll();
        this.checkMorningReport();

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
        window.appStorage.onDataChange(() => {
            this.renderAll();
            this.syncGardenState();
            this.updatePresenceUI();
        });

        // Nudge listener
        window.onPartnerNudgeReceived = (payload) => {
            if (payload.sender !== this.currentUser) {
                window.soundManager.playNudge('heartbeat');
                this.showFloatingHeart();
                Swal.fire({
                    title: `💖 ${payload.senderName} ส่งสัญญาณคิดถึง!`,
                    text: payload.message || 'ส่งหัวใจบอกว่าคิดถึงเธอสุดหัวใจนะ',
                    icon: 'info',
                    timer: 3500,
                    showConfirmButton: false,
                    backdrop: `rgba(255, 83, 118, 0.15)`
                });
            }
        };
    }

    startPresenceHeartbeat() {
        if (this.presenceInterval) clearInterval(this.presenceInterval);
        this.presenceInterval = setInterval(() => {
            if (this.currentUser) {
                window.appStorage.updatePresence(this.currentUser, true);
                this.updatePresenceUI();
            }
        }, 20000); // 20-second heartbeat
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

    updateHeaderUserInfo() {
        if (!this.currentUser || !window.appStorage) return;
        const data = window.appStorage.getLocalData();
        const me = data.users ? data.users[this.currentUser] : null;
        if (!me) return;

        const partnerId = this.currentUser === 'nether' ? 'Pooja' : 'nether';
        const partner = data.users ? data.users[partnerId] : null;

        const myBadge = document.getElementById('myAvatarBadge');
        if (myBadge) myBadge.innerText = me.avatar;

        const partnerBadge = document.getElementById('partnerAvatarBadge');
        if (partnerBadge && partner) partnerBadge.innerText = partner.avatar;

        const namesDisplay = document.getElementById('coupleNamesDisplay');
        if (namesDisplay && partner) namesDisplay.innerText = `${me.name} & ${partner.name}`;

        const pointsDisplay = document.getElementById('userPointsDisplay');
        if (pointsDisplay) pointsDisplay.innerText = me.points;

        this.currentMealPartner = this.currentUser;
        this.updateMealPartnerTabs();
    }

    navigateTo(viewId) {
        // Strict Auth Guard: If not logged in, force view-login and deny access to any inner screen
        if (!this.currentUser) {
            viewId = 'view-login';
        }

        if (this.currentView === viewId && document.getElementById(viewId)?.classList.contains('active-view')) {
            return;
        }

        const views = document.querySelectorAll('.view-section');
        views.forEach(v => v.classList.remove('active-view'));

        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active-view');
            this.currentView = viewId;
        }

        const navBtns = document.querySelectorAll('.nav-item-btn');
        navBtns.forEach(btn => {
            if (btn.getAttribute('data-target') === viewId) {
                btn.classList.add('active-nav');
            } else {
                btn.classList.remove('active-nav');
            }
        });

        if (viewId === 'view-garden' && this.garden3D) {
            setTimeout(() => this.garden3D.onResize(), 60);
        }

        window.scrollTo(0, 0);
        if (window.lucide) window.lucide.createIcons();
    }

    checkMorningReport() {
        const data = window.appStorage.getLocalData();
        if (!data.cat) return; // Guard: unadopted state

        const todayStr = new Date().toISOString().split('T')[0];
        const me = data.users[this.currentUser];

        if (me.morningReportViewedDate !== todayStr) {
            setTimeout(() => {
                this.openMorningReportModal();
                me.morningReportViewedDate = todayStr;
                window.appStorage.saveLocalData(data);
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

        const diff = cat.growthPercent - cat.yesterdayGrowthPercent;
        const sign = diff >= 0 ? `+${diff}%` : `${diff}%`;

        document.getElementById('reportCatName').innerText = cat.name;
        document.getElementById('reportYesterdayGrowth').innerText = `${cat.yesterdayGrowthPercent}%`;
        document.getElementById('reportTodayGrowth').innerText = `${cat.growthPercent}% (${sign})`;

        if (cat.hasFever || cat.hasLongNails) {
            document.getElementById('reportObstacleStatus').innerText = 'น้องแมวเริ่มซึมหรือขนรุงรัง ต้องการการดูแล 🩹';
            document.getElementById('reportObstacleStatus').style.color = '#E65100';
        } else {
            document.getElementById('reportObstacleStatus').innerText = 'สุขภาพดี ร่าเริงสดใส 100% ✨';
            document.getElementById('reportObstacleStatus').style.color = 'var(--accent-mint)';
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

        if (this.garden3D) {
            this.garden3D.buildCat(cat.breed, cat.growthPercent);
            this.garden3D.setSicknessState(cat.hasFever, cat.hasLongNails);
        }

        const catNameEl = document.getElementById('gardenCatName');
        if (catNameEl) catNameEl.innerText = `${cat.name}`;
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

        data.quests.forEach(q => {
            const isCompleted = me.lastCheckin === todayStr && q.category === 'checkin';
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
            card.innerHTML = `
                <div>
                    <div class="shop-item-top">
                        <span class="shop-item-icon">${item.id === 'main_food' ? '🐟' : item.id === 'creamy_treat' ? '💖' : item.id === 'vaccine' ? '💉' : '✂️'}</span>
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

        if (currentHour < 18) {
            submitBtn.disabled = true;
            timeNotice.innerText = `🔒 เปิดให้บันทึกตั้งแต่เวลา 18:00 น. เป็นต้นไป (ขณะนี้ ${currentHour}:00 น.)`;
            timeNotice.style.color = '#FFA726';
        } else {
            submitBtn.disabled = false;
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

        data.chatMessages.forEach(msg => {
            const isOutgoing = msg.sender === this.currentUser;
            const timeFormatted = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const wrap = document.createElement('div');
            wrap.className = `chat-bubble-wrap ${isOutgoing ? 'outgoing-bubble' : 'incoming-bubble'}`;
            wrap.innerHTML = `
                <div class="chat-bubble">${msg.text}</div>
                <div class="chat-meta-row">
                    <span>${msg.sender} • ${timeFormatted}</span>
                </div>
            `;
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
            if (q.completedBy && q.completedBy.includes('nether')) netherPoints += q.reward;
            if (q.completedBy && q.completedBy.includes('Pooja')) poojaPoints += q.reward;
        });

        document.getElementById('netherQuizScore').innerText = netherPoints;
        document.getElementById('poojaQuizScore').innerText = poojaPoints;

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

            const card = document.createElement('div');
            card.className = 'quiz-card';
            const optionsHtml = q.options.map((opt, idx) => `
                <button class="quiz-opt-btn" data-quiz-id="${q.id}" data-opt-idx="${idx}" ${hasAnswered ? 'disabled' : ''}>
                    ${idx + 1}. ${opt}
                </button>
            `).join('');

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 11px; font-weight: 700; color: var(--accent-coral);">
                        สร้างโดย ${q.creator === 'nether' ? 'Nether 👨‍💻' : 'Pooja 🌸'} (คำถามวันนี้)
                    </span>
                    <span class="tree-badge-pill" style="font-size: 10px;">รางวัล +${q.reward} แต้ม</span>
                </div>
                <h4 class="quiz-question-title">${q.question}</h4>
                <div class="quiz-options-list">${optionsHtml}</div>
                ${hasAnswered ? `
                    <div style="font-size: 12px; color: var(--accent-mint); font-weight: 700;">
                        ✅ คุณได้ตอบคำถามของวันนี้ไปแล้ว!
                    </div>
                ` : isCreatedByMe ? `
                    <div style="font-size: 11px; color: var(--text-muted);">
                        (นี่คือคำถามที่คุณสร้าง รอให้แฟนมาตอบ)
                    </div>
                ` : ''}
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
            card.innerHTML = `
                <div class="postit-pin"></div>
                <span class="lucky-number-badge">เลขนำโชค: ${p.luckyNumber || '77'}</span>
                <div class="postit-header">${p.title}</div>
                <div class="postit-content">${p.content}</div>
                <div class="postit-footer">
                    <span>${p.date}</span>
                    <span>โดย ${p.author}</span>
                </div>
            `;
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

    renderActivityLogs() {
        const data = window.appStorage.getLocalData();
        const container = document.getElementById('activityHistoryList');
        if (!container) return;
        container.innerHTML = '';

        const logs = data.activityLogs || [];
        if (logs.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">ยังไม่มีประวัติการกระทำ</div>`;
            return;
        }

        logs.forEach(log => {
            const dateObj = new Date(log.timestamp);
            const dateStr = dateObj.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

            const item = document.createElement('div');
            item.className = 'activity-log-item';
            item.innerHTML = `
                <div class="activity-log-header">
                    <span style="color: var(--accent-coral);">${log.userName}</span>
                    <span class="activity-log-time">${dateStr} เวลา ${timeStr} น.</span>
                </div>
                <div style="font-weight: 700; font-size: 12px; color: var(--text-primary);">${log.actionTitle}</div>
                <div class="activity-log-detail">${log.detail}</div>
            `;
            container.appendChild(item);
        });
    }

    renderCatCatalog() {
        const container = document.getElementById('catCatalogList');
        if (!container) return;
        container.innerHTML = '';
        const data = window.appStorage.getLocalData();
        const currentBreed = (data.cat && data.cat.breed) ? data.cat.breed : null;

        CAT_BREEDS.forEach(b => {
            const item = document.createElement('div');
            const isSelected = b.id === currentBreed;
            item.style.background = isSelected ? 'var(--card-tint-peach)' : 'var(--bg-surface)';
            item.style.border = isSelected ? '2px solid var(--accent-coral)' : '1px solid var(--border-light)';
            item.style.borderRadius = 'var(--radius-md)';
            item.style.padding = '12px 14px';
            item.style.cursor = 'pointer';

            const mainFood = b.mainFoodReq || '2 มื้อ/วัน 🐟';
            const treat = b.treatReq || '1 ซอง/วัน 💖';
            const growth = b.growthSpeed || 'ปกติ (+2% ต่อวัน) 📈';

            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="font-size: 14px; color: var(--text-primary);">${b.name}</strong>
                    ${isSelected ? `<span class="tree-badge-pill" style="font-size: 10px;">กำลังเลี้ยงอยู่</span>` : ''}
                </div>
                <p style="font-size: 11px; color: var(--text-secondary); margin-bottom: 6px;">${b.tagline}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10.5px; color: var(--text-muted);">
                    <span>🐟 อาหาร: ${mainFood}</span>
                    <span>💖 แมวเลีย: ${treat}</span>
                    <span>📈 เติบโต: ${growth}</span>
                    <span style="display: inline-flex; align-items: center; gap: 4px;">🎨 Post-it: <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background: ${b.postitColor}; border: 1px solid rgba(0,0,0,0.15);"></span> ${b.postitColor}</span>
                </div>
                <div style="margin-top: 6px; font-size: 11px; font-weight: 700; color: var(--accent-mint);">
                    🎁 ${b.specialBonus}
                </div>
            `;

            item.addEventListener('click', () => this.selectCatBreed(b.id));
            container.appendChild(item);
        });
    }

    openCatAdoptionModal() {
        const container = document.getElementById('adoptBreedGrid');
        if (!container) return;
        container.innerHTML = '';

        CAT_BREEDS.forEach((breed) => {
            const card = document.createElement('div');
            const isSelected = breed.id === (this.selectedAdoptBreed || 'orange_tabby');
            card.className = `cat-breed-card ${isSelected ? 'selected' : ''}`;
            card.setAttribute('data-breed-id', breed.id);

            card.innerHTML = `
                <div class="cat-breed-thumb">${breed.badge}</div>
                <div class="cat-breed-name">${breed.name}</div>
                <div class="cat-breed-tagline">${breed.tagline}</div>
                <div class="cat-breed-bonus">🎁 ${breed.specialBonus}</div>
            `;

            card.addEventListener('click', () => {
                this.selectedAdoptBreed = breed.id;
                const allCards = container.querySelectorAll('.cat-breed-card');
                allCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                window.soundManager.playClick();

                const input = document.getElementById('adoptCatNameInput');
                if (input && (!input.value || input.value.startsWith('น้อง'))) {
                    input.value = `น้อง${breed.name.split(' ')[0]}`;
                }

                // Live 3D preview
                if (this.garden3D) {
                    this.garden3D.buildCat(breed.id, 0);
                }
            });

            container.appendChild(card);
        });

        const defaultInput = document.getElementById('adoptCatNameInput');
        if (defaultInput && !defaultInput.value) {
            defaultInput.value = 'น้องส้มจี๊ด';
        }

        this.openModal('modalCatAdoption');
    }

    confirmCatAdoption() {
        if (!this.currentUser) {
            this.showToast('โปรดเข้าสู่ระบบก่อนรับเลี้ยงแมว');
            return;
        }

        const breedId = this.selectedAdoptBreed || 'orange_tabby';
        const nameInput = document.getElementById('adoptCatNameInput');
        const catName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'น้องส้มจี๊ด';

        if (!window.appStorage) {
            Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ระบบจัดเก็บข้อมูลไม่พร้อมใช้งาน', icon: 'error' });
            return;
        }

        window.appStorage.adoptCat(breedId, catName, this.currentUser);
        this.closeModal('modalCatAdoption');

        if (window.soundManager) window.soundManager.playReward();
        if (typeof confetti === 'function') {
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        }

        this.syncGardenState();
        this.renderAll();

        Swal.fire({
            title: `ยินดีต้อนรับ ${catName}! 🐾💖`,
            text: `คุณและแฟนได้รับเลี้ยงน้องแมวเรียบร้อยแล้ว ดูแลน้องด้วยกันทุกวันนะ!`,
            icon: 'success',
            confirmButtonText: 'เริ่มดูแลน้องเลย'
        });
    }

    // -------------------------------------------------------------------------
    // User Action Handlers (Feeding, Treats, Grooming, Vaccine)
    // -------------------------------------------------------------------------

    // 1. Feed Main Meal
    feedCatMainMeal() {
        const data = window.appStorage.getLocalData();
        if (!data.cat) {
            this.showToast('โปรดรับเลี้ยงน้องแมวก่อนเริ่มดูแลนะ 🐾');
            this.openCatAdoptionModal();
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

        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(this.currentUser, me.name, 'ให้อาหารหลักน้องแมว 🐟', 'ให้อาหารเปียกปลาแซลมอน เพิ่มความอิ่ม +25%');

        if (this.garden3D) this.garden3D.triggerFeedAnimation();

        this.showToast(`ให้อาหารหลักเรียบร้อย! 🐟 ความอิ่ม +25% (+15 แต้ม)`);
    }

    // 2. Give Creamy Treat
    giveCatTreat() {
        const data = window.appStorage.getLocalData();
        if (!data.cat) {
            this.showToast('โปรดรับเลี้ยงน้องแมวก่อนเริ่มดูแลนะ 🐾');
            this.openCatAdoptionModal();
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

        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(this.currentUser, me.name, 'ให้ขนมแมวเลีย 💖', 'ป้อนแมวเลียรสทูน่า เพิ่มความผูกพัน +30%');

        if (this.garden3D) this.garden3D.triggerTreatAnimation();

        this.showToast(`ป้อนแมวเลียสำเร็จ! 💖 ความสุขผูกพัน +30% (+20 แต้ม)`);
    }

    // 3. Cure Vaccine or Grooming
    cureObstacles(isVaccine) {
        const data = window.appStorage.getLocalData();
        if (!data.cat) {
            this.showToast('โปรดรับเลี้ยงน้องแมวก่อนเริ่มดูแลนะ 🐾');
            this.openCatAdoptionModal();
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

        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(this.currentUser, me.name, isVaccine ? 'พาไปฉีดวัคซีน 💉' : 'ตัดขนและตัดเล็บ ✂️', isVaccine ? 'รักษาไข้หวัด สุขภาพกลับมาเต็ม 100%' : 'ตัดเล็บแหลมและแปรงขนเรียบร้อย');

        if (this.garden3D) {
            if (isVaccine) {
                this.garden3D.triggerVaccineAnimation();
            } else {
                this.garden3D.triggerGroomingAnimation();
            }
            this.garden3D.setSicknessState(data.cat.hasFever, data.cat.hasLongNails);
        }

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

        if (me.lastCheckin === todayStr) {
            this.showToast('คุณเช็คอินไปแล้วสำหรับวันนี้ ✨');
            return;
        }

        me.lastCheckin = todayStr;
        me.streak += 1;
        me.points += 40;
        data.inventory.main_food += 1; // Free daily can

        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(this.currentUser, me.name, 'เช็คอินประจำวัน 📅', `เช็คอินความรักติดต่อกันวันที่ ${me.streak} (+40 แต้ม, อาหารฟรี 1 กระป๋อง)`);

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

        me.points -= item.cost;
        data.inventory[item.id] = (data.inventory[item.id] || 0) + 1;
        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(this.currentUser, me.name, `แลกซื้อ ${item.name}`, `ใช้ ${item.cost} แต้มความรัก`);

        window.soundManager.playSuccess();
        this.showToast(`แลกซื้อ ${item.name} สำเร็จ! เหลือแต้ม ${me.points} ⭐`);
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

        window.soundManager.playSuccess();
        this.closeModal('modalEditMeal');
        this.showToast(`อัปเดตมื้ออาหารเรียบร้อยแล้ว (+15 แต้ม)`);
    }

    deleteSnack(snackId) {
        const data = window.appStorage.getLocalData();
        const todayStr = new Date().toISOString().split('T')[0];
        if (data.meals[todayStr] && data.meals[todayStr][this.currentUser]) {
            data.meals[todayStr][this.currentUser].snacks = data.meals[todayStr][this.currentUser].snacks.filter(s => s.id !== snackId);
            window.appStorage.saveLocalData(data);
            this.showToast('ลบรายการของว่างแล้ว');
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
        if (noteId) {
            const note = data.notes.find(n => n.id === noteId);
            if (note) {
                note.title = title;
                note.content = content;
                note.category = category;
                note.remindAt = remindAt;
                note.updatedBy = this.currentUser;
                note.updatedAt = new Date().toISOString();
                window.appStorage.logActivity(this.currentUser, data.users[this.currentUser].name, 'แก้ไขโน้ต', `แก้ไข: ${title}`);
            }
        } else {
            const newNote = {
                id: 'note_' + Date.now(),
                title: title,
                content: content,
                category: category,
                remindAt: remindAt,
                updatedBy: this.currentUser,
                updatedAt: new Date().toISOString()
            };
            data.notes.unshift(newNote);
            data.users[this.currentUser].points += 20;
            window.appStorage.logActivity(this.currentUser, data.users[this.currentUser].name, 'สร้างโน้ตใหม่', `สร้าง: ${title}`);
        }
        window.appStorage.saveLocalData(data);
        window.soundManager.playSuccess();
        this.closeModal('modalNewNote');
        this.showToast('บันทึกข้อมูลโน้ตสำเร็จ');
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
                data.notes = data.notes.filter(n => n.id !== noteId);
                window.appStorage.saveLocalData(data);
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

        window.soundManager.playReward();
        if (typeof confetti === 'function') confetti({ particleCount: 60, spread: 50 });

        document.getElementById('bedtimeNoteInput').value = '';

        Swal.fire({
            title: 'ส่งความรู้สึกบอกฝันดีสำเร็จ 🌙',
            text: 'บันทึกลงปฏิทินเรียบร้อยแล้ว หลับฝันดีนะที่รัก (+60 แต้ม)',
            icon: 'success'
        });
    }

    // 9. Chat Message
    sendChatMessage(text) {
        if (!text.trim()) return;
        const data = window.appStorage.getLocalData();
        data.chatMessages.push({
            id: 'msg_' + Date.now(),
            sender: this.currentUser,
            text: text.trim(),
            timestamp: new Date().toISOString()
        });
        data.users[this.currentUser].points += 2;
        window.appStorage.saveLocalData(data);
        window.soundManager.playMessage(false);
        document.getElementById('chatMessageInput').value = '';
    }

    // 10. Quiz (Daily 1-Question Limit)
    answerQuiz(quiz, optIdx, buttonElement) {
        if (quiz.completedBy && quiz.completedBy.includes(this.currentUser)) return;

        const isCorrect = optIdx === quiz.correctIndex;
        if (isCorrect) {
            buttonElement.classList.add('correct-choice');
            window.soundManager.playReward();
            if (typeof confetti === 'function') confetti({ particleCount: 50, spread: 45 });

            const data = window.appStorage.getLocalData();
            const target = data.quizzes.find(q => q.id === quiz.id);
            if (target) {
                if (!target.completedBy) target.completedBy = [];
                target.completedBy.push(this.currentUser);
                data.users[this.currentUser].points += quiz.reward;
                window.appStorage.saveLocalData(data);
                window.appStorage.logActivity(this.currentUser, data.users[this.currentUser].name, 'ตอบควิซประจำวันถูกต้อง 🎯', `รับรางวัล +${quiz.reward} แต้ม`);
            }

            Swal.fire({
                title: 'ตอบถูกต้องนะค้าบ! 🎉',
                text: `รู้ใจแฟนที่สุด! รับแต้มสะสม +${quiz.reward} แต้ม`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            buttonElement.classList.add('wrong-choice');
            window.soundManager.playError();
            this.showToast('ยังไม่ถูกต้องน้า ลองนึกดูดีๆ อีกที!');
        }
    }

    saveNewQuiz(question, opts, correctIdx) {
        const data = window.appStorage.getLocalData();
        const todayStr = new Date().toISOString().split('T')[0];

        // Check if question already created today
        const hasTodayQuiz = data.quizzes.some(q => q.date === todayStr && q.creator === this.currentUser);
        if (hasTodayQuiz) {
            Swal.fire({
                title: 'จำกัดวันละ 1 ข้อ ⚠️',
                text: 'คุณได้ตั้งคำถามสำหรับวันนี้ไปแล้ว สามารถตั้งคำถามใหม่ได้ในวันถัดไปนะ',
                icon: 'warning'
            });
            return;
        }

        // Archive previous quizzes if new day
        if (data.quizzes.length > 0) {
            data.quizzes.forEach(q => {
                if (q.date !== todayStr) data.pastQuizzes.unshift(q);
            });
            data.quizzes = data.quizzes.filter(q => q.date === todayStr);
        }

        const newQuiz = {
            id: 'quiz_' + Date.now(),
            creator: this.currentUser,
            date: todayStr,
            question: question,
            options: opts,
            correctIndex: correctIdx,
            reward: 50,
            completedBy: []
        };

        data.quizzes.unshift(newQuiz);
        data.users[this.currentUser].points += 30;
        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(this.currentUser, data.users[this.currentUser].name, 'ตั้งคำถามประจำวัน 🎯', `คำถาม: ${question}`);

        window.soundManager.playSuccess();
        this.closeModal('modalNewQuiz');
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

        // Random Lucky Number between 00 and 99
        const luckyNum = String(Math.floor(Math.random() * 100)).padStart(2, '0');

        const newPostit = {
            id: 'postit_' + Date.now(),
            author: this.currentUser,
            color: breed.postitColor, // Fixed by breed
            luckyNumber: luckyNum,
            year: new Date().getFullYear(),
            month: new Date().toLocaleDateString('th-TH', { month: 'long' }),
            title: title,
            content: message,
            date: new Date().toISOString().split('T')[0]
        };

        data.postits.unshift(newPostit);
        data.users[this.currentUser].points += 100;
        window.appStorage.saveLocalData(data);
        window.appStorage.logActivity(this.currentUser, data.users[this.currentUser].name, 'รับลูกแก้วให้โชค 🔮', `เขียนคำอวยพรและได้รับเลขนำโชค: ${luckyNum}`);

        this.closeModal('modalHarvest');
        window.soundManager.playReward();
        if (typeof confetti === 'function') confetti({ particleCount: 80, spread: 70 });

        Swal.fire({
            title: `เลขนำโชคของคุณคือ: ${luckyNum} 🌟`,
            text: `เก็บเกี่ยวดาวนำโชคสำเร็จ! แปะคำอวยพรลงบนกำแพงความทรงจำแล้ว (+100 แต้ม)`,
            icon: 'success'
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
        this.showFloatingHeart();

        window.appStorage.sendNudgeBroadcast({
            sender: this.currentUser,
            senderName: me.name,
            target: partnerId,
            message: `${me.name} กดส่งหัวใจบอกว่าคิดถึงเธอสุดหัวใจนะ 💖`
        });

        window.appStorage.logActivity(this.currentUser, me.name, 'ส่งสัญญาณคิดถึง 💖', `สะกิดบอก ${partner.name} ว่าคิดถึง`);
        this.showToast(`ส่งสัญญาณบอก ${partner.name} แล้วว่าคิดถึง! 💖`);
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
            window.soundManager.playClick();
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('open');
    }

    updateMealPartnerTabs() {
        const tabNether = document.getElementById('mealTabNether');
        const tabPooja = document.getElementById('mealTabPooja');

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
    // Event Bindings
    // -------------------------------------------------------------------------
    bindEvents() {
        // Login Form (Case-insensitive user ID check & password validation)
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('loginId').value.trim();
            const pass = document.getElementById('loginPass').value.trim();

            const passErr = document.getElementById('passErrorMsg');
            passErr.classList.remove('show');

            const idLower = id.toLowerCase();
            if (idLower === 'nether' && pass === 'nether28') {
                if (window.soundManager) window.soundManager.playSuccess();
                this.setLoggedInUser('nether');
            } else if (idLower === 'pooja' && (pass === 'Poo_0001' || pass === 'poo_0001')) {
                if (window.soundManager) window.soundManager.playSuccess();
                this.setLoggedInUser('Pooja');
            } else {
                if (window.soundManager) window.soundManager.playError();
                passErr.innerText = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง โปรดตรวจสอบอีกครั้ง';
                passErr.classList.add('show');
            }
        });

        // Welcome Manual / Help Button
        const manualBtn = document.getElementById('openWelcomeManualBtn');
        if (manualBtn) {
            manualBtn.addEventListener('click', () => {
                this.openWelcomeManual(0);
            });
        }

        // Welcome Manual Navigation Handlers
        const manualPrevBtn = document.getElementById('manualPrevBtn');
        if (manualPrevBtn) {
            manualPrevBtn.addEventListener('click', () => {
                if (this.currentManualStep > 0) {
                    this.currentManualStep--;
                    this.updateManualSlide();
                    window.soundManager.playClick();
                }
            });
        }

        const manualNextBtn = document.getElementById('manualNextBtn');
        if (manualNextBtn) {
            manualNextBtn.addEventListener('click', () => {
                const slides = document.querySelectorAll('.manual-slide-card');
                if (this.currentManualStep < slides.length - 1) {
                    this.currentManualStep++;
                    this.updateManualSlide();
                    window.soundManager.playClick();
                }
            });
        }

        const manualFinishBtn = document.getElementById('manualFinishBtn');
        if (manualFinishBtn) {
            manualFinishBtn.addEventListener('click', () => {
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
        }

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
        document.getElementById('headerPointsBtn').addEventListener('click', () => {
            this.navigateTo('view-quests');
        });

        document.getElementById('sendNudgeBtn').addEventListener('click', () => {
            this.sendMissYouNudge();
        });

        document.getElementById('openActivityLogBtn').addEventListener('click', () => {
            this.renderActivityLogs();
            this.openModal('modalActivityHistory');
        });

        document.getElementById('soundToggleBtn').addEventListener('click', () => {
            const isEnabled = window.soundManager.toggle();
            const icon = document.getElementById('soundIcon');
            icon.setAttribute('data-lucide', isEnabled ? 'volume-2' : 'volume-x');
            if (window.lucide) window.lucide.createIcons();
            this.showToast(isEnabled ? 'เปิดเสียงเอฟเฟกต์แล้ว' : 'ปิดเสียงแล้ว');
        });

        document.getElementById('appSettingsBtn').addEventListener('click', () => {
            this.renderResetSection();
            this.updateFirebaseSettingsUI();
            this.openModal('modalSettings');
        });

        document.getElementById('morningReportBtn').addEventListener('click', () => {
            this.openMorningReportModal();
        });

        // Cat Care Actions (Real-time inventory deduction & animation)
        document.getElementById('actWaterBtn').addEventListener('click', () => this.feedCatMainMeal());
        document.getElementById('actFertBtn').addEventListener('click', () => this.giveCatTreat());
        document.getElementById('actPestBtn').addEventListener('click', () => this.cureObstacles(true));
        document.getElementById('actWeedBtn').addEventListener('click', () => this.cureObstacles(false));

        document.getElementById('cureObstacleBtn').addEventListener('click', () => {
            const data = window.appStorage.getLocalData();
            if (data.cat.hasFever) this.cureObstacles(true);
            else if (data.cat.hasLongNails) this.cureObstacles(false);
        });

        // Sub Actions
        const openAdoptBtn = document.getElementById('openAdoptionModalBtn');
        if (openAdoptBtn) {
            openAdoptBtn.addEventListener('click', () => {
                this.openCatAdoptionModal();
            });
        }

        const confirmAdoptBtn = document.getElementById('confirmAdoptCatBtn');
        if (confirmAdoptBtn) {
            confirmAdoptBtn.addEventListener('click', () => {
                this.confirmCatAdoption();
            });
        }

        document.getElementById('openTreeCatalogBtn').addEventListener('click', () => {
            this.renderCatCatalog();
            this.openModal('modalTreeCatalog');
        });

        document.getElementById('openHarvestBtn').addEventListener('click', () => {
            this.checkAndOpenHarvestModal();
        });

        document.getElementById('openYearArchiveBtn').addEventListener('click', () => {
            this.openModal('modalYearArchive');
        });

        // Daily Checkin
        document.getElementById('dailyCheckinBtn').addEventListener('click', () => {
            this.performDailyCheckin();
        });

        // Meals Toggle
        document.getElementById('mealTabNether').addEventListener('click', () => {
            this.currentMealPartner = 'nether';
            this.updateMealPartnerTabs();
            this.renderMealsView();
            window.soundManager.playClick();
        });

        document.getElementById('mealTabPooja').addEventListener('click', () => {
            this.currentMealPartner = 'Pooja';
            this.updateMealPartnerTabs();
            this.renderMealsView();
            window.soundManager.playClick();
        });

        // Meal Edit Form
        document.getElementById('mealEditForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const mealKey = document.getElementById('mealEditType').value;
            const foodName = document.getElementById('mealInputName').value.trim();
            const mealTime = document.getElementById('mealInputTime').value;
            this.saveMealData(mealKey, foodName, mealTime);
        });

        // Add Snack
        document.getElementById('openAddSnackBtn').addEventListener('click', () => {
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
                    window.appStorage.saveLocalData(data);
                    window.soundManager.playSuccess();
                    this.showToast('เพิ่มรายการของว่างแล้ว (+10 แต้ม)');
                }
            });
        });

        // Notes Form
        document.getElementById('openNewNoteBtn').addEventListener('click', () => {
            this.openEditNoteModal(null);
        });

        document.getElementById('newNoteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const noteId = document.getElementById('editNoteId').value;
            const title = document.getElementById('noteTitleInput').value.trim();
            const content = document.getElementById('noteContentInput').value.trim();
            const cat = document.getElementById('noteCategorySelect').value;
            const remind = document.getElementById('noteRemindTime').value;
            this.saveNote(noteId, title, content, cat, remind);
        });

        // Calendar Month Nav
        document.getElementById('calPrevMonthBtn').addEventListener('click', () => {
            this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
            this.renderCalendarView();
            window.soundManager.playClick();
        });

        document.getElementById('calNextMonthBtn').addEventListener('click', () => {
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

        document.getElementById('submitBedtimeMoodBtn').addEventListener('click', () => {
            const note = document.getElementById('bedtimeNoteInput').value;
            this.submitBedtimeMood(note);
        });

        // Chat
        document.getElementById('chatSendForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const msgInput = document.getElementById('chatMessageInput');
            this.sendChatMessage(msgInput.value);
        });

        const stickers = document.querySelectorAll('.quick-sticker');
        stickers.forEach(stk => {
            stk.addEventListener('click', () => {
                this.sendChatMessage(stk.getAttribute('data-text'));
            });
        });

        // Quiz
        document.getElementById('openNewQuizBtn').addEventListener('click', () => {
            this.openModal('modalNewQuiz');
        });

        document.getElementById('openQuizHistoryBtn').addEventListener('click', () => {
            this.openModal('modalQuizHistory');
        });

        document.getElementById('newQuizForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const q = document.getElementById('quizQuestionInput').value.trim();
            const o1 = document.getElementById('quizOpt1').value.trim();
            const o2 = document.getElementById('quizOpt2').value.trim();
            const o3 = document.getElementById('quizOpt3').value.trim();
            const o4 = document.getElementById('quizOpt4').value.trim();
            const correctIdx = parseInt(document.getElementById('quizCorrectSelect').value, 10);
            this.saveNewQuiz(q, [o1, o2, o3, o4], correctIdx);
        });

        // Harvest Form (Lucky Bell)
        document.getElementById('harvestForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('harvestTitleInput').value.trim();
            const content = document.getElementById('harvestMsgInput').value.trim();
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
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.closeModal('modalSettings');
            this.logout();
        });

        // Save Firebase Config
        document.getElementById('saveFirebaseConfigBtn').addEventListener('click', () => {
            const raw = document.getElementById('firebaseConfigInput').value.trim();
            if (!raw) {
                this.showToast('โปรดวาง Firebase Config JSON');
                return;
            }
            try {
                const parsed = JSON.parse(raw);
                const res = window.appStorage.saveFirebaseConfig(parsed);
                if (res.success) {
                    document.getElementById('firebaseStatusBadge').innerText = '🟢 Cloud Firestore Connected';
                    document.getElementById('firebaseStatusBadge').style.color = 'var(--accent-mint)';
                    this.showToast('เชื่อมต่อ Cloud Firestore สำเร็จ!');
                }
            } catch (err) {
                window.soundManager.playError();
                Swal.fire({ title: 'JSON ไม่ถูกต้อง', text: err.message, icon: 'error' });
            }
        });

        // Close Modals
        const closeBtns = document.querySelectorAll('[data-close]');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal(btn.getAttribute('data-close'));
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppController();
});

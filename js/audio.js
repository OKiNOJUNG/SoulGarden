// Audio & Multimodal Feedback Module (Web Audio API Synthesizer)
// Provides instant high-fidelity audio feedback, UI sound effects,
// and procedural breed-specific cat vocalizations without external audio files.

const BREED_SOUND_PROFILES = {
    orange_tabby: {
        name: 'แมวส้มจอมซน',
        baseFreq: 620, peakFreq: 1040, endFreq: 640, duration: 0.42,
        wave: 'sine', nasal: 0.18, vibratoFreq: 6.5, vibratoDepth: 22,
        purrFreq: 28, description: 'เสียงเหมียวร่าเริง สดใส มีชีวิตชีวา'
    },
    siamese: {
        name: 'แมววิเชียรมาศ',
        baseFreq: 740, peakFreq: 1260, endFreq: 540, duration: 0.54,
        wave: 'sawtooth', nasal: 0.48, vibratoFreq: 8.0, vibratoDepth: 35,
        purrFreq: 32, description: 'เสียงแหลมพูดเก่ง ก้องกังวาน เป็นเอกลักษณ์'
    },
    khao_manee: {
        name: 'แมวขาวมณี',
        baseFreq: 820, peakFreq: 1180, endFreq: 760, duration: 0.38,
        wave: 'sine', nasal: 0.08, vibratoFreq: 5.5, vibratoDepth: 16,
        shimmer: true, purrFreq: 30, description: 'เสียงหวานใสกังวาน ละมุนละไม'
    },
    british_shorthair: {
        name: 'บริติช ช็อตแฮร์',
        baseFreq: 420, peakFreq: 660, endFreq: 440, duration: 0.48,
        wave: 'sine', nasal: 0.06, vibratoFreq: 4.2, vibratoDepth: 14,
        purrFreq: 24, description: 'เสียงนุ่ม ทุ้ม สุภาพ เรียบร้อย อบอุ่น'
    },
    persian: {
        name: 'เปอร์เซีย',
        baseFreq: 520, peakFreq: 710, endFreq: 480, duration: 0.36,
        wave: 'triangle', nasal: 0.14, vibratoFreq: 5.0, vibratoDepth: 18,
        whisper: true, purrFreq: 26, description: 'เสียงกระซิบแผ่วเบา นุ่มฟู อ่อนโยน'
    },
    scottish_fold: {
        name: 'สก็อตติช โฟลด์',
        baseFreq: 890, peakFreq: 1440, endFreq: 820, duration: 0.32,
        wave: 'sine', nasal: 0.12, vibratoFreq: 7.2, vibratoDepth: 25,
        squeak: true, purrFreq: 34, description: 'เสียงร้องแง้วแบบลูกแมวตัวน้อย น่าเอ็นดู'
    },
    ragdoll: {
        name: 'แร็กดอลล์',
        baseFreq: 560, peakFreq: 920, endFreq: 510, duration: 0.60,
        wave: 'sine', nasal: 0.16, vibratoFreq: 5.2, vibratoDepth: 20,
        purrTail: true, purrFreq: 26, description: 'เสียงอ้อนหวาน ลากเสียงยาว พร้อมเสียงเพอร์'
    },
    sphynx: {
        name: 'สฟิงซ์',
        baseFreq: 980, peakFreq: 1420, endFreq: 910, duration: 0.29,
        wave: 'triangle', nasal: 0.25, vibratoFreq: 9.0, vibratoDepth: 30,
        chirp: true, purrFreq: 36, description: 'เสียงจิ๊บๆ แหลมสั้น แปลกใหม่ ขี้เล่น'
    },
    maine_coon: {
        name: 'เมนคูน',
        baseFreq: 480, peakFreq: 790, endFreq: 520, duration: 0.46,
        wave: 'sawtooth', nasal: 0.22, vibratoFreq: 16.0, vibratoDepth: 45,
        trill: true, purrFreq: 22, description: 'เสียงเจื้อยแจ้ว คล้ายเสียงนก (Trill)'
    },
    bengal: {
        name: 'เบงกอล',
        baseFreq: 530, peakFreq: 960, endFreq: 510, duration: 0.46,
        wave: 'sawtooth', nasal: 0.32, vibratoFreq: 6.8, vibratoDepth: 28,
        raspy: true, purrFreq: 28, description: 'เสียงสากทรงพลัง ขี้เล่น สไตล์เสือดาวน้อย'
    }
};

class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.lastRotateSoundTime = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // -------------------------------------------------------------------------
    // 1. Procedural Cat Vocalization Synthesizer (10 Breeds & Interactions)
    // -------------------------------------------------------------------------

    // Main Breed-Specific Meow (Click / Tap on Cat)
    playCatMeow(breedId = 'orange_tabby', mood = 'happy') {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const profile = BREED_SOUND_PROFILES[breedId] || BREED_SOUND_PROFILES.orange_tabby;
        const now = this.ctx.currentTime;
        const dur = profile.duration;

        // Main vocal tract oscillator
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = profile.wave;

        // Frequency envelope (meow curve: consonant -> rise -> open vowel -> fall)
        const base = profile.baseFreq;
        const peak = profile.peakFreq * (mood === 'excited' ? 1.15 : 1.0);
        const end = profile.endFreq;

        osc.frequency.setValueAtTime(base, now);
        osc.frequency.exponentialRampToValueAtTime(peak, now + dur * 0.38);
        osc.frequency.exponentialRampToValueAtTime(end, now + dur);

        // Formant filter (simulating cat mouth / vocal tract resonance)
        const formant = this.ctx.createBiquadFilter();
        formant.type = 'bandpass';
        formant.frequency.setValueAtTime(1400, now);
        formant.frequency.exponentialRampToValueAtTime(2200, now + dur * 0.4);
        formant.frequency.exponentialRampToValueAtTime(1200, now + dur);
        formant.Q.setValueAtTime(3.5, now);

        // Vibrato / Trill LFO
        if (profile.vibratoFreq) {
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.setValueAtTime(profile.vibratoFreq, now);
            lfoGain.gain.setValueAtTime(profile.vibratoDepth, now);
            lfo.connect(osc.frequency);
            lfo.start(now);
            lfo.stop(now + dur);
        }

        // Amplitude Envelope (attack, sustain, cute tail)
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.24, now + dur * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.18, now + dur * 0.65);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(formant);
        formant.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + dur);

        // If breed has purr tail, add soft purr
        if (profile.purrTail || mood === 'purr') {
            this.playCatPurr(breedId, 0.4, now + dur * 0.5);
        }

        this.vibrate([20, 25, 40]);
    }

    // Petting / Head Rubbing Interaction (Warm Purr + Tender Squeak)
    playCatPet(breedId = 'orange_tabby') {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const profile = BREED_SOUND_PROFILES[breedId] || BREED_SOUND_PROFILES.orange_tabby;
        const now = this.ctx.currentTime;

        // Quick upward tender chirp
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(profile.baseFreq * 1.2, now);
        osc.frequency.exponentialRampToValueAtTime(profile.peakFreq * 1.1, now + 0.14);
        osc.frequency.exponentialRampToValueAtTime(profile.endFreq * 1.1, now + 0.28);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.16, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);

        // Accompanying cozy purr
        this.playCatPurr(breedId, 0.7, now + 0.05);
        this.vibrate([30, 20, 30, 20, 40]);
    }

    // Continuous or pulsed Purring sound
    playCatPurr(breedId = 'orange_tabby', duration = 0.8, startTime = null) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const profile = BREED_SOUND_PROFILES[breedId] || BREED_SOUND_PROFILES.orange_tabby;
        const now = startTime !== null ? startTime : this.ctx.currentTime;
        const purrRate = profile.purrFreq || 28;

        // Low frequency motor oscillator
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(purrRate, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(160, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.1);
        gain.gain.setValueAtTime(0.11, now + duration - 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
    }

    // 3D Model Rotation Murmur (Gentle curious chirp, throttled to avoid noise)
    playCatRotate(breedId = 'orange_tabby') {
        const now = Date.now();
        if (now - this.lastRotateSoundTime < 1800) return; // At most once every 1.8 seconds
        this.lastRotateSoundTime = now;

        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const profile = BREED_SOUND_PROFILES[breedId] || BREED_SOUND_PROFILES.orange_tabby;
        const t = this.ctx.currentTime;

        // Curious upward micro-chirp
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(profile.baseFreq * 0.9, t);
        osc.frequency.exponentialRampToValueAtTime(profile.peakFreq * 0.95, t + 0.12);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.exponentialRampToValueAtTime(0.10, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
    }

    // Feeding Main Meal Action (Fish / Salmon Munching + Joyful Meal Meow)
    playCatEat(breedId = 'orange_tabby') {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // 3 Cute munching "nom-nom-nom" sounds
        [0, 0.14, 0.28].forEach((offset, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const f = 450 + (idx % 2) * 80;
            osc.frequency.setValueAtTime(f, now + offset);
            osc.frequency.exponentialRampToValueAtTime(220, now + offset + 0.07);

            gain.gain.setValueAtTime(0.15, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + offset);
            osc.stop(now + offset + 0.08);
        });

        // Contented meow right after finishing
        setTimeout(() => {
            this.playCatMeow(breedId, 'happy');
        }, 360);

        this.vibrate([25, 40, 25, 40, 50]);
    }

    // Creamy Treat Action (Licking smack + Eager High Chirp)
    playCatTreat(breedId = 'orange_tabby') {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Licking / Slurping high-frequency pop
        [0, 0.12, 0.24].forEach((offset) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now + offset);
            osc.frequency.exponentialRampToValueAtTime(1400, now + offset + 0.06);

            gain.gain.setValueAtTime(0.12, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + offset);
            osc.stop(now + offset + 0.07);
        });

        // Joyful excited meow
        setTimeout(() => {
            this.playCatMeow(breedId, 'excited');
        }, 300);

        this.vibrate([35, 30, 35, 30, 80]);
    }

    // Vaccine Shot Action (Quick startle squeak + Relieved sparkling bell)
    playCatVaccine(breedId = 'orange_tabby') {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Tiny startle squeak
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(1300, now + 0.06);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.14);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);

        // Relieved recovery bell chord
        setTimeout(() => {
            this.playSuccess();
        }, 180);

        this.vibrate([70, 40, 100]);
    }

    // Grooming & Nails Trimming (Snip/brush swoosh + Luxurious purr)
    playCatGroom(breedId = 'orange_tabby') {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Snip sound
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(3200, now + 0.04);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);

        // Long relaxing purr
        this.playCatPurr(breedId, 1.2, now + 0.1);
        this.vibrate([20, 20, 20, 20, 50]);
    }

    // -------------------------------------------------------------------------
    // 2. Application UI Sound Effects
    // -------------------------------------------------------------------------

    // Gentle tactile click
    playClick() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    // Water droplet sound
    playWater() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        [0, 0.08, 0.16].forEach((delay, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const baseFreq = 800 + i * 150;
            osc.frequency.setValueAtTime(baseFreq, now + delay);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + delay + 0.08);

            gain.gain.setValueAtTime(0.18, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.09);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.09);
        });
        this.vibrate([30, 20, 30]);
    }

    // Fertilizer sparkle chord
    playFertilize() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);

            gain.gain.setValueAtTime(0.15, now + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.35);
        });
        this.vibrate([40, 40, 60]);
    }

    // Pest / Herbicide Spray swoosh
    playSpray() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.18;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.18);
        filter.Q.value = 3;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.20, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        this.vibrate(50);
    }

    // Heartbeat / Miss-you Nudge
    playNudge(type = 'heartbeat') {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        if (type === 'heartbeat') {
            [0, 0.15].forEach((delay) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(95, now + delay);
                osc.frequency.exponentialRampToValueAtTime(45, now + delay + 0.12);
                gain.gain.setValueAtTime(0.35, now + delay);
                gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.13);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + delay);
                osc.stop(now + delay + 0.13);
            });
            this.vibrate([100, 80, 150]);
        }
    }

    // Quest / Check-in Reward Fanfare
    playReward() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [392, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
        notes.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now + i * 0.07);
            gain.gain.setValueAtTime(0.2, now + i * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.07);
            osc.stop(now + i * 0.07 + 0.4);
        });
        this.vibrate([50, 30, 80, 50, 150]);
    }

    // Success Chime
    playSuccess() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        [587.33, 880].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + i * 0.1);
            gain.gain.setValueAtTime(0.18, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.4);
        });
        this.vibrate(50);
    }

    // Error Alert
    playError() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        [280, 220].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, now + i * 0.12);
            gain.gain.setValueAtTime(0.12, now + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.15);
        });
        this.vibrate([80, 50, 80]);
    }

    // Message sent / received pop
    playMessage(incoming = false) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const startFreq = incoming ? 440 : 660;
        const endFreq = incoming ? 880 : 770;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        this.vibrate(30);
    }

    // Haptic vibration helper
    vibrate(pattern) {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                // Ignore if not permitted
            }
        }
    }
}

window.soundManager = new SoundManager();

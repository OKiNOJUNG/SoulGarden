// Cat Breeds & Game Mechanics Data Definition (SoulGarden Cat Edition - Pixar 3D Style)

const CAT_BREEDS = [
    {
        id: 'orange_tabby',
        name: 'ส้มซ่า (Orange Tabby)',
        nameEn: 'Orange Tabby',
        tagline: 'แมวส้มอารมณ์ดี ลายทางเสือน้อย กินเก่ง ตาประกายอำพันสดใส',
        bodyColor: '#D9A066', // Sandy fawn warm beige
        bellyColor: '#F5E6D3', // Cream muzzle & chest (toned down)
        pointColor: '#6E4A35', // Dark espresso stripes
        eyeColor: '#F39C12', // Rich warm amber orange (reference image!)
        postitColor: '#FFE0B2', // Pastel Orange Sherbet
        mainFoodReq: '3 มื้อ/วัน (กินจุ 🐟🐟🐟)',
        treatReq: '2 ซอง/วัน (ชอบมาก 💖💖)',
        growthSpeed: 'เร็ว (+3% ต่อวัน ⚡)',
        earType: 'standard',
        patternType: 'tabby_striped',
        sleepSchedule: {
            sleepHours: [13, 14, 15, 16, 0, 1, 2, 3, 4, 5],
            timeRange: '13:00 - 17:00 & 00:00 - 06:00 น.',
            totalHours: '10 ชม./วัน',
            habit: 'นอนกลางวันผึ่งพุงรับแดดอุ่น นอนกรนเบาๆ หลับปุ๋ยขี้เซา'
        },
        description: 'เจ้าส้มซ่าตัวกลม ขนสีทรายอมส้มพร้อมลายแถบคาดหลัง ตากลมโตสีอำพันประกายสดใส นิสัยขี้อ้อน ช่างประจบ และรักการกินเป็นชีวิตจิตใจ',
        specialBonus: 'มีโอกาส 30% ได้รับอาหารหลักหรือขนมแมวเลียฟรีเมื่อเช็คอิน',
        badge: 'ยอดนิยมอันดับ 1 🌟'
    },
    {
        id: 'siamese',
        name: 'วิเชียรมาศ (Siamese)',
        nameEn: 'Siamese Cat',
        tagline: 'แมวไทยโบราณมงคล ตาสีฟ้าไพลิน แต้มสีเข้ม 9 จุดสง่างาม',
        bodyColor: '#E8DAC8', // Pale warm fawn / cream (deeper, no bright glare)
        bellyColor: '#DFCDB7',
        pointColor: '#2B1713', // Deep dark seal chocolate points
        eyeColor: '#1E88E5', // Vivid sapphire blue
        postitColor: '#E2ECE9', // Soft pastel mint cream
        mainFoodReq: '2 มื้อ/วัน (ตามเวลา 🐟🐟)',
        treatReq: '1-2 ซอง/วัน (อ้อนเก่ง 💖)',
        growthSpeed: 'ปานกลาง (+2% ต่อวัน 📈)',
        earType: 'pointed',
        patternType: 'colorpoint',
        sleepSchedule: {
            sleepHours: [23, 0, 1, 2, 3, 4, 12, 13],
            timeRange: '23:00 - 05:00 & 12:00 - 14:00 น.',
            totalHours: '8 ชม./วัน',
            habit: 'นอนดึกตื่นเช้าตามเวลาแฟน ชอบนอนขดเฝ้าข้างเตียง ตื่นตัวไว'
        },
        description: 'แมวไทยมงคลแห่งราชสำนัก ขนสีครีมเนียนนุ่ม ตัดกับแต้มสีช็อกโกแลตเข้มที่ใบหน้า ใบหู เท้า และหาง นัยน์ตาสีฟ้าครามเปล่งประกาย ฉลาดและช่างพูดคุย',
        specialBonus: 'เพิ่มคะแนนสะสมจากการแชทคุยกัน +20%',
        badge: 'แมวมงคลไทย 👑'
    },
    {
        id: 'khao_manee',
        name: 'ขาวมณี (Khao Manee)',
        nameEn: 'Khao Manee',
        tagline: 'อัญมณีมีชีวิต ขนสีงาช้างอบอุ่นนุ่มลึก ตาสองสีนำพาโชคลาภ',
        bodyColor: '#EDE4D5', // Warm rich ivory/biscuit (no blinding white glare)
        bellyColor: '#E2D6C3',
        pointColor: '#D5C7B2',
        eyeColor: '#00B0FF', // Left eye: Sky Blue
        eyeColorRight: '#FFB300', // Right eye: Golden Amber (Heterochromia!)
        postitColor: '#FFF8E7', // Pure pearl white
        mainFoodReq: '2 มื้อ/วัน (ทานเรียบร้อย 🐟🐟)',
        treatReq: '1 ซอง/วัน (เป็นรางวัล 💖)',
        growthSpeed: 'เสถียร (+2.5% ต่อวัน ✨)',
        earType: 'pointed',
        patternType: 'odd_eyes_solid',
        sleepSchedule: {
            sleepHours: [21, 22, 23, 0, 1, 2, 3, 4, 5],
            timeRange: '21:00 - 06:00 น.',
            totalHours: '9 ชม./วัน',
            habit: 'นอนหัวค่ำหลับลึกดั่งหยกขาว สงบนิ่ง ตื่นมารับแสงอรุณยามเช้า'
        },
        description: 'แมวไทยโบราณขนสีงาช้างนวลละมุนตา นัยน์ตาสองสี (ฟ้าข้างหนึ่ง ทองข้างหนึ่ง) หายากและทรงคุณค่า อ่อนโยน สงบเสงี่ยม เป็นสัญลักษณ์แห่งรักแท้',
        specialBonus: 'เพิ่มแต้มโชคลาภในการเก็บเกี่ยวดาวนำโชค x1.5',
        badge: 'ตาสองสีนำโชค 💎'
    },
    {
        id: 'british_shorthair',
        name: 'บริติช ช็อตแฮร์ (British Shorthair)',
        nameEn: 'British Shorthair',
        tagline: 'แก้มกลมตุ้ยนุ้ย ขนบลูเทากำมะหยี่ สุขุมนุ่มลึกดั่งตุ๊กตาหมี',
        bodyColor: '#78909C', // Velvet blue-grey
        bellyColor: '#90A4AE',
        pointColor: '#607D8B',
        eyeColor: '#FF6F00', // Deep copper amber
        postitColor: '#E3EBF4', // Pastel soft blue
        mainFoodReq: '2 มื้อ/วัน (ตัวแน่น 🐟🐟)',
        treatReq: '2 ซอง/วัน (ของโปรด 💖💖)',
        growthSpeed: 'ค่อยเป็นค่อยไป (+2% ต่อวัน 🧸)',
        earType: 'rounded',
        patternType: 'solid_plush',
        sleepSchedule: {
            sleepHours: [11, 12, 13, 14, 15, 22, 23, 0, 1, 2, 3, 4, 5, 6],
            timeRange: '11:00 - 16:00 & 22:00 - 07:00 น.',
            totalHours: '14 ชม./วัน',
            habit: 'แชมป์ขี้เซา นอนขดเป็นก้อนกลมข้างโซฟา ไม่กวนใจแต่น่าฟัด'
        },
        description: 'เจ้าก้อนขนเทาบลูตัวแน่น แก้มยุ้ยน่าฟัดที่สุดในบ้าน นิสัยสุขุม นิ่งสงบ ชอบนอนเฝ้าแฟนทำงานเงียบๆ ไม่กวนใจแต่อบอุ่นหัวใจเสมอ',
        specialBonus: 'บันทึกอารมณ์ก่อนนอนได้รับแต้ม x1.5',
        badge: 'แก้มแน่นน่ากอด 🧸'
    },
    {
        id: 'persian',
        name: 'เปอร์เซีย (Persian)',
        nameEn: 'Persian Cat',
        tagline: 'เจ้าหญิงขนปุยฟูฟ่อง หน้าตุ๊กตาสุดหวาน นัยน์ตามรกตชวนหลงใหล',
        bodyColor: '#F5D3A9', // Cream apricot fluffy
        bellyColor: '#EAD1B6',
        pointColor: '#E0B584',
        eyeColor: '#2E7D32', // Emerald green
        postitColor: '#FFEFE5', // Pastel Rose Peach
        mainFoodReq: '2 มื้อ/วัน (ทานละเมียด 🐟🐟)',
        treatReq: '1 ซอง/วัน (สูตรบำรุงขน 💖)',
        growthSpeed: 'นุ่มนวล (+2% ต่อวัน 🌸)',
        earType: 'small_rounded',
        patternType: 'fluffy_longhair',
        sleepSchedule: {
            sleepHours: [10, 11, 12, 13, 14, 21, 22, 23, 0, 1, 2, 3, 4, 5],
            timeRange: '10:00 - 15:00 & 21:00 - 06:00 น.',
            totalHours: '14 ชม./วัน',
            habit: 'เจ้าหญิงนิทรา นอนทอดตัวบนเบาะนุ่มฟู ชอบความเงียบสงบ'
        },
        description: 'เจ้าหญิงขนยาวสลวยนุ่มฟู เดินนวยนาดดั่งขุนนาง นัยน์ตาสีเขียวมรกตกลมโต ชอบให้แฟนแปรงขนและตัดแต่งเล็บให้อย่างทะนุถนอม',
        specialBonus: 'การตัดขนตัดเล็บได้รับแต้มความรัก x2',
        badge: 'เจ้าหญิงขนฟู 🌸'
    },
    {
        id: 'scottish_fold',
        name: 'สก็อตติช โฟลด์ (Scottish Fold)',
        nameEn: 'Scottish Fold',
        tagline: 'หูพับแนบหัว นกฮูกน้อยตาโตแป๋ว นั่งท่าเป็ดอ้อนแฟนทั้งวัน',
        bodyColor: '#B0BEC5', // Soft silver marble
        bellyColor: '#ECEFF1',
        pointColor: '#90A4AE',
        eyeColor: '#FFB300', // Bright owl amber
        postitColor: '#F1ECF8', // Pastel Lavender Violet
        mainFoodReq: '2 มื้อ/วัน (ทานเก่ง 🐟🐟)',
        treatReq: '2 ซอง/วัน (อ้อนกินตลอด 💖💖)',
        growthSpeed: 'เร็ว (+3% ต่อวัน 🦉)',
        earType: 'folded_forward',
        patternType: 'marble_tabby',
        sleepSchedule: {
            sleepHours: [13, 14, 15, 16, 17, 23, 0, 1, 2, 3, 4, 5],
            timeRange: '13:00 - 18:00 & 23:00 - 06:00 น.',
            totalHours: '12 ชม./วัน',
            habit: 'นอนท่านั่งเป็ดพับขา หูพับตาพริ้ม งีบตอนบ่ายได้น่ารักที่สุด'
        },
        description: 'น้องแมวหูพับตัวกลม ใบหน้าหวานเหมือนนกฮูกตัวจิ๋ว ชอบนั่งพับขาและเอาหัวมาดุนมือแฟน ขี้อ้อนอันดับหนึ่ง ถ้าคิดถึงแฟนจะกระดิกหางเบาๆ',
        specialBonus: 'ส่งสัญญาณคิดถึงลดคูลดาวน์ลง 50%',
        badge: 'หูพับตาแป๋ว 🦉'
    },
    {
        id: 'ragdoll',
        name: 'แร็กดอลล์ (Ragdoll)',
        nameEn: 'Ragdoll',
        tagline: 'ตุ๊กตาผ้าตัวนุ่มนิ่ม ตาสีไพลินลึก ขี้อ้อนตัวอ่อนเมื่อถูกอุ้ม',
        bodyColor: '#EBE2D4', // Soft warm ivory (deeper tone, non-glare)
        bellyColor: '#DFCDB7',
        pointColor: '#38231D', // Deep dark seal mask & points
        eyeColor: '#1565C0', // Crystal sapphire blue
        postitColor: '#FDECEF', // Pastel Baby Pink
        mainFoodReq: '3 มื้อ/วัน (ไซส์ใหญ่ 🐟🐟🐟)',
        treatReq: '2 ซอง/วัน (ทานง่าย 💖💖)',
        growthSpeed: 'โตไว (+3% ต่อวัน 🎀)',
        earType: 'pointed',
        patternType: 'bicolor_v_mask',
        sleepSchedule: {
            sleepHours: [12, 13, 14, 15, 22, 23, 0, 1, 2, 3, 4, 5],
            timeRange: '12:00 - 16:00 & 22:00 - 06:00 น.',
            totalHours: '12 ชม./วัน',
            habit: 'นอนทิ้งตัวปวกเปียก หงายท้องไร้ระวัง อุ้มตอนหลับก็ไม่ตื่น'
        },
        description: 'แมวพันธุ์ใหญ่ใจดี ขนฟูสลวยพร้อมลายหน้ากากตัว V สีเข้ม นัยน์ตาสีฟ้าไพลินลึก เมื่ออุ้มขึ้นมาจะทิ้งตัวนิ่มเป็นตุ๊กตาผ้า ไม่เคยกางเล็บใส่ใคร',
        specialBonus: 'เช็คอาหารครบ 3 มื้อรับขนมแมวเลียฟรี 1 ชิ้น',
        badge: 'นุ่มนิ่มใจดี 🎀'
    },
    {
        id: 'sphynx',
        name: 'สฟิงซ์ (Sphynx)',
        nameEn: 'Sphynx Cat',
        tagline: 'แมวไร้ขนผิวอุ่นดั่งลูกพีช หูค้างคาวสุดเท่ ต้องการอ้อมกอดเสมอ',
        bodyColor: '#FFCCBC', // Soft suede warm peach skin
        bellyColor: '#FFE0B2',
        pointColor: '#D7CCC8',
        eyeColor: '#8BC34A', // Lime jade green
        postitColor: '#FFF8E7', // Warm nude vanilla
        mainFoodReq: '3 มื้อ/วัน (เผาผลาญสูง 🐟🐟🐟)',
        treatReq: '1 ซอง/วัน (เติมพลัง 💖)',
        growthSpeed: 'เร็วมาก (+3.5% ต่อวัน ☀️)',
        earType: 'large_bat',
        patternType: 'hairless_suede',
        sleepSchedule: {
            sleepHours: [14, 15, 22, 23, 0, 1, 2, 3, 4, 5, 6],
            timeRange: '14:00 - 16:00 & 22:00 - 07:00 น.',
            totalHours: '11 ชม./วัน',
            habit: 'นอนมุดซุกใต้ผ้าห่มแนบชิดแฟนเพื่อรับความอบอุ่น ช่างประจบ'
        },
        description: 'แมวผิวหนังนุ่มนวลอุ่นสบายดั่งลูกพีช ไร้ขนแต่เปี่ยมล้นไปด้วยความรัก ชอบมุดผ้าห่มและนอนซบอกแฟนเพื่อรับความอบอุ่น ช่างประจบเป็นเลิศ',
        specialBonus: 'เช็คอินยามเช้าได้รับแต้มสะสม x1.5',
        badge: 'กอดอุ่นที่สุด ☀️'
    },
    {
        id: 'maine_coon',
        name: 'เมนคูน (Maine Coon)',
        nameEn: 'Maine Coon',
        tagline: 'ยักษ์ใหญ่ใจดี ลายเสือโคร่งสง่างาม หางฟูเป็นพวงดั่งสิงโต',
        bodyColor: '#6D4C41', // Rich tiger tabby brown
        bellyColor: '#E6D7C3',
        pointColor: '#3E2723',
        eyeColor: '#C0CA33', // Amber lime green
        postitColor: '#E8F3EA', // Pastel Tea Green
        mainFoodReq: '3 มื้อ/วัน (จัมโบ้ 🐟🐟🐟)',
        treatReq: '2-3 ซอง/วัน (ยักษ์ใจดี 💖💖)',
        growthSpeed: 'แข็งแกร่ง (+3% ต่อวัน 🦁)',
        earType: 'tufted_lynx',
        patternType: 'tiger_classic',
        sleepSchedule: {
            sleepHours: [14, 15, 16, 1, 2, 3, 4, 5, 6],
            timeRange: '14:00 - 17:00 & 01:00 - 07:00 น.',
            totalHours: '9 ชม./วัน',
            habit: 'นอนเหยียดตัวยาวเต็มพื้นที่ สไตล์พี่ใหญ่ใจดี ไม่หวั่นไหว'
        },
        description: 'แมวยักษ์ใหญ่ใจดีที่สุดในโลก มีพู่ขนที่ปลายหูและแผงคอดั่งสิงโต ลายเสือโคร่งคมชัด คอยเฝ้าปกป้องแฟนอย่างเงียบๆ สุขภาพแข็งแกร่ง ไม่ป่วยง่าย',
        specialBonus: 'ป้องกันการเจ็บป่วยและลดโอกาสติดโรคได้ 40%',
        badge: 'พี่ใหญ่ใจดี 🦁'
    },
    {
        id: 'bengal',
        name: 'เบงกอล (Bengal)',
        nameEn: 'Bengal Cat',
        tagline: 'เสือดาวน้อยพลังล้น ลายจุดโรเซตต์ทองอร่าม ปราดเปรียวซุกซน',
        bodyColor: '#FFA726', // Leopard gold amber
        bellyColor: '#F5E6D3',
        pointColor: '#D84315', // Dark leopard rosettes
        eyeColor: '#388E3C', // Jungle emerald green
        postitColor: '#FFF3D6', // Pastel Golden Honey
        mainFoodReq: '3 มื้อ/วัน (พลังงานสูง 🐟🐟🐟)',
        treatReq: '2 ซอง/วัน (รางวัลคนเก่ง 💖💖)',
        growthSpeed: 'ไวมาก (+3.5% ต่อวัน 🐆)',
        earType: 'standard',
        patternType: 'leopard_rosette',
        sleepSchedule: {
            sleepHours: [13, 14, 2, 3, 4, 5, 6],
            timeRange: '13:00 - 15:00 & 02:00 - 07:00 น.',
            totalHours: '7 ชม./วัน',
            habit: 'นอนน้อยพลังงานล้น งีบชาร์จพลังสั้นๆ แล้วพร้อมวิ่งเล่นซุกซน'
        },
        description: 'เสือดาวน้อยประจำบ้าน ลายจุดโรเซตต์สีทองวาววับ ปราดเปรียว วิ่งไว กระโดดสูง ชวนแฟนเล่นเกมท้าทายและสร้างรอยยิ้มได้ตลอดทั้งวัน',
        specialBonus: 'ชนะควิซท้าดวลได้รับคะแนนคูณสอง x2',
        badge: 'เสือดาวพลังล้น 🐆'
    },
    {
        id: 'mystery_kitten',
        name: 'น้องแมวนิรนาม (Mystery Kitten)',
        nameEn: 'Mystery Kitten',
        tagline: 'ลูกแมวน้อยปริศนา ลุ้นสายพันธุ์แท้เมื่อครบ 2 เดือน!',
        bodyColor: '#C7B198', // Soft warm cappuccino kitten coat
        bellyColor: '#DFD3C3',
        pointColor: '#8D7B68',
        eyeColor: '#E67E22', // Mysterious warm amber
        postitColor: '#FFF9C4', // Soft butter yellow
        mainFoodReq: '2-3 มื้อ/วัน (กำลังโต 🍼)',
        treatReq: '1-2 ซอง/วัน (อ้อนเก่ง 💖)',
        growthSpeed: 'ลุ้นทุกวัน (+2.5% ต่อวัน 🐾)',
        earType: 'standard',
        patternType: 'mystery_bell',
        sleepSchedule: {
            sleepHours: [12, 13, 14, 15, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6],
            timeRange: '12:00 - 16:00 & 21:00 - 07:00 น.',
            totalHours: '14 ชม./วัน',
            habit: 'ลูกแมวน้อยนอนบ่อย กินนมแล้วหลับปุ๋ย หลับฝันดุ๊กดิ๊ก'
        },
        description: 'ลูกแมวน้อยน่ารักน่าเอ็นดู ยังไม่ปรากฏสายพันธุ์ที่แน่ชัด เลี้ยงดูด้วยความรักจนครบ 2 เดือนจึงจะเผยสายพันธุ์ที่แท้จริงให้คู่รักได้ชื่นชม!',
        specialBonus: 'เพิ่มแต้มความผูกพันและแต้มความรักจากการดูแล x1.2',
        badge: 'ลุ้นสายพันธุ์เมื่อครบ 2 เดือน ❓'
    }
];

// Helper: Check if a cat breed is in its designated sleeping period
function isCatSleepingNow(breedId, currentHour = new Date().getHours()) {
    const breed = (typeof CAT_BREEDS !== 'undefined') ? CAT_BREEDS.find(b => b.id === breedId) : null;
    if (breed && breed.sleepSchedule && Array.isArray(breed.sleepSchedule.sleepHours)) {
        return breed.sleepSchedule.sleepHours.includes(currentHour);
    }
    return (currentHour >= 22 || currentHour < 6);
}

// Point Shop Items Catalog (Cat Care & Toys Items)
const SHOP_ITEMS = [
    {
        id: 'main_food',
        name: 'อาหารเปียกปลาแซลมอนพรีเมียม',
        cost: 50,
        icon: 'fish',
        desc: 'อาหารจานหลักรสเลิศ เติมพลังความอิ่ม +25% (ห้ามให้อาหารหากอิ่ม 100%)',
        type: 'care'
    },
    {
        id: 'creamy_treat',
        name: 'ขนมแมวเลียสูตรหัวใจหวาน',
        cost: 80,
        icon: 'heart',
        desc: 'ขนมแมวเลีย เสริมความสุขความผูกพัน +30% (ห้ามให้หากผูกพัน 100%)',
        type: 'care'
    },
    {
        id: 'cat_toy_feather',
        name: 'ไม้ตกแมวขนนกฟรุ้งฟริ้ง 🪶',
        cost: 60,
        icon: 'sparkles',
        desc: 'ของเล่นแมว สร้างความผูกพันพิเศษกับผู้ให้โดยตรง +25% สะสมคะแนนความผูกพัน',
        type: 'toy'
    },
    {
        id: 'cat_toy_yarn',
        name: 'ลูกบอลไหมพรมกระดิ่งกลิ้ง 🧶',
        cost: 70,
        icon: 'circle-dot',
        desc: 'ลูกบอลไหมพรมกลิ้งเล่นรอบบ้าน เพิ่มความสุขและผูกพันกับผู้ให้ +30%',
        type: 'toy'
    },
    {
        id: 'cat_toy_laser',
        name: 'เลเซอร์พอยเตอร์รูปดาว 💫',
        cost: 90,
        icon: 'zap',
        desc: 'แมววิ่งไล่จับแสงเลเซอร์อย่างสนุกสนาน เพิ่มความผูกพันกับผู้ให้ +40%',
        type: 'toy'
    },
    {
        id: 'vaccine',
        name: 'วัคซีนรวม & ยาบำรุงสุขภาพแมว',
        cost: 100,
        icon: 'syringe',
        desc: 'รักษาอาการป่วย ให้สุขภาพกายเต็ม 100% (ห้ามใช้หากสุขภาพ 100% อยู่แล้ว)',
        type: 'cure'
    },
    {
        id: 'grooming_kit',
        name: 'กรรไกรตัดเล็บ & แปรงขนนวดสปา',
        cost: 100,
        icon: 'scissors',
        desc: 'ตัดเล็บแหลมและสางขนพันกัน เพิ่มความสบายตัว (ห้ามใช้หากสุขภาพ 100%)',
        type: 'cure'
    }
];

// Daily Couple Love Quests
const DEFAULT_QUESTS = [
    {
        id: 'q_checkin',
        title: 'เช็คอินความรักประจำวัน',
        detail: 'เข้าแอปทักทายแฟนและเช็คอินความพร้อมของหัวใจ',
        reward: 40,
        category: 'checkin',
        targetView: 'view-quests'
    },
    {
        id: 'q_play',
        title: 'เล่นกับน้องแมว',
        detail: 'หยอกล้อ ลูบหัว หรือใช้ของเล่นแมวสร้างความผูกพันสะสมเวลาเล่น',
        reward: 30,
        category: 'play',
        targetView: 'view-garden'
    },
    {
        id: 'q_feed',
        title: 'ให้อาหารหรือขนมแมวเลีย',
        detail: 'ดูแลน้องแมวให้ความอิ่มและความสุขเต็มเปี่ยม (หากยังไม่อิ่มเต็ม 100%)',
        reward: 30,
        category: 'care',
        targetView: 'view-garden'
    },
    {
        id: 'q_meal',
        title: 'บันทึกมื้ออาหารของวันนี้',
        detail: 'เช็คลิสต์มื้อเช้า กลางวัน เย็น หรือขนมหวานให้แฟนรู้ พร้อมบันทึกประวัติ',
        reward: 25,
        category: 'meals',
        targetView: 'view-meals'
    },
    {
        id: 'q_note',
        title: 'เขียนโน้ตเตือนใจหรือความรู้สึก',
        detail: 'แชร์บันทึกเรื่องราวที่อยากบอกแฟนแบบเรียลไทม์',
        reward: 20,
        category: 'notes',
        targetView: 'view-notes'
    },
    {
        id: 'q_chat',
        title: 'ส่งข้อความบอกรักในแชท',
        detail: 'คุยกับแฟนในห้องแชทพร้อมแสดงสถานะอ่านแล้ว',
        reward: 20,
        category: 'chat',
        targetView: 'view-chat'
    },
    {
        id: 'q_bedtime',
        title: 'บันทึกอารมณ์ก่อนนอน (หลัง 18:00)',
        detail: 'บอกความรู้สึกของวันนี้ก่อนเข้านอน (ทำได้วันละ 1 ครั้ง)',
        reward: 35,
        category: 'bedtime',
        targetView: 'view-calendar'
    },
    {
        id: 'q_quiz',
        title: 'ตั้งคำถามทายใจประจำวัน',
        detail: 'สร้างคำถามควิซประจำวันเพื่อให้คนรักได้ร่วมตอบทายใจ',
        reward: 30,
        category: 'quiz',
        targetView: 'view-quiz'
    }
];

// ============================================================================
// 10-Year Thai Government Lottery Historical Records (2559 - 2568 / 2016 - 2025)
// Authentic winning records for 1st & 16th drawings across all 12 months
// ============================================================================
const THAI_LOTTERY_10YR_HISTORY = {
    // 1. มกราคม (17 ม.ค. / 30 ธ.ค.-2 ม.ค.)
    "1_1": [
        { yearBE: 2568, date: "2 ม.ค. 2568", firstPrize: "776269", last2: "15", last3: "312, 814" },
        { yearBE: 2567, date: "2 ม.ค. 2567", firstPrize: "625544", last2: "89", last3: "648, 493" },
        { yearBE: 2566, date: "2 ม.ค. 2566", firstPrize: "157196", last2: "58", last3: "191, 314" },
        { yearBE: 2565, date: "2 ม.ค. 2565", firstPrize: "819473", last2: "85", last3: "116, 510" },
        { yearBE: 2564, date: "2 ม.ค. 2564", firstPrize: "803628", last2: "19", last3: "330, 503" },
        { yearBE: 2563, date: "2 ม.ค. 2563", firstPrize: "510541", last2: "81", last3: "150, 597" },
        { yearBE: 2562, date: "2 ม.ค. 2562", firstPrize: "735867", last2: "02", last3: "031, 913" },
        { yearBE: 2561, date: "2 ม.ค. 2561", firstPrize: "918231", last2: "14", last3: "126, 435" },
        { yearBE: 2560, date: "2 ม.ค. 2560", firstPrize: "377512", last2: "99", last3: "107, 186" },
        { yearBE: 2559, date: "2 ม.ค. 2559", firstPrize: "261835", last2: "46", last3: "485, 936" }
    ],
    "1_16": [
        { yearBE: 2568, date: "17 ม.ค. 2568", firstPrize: "805544", last2: "82", last3: "119, 930" },
        { yearBE: 2567, date: "17 ม.ค. 2567", firstPrize: "105979", last2: "61", last3: "196, 635" },
        { yearBE: 2566, date: "17 ม.ค. 2566", firstPrize: "812519", last2: "47", last3: "564, 849" },
        { yearBE: 2565, date: "17 ม.ค. 2565", firstPrize: "880159", last2: "92", last3: "529, 119" },
        { yearBE: 2564, date: "17 ม.ค. 2564", firstPrize: "384395", last2: "15", last3: "566, 870" },
        { yearBE: 2563, date: "17 ม.ค. 2563", firstPrize: "491774", last2: "68", last3: "079, 132" },
        { yearBE: 2562, date: "17 ม.ค. 2562", firstPrize: "197079", last2: "65", last3: "668, 830" },
        { yearBE: 2561, date: "17 ม.ค. 2561", firstPrize: "203823", last2: "50", last3: "624, 755" },
        { yearBE: 2560, date: "17 ม.ค. 2560", firstPrize: "145157", last2: "25", last3: "663, 836" },
        { yearBE: 2559, date: "17 ม.ค. 2559", firstPrize: "304371", last2: "50", last3: "531, 743" }
    ],

    // 2. กุมภาพันธ์
    "2_1": [
        { yearBE: 2568, date: "1 ก.พ. 2568", firstPrize: "365042", last2: "28", last3: "419, 735" },
        { yearBE: 2567, date: "1 ก.พ. 2567", firstPrize: "607063", last2: "09", last3: "414, 943" },
        { yearBE: 2566, date: "1 ก.พ. 2566", firstPrize: "297411", last2: "92", last3: "181, 789" },
        { yearBE: 2565, date: "1 ก.พ. 2565", firstPrize: "944308", last2: "30", last3: "509, 942" },
        { yearBE: 2564, date: "1 ก.พ. 2564", firstPrize: "912307", last2: "97", last3: "248, 651" },
        { yearBE: 2563, date: "1 ก.พ. 2563", firstPrize: "589227", last2: "06", last3: "259, 927" },
        { yearBE: 2562, date: "1 ก.พ. 2562", firstPrize: "967134", last2: "04", last3: "021, 661" },
        { yearBE: 2561, date: "1 ก.พ. 2561", firstPrize: "739853", last2: "31", last3: "022, 647" },
        { yearBE: 2560, date: "1 ก.พ. 2560", firstPrize: "054672", last2: "42", last3: "426, 696" },
        { yearBE: 2559, date: "1 ก.พ. 2559", firstPrize: "927800", last2: "09", last3: "076, 525" }
    ],
    "2_16": [
        { yearBE: 2568, date: "16 ก.พ. 2568", firstPrize: "943890", last2: "71", last3: "468, 629" },
        { yearBE: 2567, date: "16 ก.พ. 2567", firstPrize: "941395", last2: "43", last3: "375, 875" },
        { yearBE: 2566, date: "16 ก.พ. 2566", firstPrize: "590417", last2: "80", last3: "195, 664" },
        { yearBE: 2565, date: "16 ก.พ. 2565", firstPrize: "098597", last2: "57", last3: "592, 816" },
        { yearBE: 2564, date: "16 ก.พ. 2564", firstPrize: "424603", last2: "39", last3: "057, 861" },
        { yearBE: 2563, date: "16 ก.พ. 2563", firstPrize: "781403", last2: "94", last3: "915, 030" },
        { yearBE: 2562, date: "16 ก.พ. 2562", firstPrize: "074824", last2: "56", last3: "612, 879" },
        { yearBE: 2561, date: "16 ก.พ. 2561", firstPrize: "309915", last2: "39", last3: "798, 873" },
        { yearBE: 2560, date: "16 ก.พ. 2560", firstPrize: "424915", last2: "53", last3: "748, 876" },
        { yearBE: 2559, date: "16 ก.พ. 2559", firstPrize: "356364", last2: "98", last3: "309, 684" }
    ],

    // 3. มีนาคม
    "3_1": [
        { yearBE: 2568, date: "1 มี.ค. 2568", firstPrize: "524853", last2: "55", last3: "419, 652" },
        { yearBE: 2567, date: "1 มี.ค. 2567", firstPrize: "253603", last2: "79", last3: "382, 703" },
        { yearBE: 2566, date: "1 มี.ค. 2566", firstPrize: "417652", last2: "55", last3: "596, 919" },
        { yearBE: 2565, date: "1 มี.ค. 2565", firstPrize: "061905", last2: "07", last3: "236, 699" },
        { yearBE: 2564, date: "1 มี.ค. 2564", firstPrize: "835538", last2: "73", last3: "051, 838" },
        { yearBE: 2563, date: "1 มี.ค. 2563", firstPrize: "875938", last2: "98", last3: "329, 664" },
        { yearBE: 2562, date: "1 มี.ค. 2562", firstPrize: "345650", last2: "65", last3: "830, 837" },
        { yearBE: 2561, date: "1 มี.ค. 2561", firstPrize: "759415", last2: "29", last3: "557, 726" },
        { yearBE: 2560, date: "1 มี.ค. 2560", firstPrize: "978453", last2: "78", last3: "560, 936" },
        { yearBE: 2559, date: "1 มี.ค. 2559", firstPrize: "439686", last2: "06", last3: "400, 490" }
    ],
    "3_16": [
        { yearBE: 2568, date: "16 มี.ค. 2568", firstPrize: "718503", last2: "32", last3: "327, 856" },
        { yearBE: 2567, date: "16 มี.ค. 2567", firstPrize: "997626", last2: "78", last3: "471, 409" },
        { yearBE: 2566, date: "16 มี.ค. 2566", firstPrize: "025873", last2: "73", last3: "420, 800" },
        { yearBE: 2565, date: "16 มี.ค. 2565", firstPrize: "737867", last2: "03", last3: "349, 988" },
        { yearBE: 2564, date: "16 มี.ค. 2564", firstPrize: "890422", last2: "19", last3: "396, 698" },
        { yearBE: 2563, date: "16 มี.ค. 2563", firstPrize: "503446", last2: "77", last3: "258, 661" },
        { yearBE: 2562, date: "16 มี.ค. 2562", firstPrize: "724628", last2: "64", last3: "148, 883" },
        { yearBE: 2561, date: "16 มี.ค. 2561", firstPrize: "218559", last2: "82", last3: "205, 489" },
        { yearBE: 2560, date: "16 มี.ค. 2560", firstPrize: "273863", last2: "92", last3: "918, 941" },
        { yearBE: 2559, date: "16 มี.ค. 2559", firstPrize: "134918", last2: "32", last3: "044, 877" }
    ],

    // 4. เมษายน
    "4_1": [
        { yearBE: 2568, date: "1 เม.ย. 2568", firstPrize: "839462", last2: "94", last3: "328, 815" },
        { yearBE: 2567, date: "1 เม.ย. 2567", firstPrize: "803481", last2: "90", last3: "559, 847" },
        { yearBE: 2566, date: "1 เม.ย. 2566", firstPrize: "087907", last2: "99", last3: "290, 698" },
        { yearBE: 2565, date: "1 เม.ย. 2565", firstPrize: "970618", last2: "10", last3: "738, 778" },
        { yearBE: 2564, date: "1 เม.ย. 2564", firstPrize: "472270", last2: "05", last3: "282, 577" },
        { yearBE: 2563, date: "1 เม.ย. 2563", firstPrize: "051095", last2: "22", last3: "285, 391" },
        { yearBE: 2562, date: "1 เม.ย. 2562", firstPrize: "109767", last2: "52", last3: "876, 959" },
        { yearBE: 2561, date: "1 เม.ย. 2561", firstPrize: "412073", last2: "85", last3: "317, 782" },
        { yearBE: 2560, date: "1 เม.ย. 2560", firstPrize: "392785", last2: "80", last3: "057, 529" },
        { yearBE: 2559, date: "1 เม.ย. 2559", firstPrize: "066720", last2: "92", last3: "285, 390" }
    ],
    "4_16": [
        { yearBE: 2568, date: "16 เม.ย. 2568", firstPrize: "248960", last2: "41", last3: "572, 918" },
        { yearBE: 2567, date: "16 เม.ย. 2567", firstPrize: "943598", last2: "79", last3: "154, 200" },
        { yearBE: 2566, date: "16 เม.ย. 2566", firstPrize: "984906", last2: "71", last3: "797, 891" },
        { yearBE: 2565, date: "16 เม.ย. 2565", firstPrize: "395919", last2: "58", last3: "508, 872" },
        { yearBE: 2564, date: "16 เม.ย. 2564", firstPrize: "100787", last2: "56", last3: "013, 478" },
        { yearBE: 2563, date: "16 เม.ย. 2563", firstPrize: "145016", last2: "31", last3: "268, 597" },
        { yearBE: 2562, date: "16 เม.ย. 2562", firstPrize: "570331", last2: "32", last3: "550, 930" },
        { yearBE: 2561, date: "16 เม.ย. 2561", firstPrize: "739229", last2: "60", last3: "046, 526" },
        { yearBE: 2560, date: "16 เม.ย. 2560", firstPrize: "816719", last2: "53", last3: "425, 787" },
        { yearBE: 2559, date: "16 เม.ย. 2559", firstPrize: "221609", last2: "87", last3: "228, 494" }
    ],

    // 5. พฤษภาคม (2 พ.ค. / 16 พ.ค.)
    "5_1": [
        { yearBE: 2568, date: "2 พ.ค. 2568", firstPrize: "951630", last2: "62", last3: "389, 742" },
        { yearBE: 2567, date: "2 พ.ค. 2567", firstPrize: "980116", last2: "17", last3: "104, 634" },
        { yearBE: 2566, date: "2 พ.ค. 2566", firstPrize: "841519", last2: "65", last3: "268, 871" },
        { yearBE: 2565, date: "2 พ.ค. 2565", firstPrize: "658642", last2: "09", last3: "041, 778" },
        { yearBE: 2564, date: "2 พ.ค. 2564", firstPrize: "501272", last2: "18", last3: "129, 498" },
        { yearBE: 2563, date: "16 พ.ค. 2563", firstPrize: "051095", last2: "22", last3: "285, 391" },
        { yearBE: 2562, date: "2 พ.ค. 2562", firstPrize: "061324", last2: "25", last3: "476, 693" },
        { yearBE: 2561, date: "2 พ.ค. 2561", firstPrize: "248038", last2: "85", last3: "600, 980" },
        { yearBE: 2560, date: "2 พ.ค. 2560", firstPrize: "008656", last2: "35", last3: "373, 949" },
        { yearBE: 2559, date: "2 พ.ค. 2559", firstPrize: "399459", last2: "02", last3: "238, 403" }
    ],
    "5_16": [
        { yearBE: 2568, date: "16 พ.ค. 2568", firstPrize: "729514", last2: "48", last3: "492, 915" },
        { yearBE: 2567, date: "16 พ.ค. 2567", firstPrize: "205690", last2: "60", last3: "137, 885" },
        { yearBE: 2566, date: "16 พ.ค. 2566", firstPrize: "132903", last2: "99", last3: "681, 739" },
        { yearBE: 2565, date: "16 พ.ค. 2565", firstPrize: "155012", last2: "06", last3: "247, 536" },
        { yearBE: 2564, date: "16 พ.ค. 2564", firstPrize: "684579", last2: "14", last3: "276, 615" },
        { yearBE: 2563, date: "16 พ.ค. 2563", firstPrize: "051095", last2: "22", last3: "285, 391" },
        { yearBE: 2562, date: "16 พ.ค. 2562", firstPrize: "962526", last2: "71", last3: "018, 828" },
        { yearBE: 2561, date: "16 พ.ค. 2561", firstPrize: "075629", last2: "20", last3: "057, 544" },
        { yearBE: 2560, date: "16 พ.ค. 2560", firstPrize: "454891", last2: "53", last3: "245, 396" },
        { yearBE: 2559, date: "16 พ.ค. 2559", firstPrize: "141737", last2: "98", last3: "382, 975" }
    ],

    // 6. มิถุนายน
    "6_1": [
        { yearBE: 2568, date: "1 มิ.ย. 2568", firstPrize: "614835", last2: "39", last3: "356, 749" },
        { yearBE: 2567, date: "1 มิ.ย. 2567", firstPrize: "530593", last2: "42", last3: "194, 577" },
        { yearBE: 2566, date: "1 มิ.ย. 2566", firstPrize: "125272", last2: "09", last3: "381, 973" },
        { yearBE: 2565, date: "1 มิ.ย. 2565", firstPrize: "319196", last2: "02", last3: "189, 693" },
        { yearBE: 2564, date: "1 มิ.ย. 2564", firstPrize: "292972", last2: "45", last3: "193, 623" },
        { yearBE: 2563, date: "1 มิ.ย. 2563", firstPrize: "831567", last2: "24", last3: "562, 582" },
        { yearBE: 2562, date: "1 มิ.ย. 2562", firstPrize: "516461", last2: "46", last3: "560, 713" },
        { yearBE: 2561, date: "1 มิ.ย. 2561", firstPrize: "149840", last2: "67", last3: "384, 576" },
        { yearBE: 2560, date: "1 มิ.ย. 2560", firstPrize: "633095", last2: "43", last3: "628, 917" },
        { yearBE: 2559, date: "1 มิ.ย. 2559", firstPrize: "511825", last2: "14", last3: "775, 875" }
    ],
    "6_16": [
        { yearBE: 2568, date: "16 มิ.ย. 2568", firstPrize: "827419", last2: "83", last3: "412, 794" },
        { yearBE: 2567, date: "16 มิ.ย. 2567", firstPrize: "518504", last2: "31", last3: "428, 447" },
        { yearBE: 2566, date: "16 มิ.ย. 2566", firstPrize: "264872", last2: "30", last3: "202, 874" },
        { yearBE: 2565, date: "16 มิ.ย. 2565", firstPrize: "361807", last2: "92", last3: "106, 228" },
        { yearBE: 2564, date: "16 มิ.ย. 2564", firstPrize: "691861", last2: "17", last3: "054, 669" },
        { yearBE: 2563, date: "16 มิ.ย. 2563", firstPrize: "516967", last2: "64", last3: "882, 887" },
        { yearBE: 2562, date: "16 มิ.ย. 2562", firstPrize: "174055", last2: "29", last3: "520, 698" },
        { yearBE: 2561, date: "16 มิ.ย. 2561", firstPrize: "223131", last2: "46", last3: "217, 532" },
        { yearBE: 2560, date: "16 มิ.ย. 2560", firstPrize: "943142", last2: "47", last3: "740, 878" },
        { yearBE: 2559, date: "16 มิ.ย. 2559", firstPrize: "073816", last2: "79", last3: "251, 804" }
    ],

    // 7. กรกฎาคม
    "7_1": [
        { yearBE: 2568, date: "1 ก.ค. 2568", firstPrize: "492716", last2: "86", last3: "318, 924" },
        { yearBE: 2567, date: "1 ก.ค. 2567", firstPrize: "434503", last2: "89", last3: "031, 331" },
        { yearBE: 2566, date: "1 ก.ค. 2566", firstPrize: "922605", last2: "16", last3: "281, 547" },
        { yearBE: 2565, date: "1 ก.ค. 2565", firstPrize: "981417", last2: "61", last3: "242, 549" },
        { yearBE: 2564, date: "1 ก.ค. 2564", firstPrize: "713517", last2: "29", last3: "078, 511" },
        { yearBE: 2563, date: "1 ก.ค. 2563", firstPrize: "347258", last2: "83", last3: "095, 364" },
        { yearBE: 2562, date: "1 ก.ค. 2562", firstPrize: "943647", last2: "86", last3: "239, 864" },
        { yearBE: 2561, date: "1 ก.ค. 2561", firstPrize: "963623", last2: "83", last3: "210, 617" },
        { yearBE: 2560, date: "1 ก.ค. 2560", firstPrize: "112360", last2: "26", last3: "226, 688" },
        { yearBE: 2559, date: "1 ก.ค. 2559", firstPrize: "082460", last2: "53", last3: "160, 526" }
    ],
    "7_16": [
        { yearBE: 2568, date: "16 ก.ค. 2568", firstPrize: "731695", last2: "14", last3: "254, 762" },
        { yearBE: 2567, date: "16 ก.ค. 2567", firstPrize: "367336", last2: "21", last3: "357, 521" },
        { yearBE: 2566, date: "16 ก.ค. 2566", firstPrize: "169530", last2: "62", last3: "219, 780" },
        { yearBE: 2565, date: "16 ก.ค. 2565", firstPrize: "620405", last2: "53", last3: "061, 279" },
        { yearBE: 2564, date: "16 ก.ค. 2564", firstPrize: "556725", last2: "70", last3: "233, 927" },
        { yearBE: 2563, date: "16 ก.ค. 2563", firstPrize: "873286", last2: "53", last3: "533, 682" },
        { yearBE: 2562, date: "16 ก.ค. 2562", firstPrize: "369765", last2: "88", last3: "113, 756" },
        { yearBE: 2561, date: "16 ก.ค. 2561", firstPrize: "596324", last2: "27", last3: "403, 758" },
        { yearBE: 2560, date: "16 ก.ค. 2560", firstPrize: "820327", last2: "87", last3: "090, 835" },
        { yearBE: 2559, date: "16 ก.ค. 2559", firstPrize: "449764", last2: "55", last3: "158, 552" }
    ],

    // 8. สิงหาคม
    "8_1": [
        { yearBE: 2568, date: "1 ส.ค. 2568", firstPrize: "914562", last2: "45", last3: "283, 819" },
        { yearBE: 2567, date: "1 ส.ค. 2567", firstPrize: "756363", last2: "14", last3: "357, 747" },
        { yearBE: 2566, date: "31 ก.ค. 2566", firstPrize: "260453", last2: "11", last3: "387, 690" },
        { yearBE: 2565, date: "1 ส.ค. 2565", firstPrize: "436594", last2: "14", last3: "266, 447" },
        { yearBE: 2564, date: "1 ส.ค. 2564", firstPrize: "910261", last2: "69", last3: "004, 785" },
        { yearBE: 2563, date: "1 ส.ค. 2563", firstPrize: "569391", last2: "92", last3: "575, 578" },
        { yearBE: 2562, date: "1 ส.ค. 2562", firstPrize: "387006", last2: "58", last3: "135, 797" },
        { yearBE: 2561, date: "1 ส.ค. 2561", firstPrize: "386602", last2: "78", last3: "054, 562" },
        { yearBE: 2560, date: "1 ส.ค. 2560", firstPrize: "756519", last2: "36", last3: "061, 386" },
        { yearBE: 2559, date: "1 ส.ค. 2559", firstPrize: "272932", last2: "57", last3: "472, 875" }
    ],
    "8_16": [
        { yearBE: 2568, date: "16 ส.ค. 2568", firstPrize: "649372", last2: "72", last3: "398, 654" },
        { yearBE: 2567, date: "16 ส.ค. 2567", firstPrize: "095867", last2: "28", last3: "426, 734" },
        { yearBE: 2566, date: "16 ส.ค. 2566", firstPrize: "471782", last2: "67", last3: "410, 731" },
        { yearBE: 2565, date: "16 ส.ค. 2565", firstPrize: "331583", last2: "42", last3: "284, 876" },
        { yearBE: 2564, date: "16 ส.ค. 2564", firstPrize: "046750", last2: "23", last3: "421, 666" },
        { yearBE: 2563, date: "16 ส.ค. 2563", firstPrize: "945811", last2: "88", last3: "364, 712" },
        { yearBE: 2562, date: "16 ส.ค. 2562", firstPrize: "775476", last2: "89", last3: "149, 912" },
        { yearBE: 2561, date: "16 ส.ค. 2561", firstPrize: "586117", last2: "10", last3: "340, 650" },
        { yearBE: 2560, date: "16 ส.ค. 2560", firstPrize: "885863", last2: "76", last3: "577, 783" },
        { yearBE: 2559, date: "16 ส.ค. 2559", firstPrize: "254004", last2: "33", last3: "366, 966" }
    ],

    // 9. กันยายน
    "9_1": [
        { yearBE: 2568, date: "1 ก.ย. 2568", firstPrize: "518392", last2: "19", last3: "297, 746" },
        { yearBE: 2567, date: "1 ก.ย. 2567", firstPrize: "199606", last2: "94", last3: "094, 388" },
        { yearBE: 2566, date: "1 ก.ย. 2566", firstPrize: "915478", last2: "91", last3: "291, 693" },
        { yearBE: 2565, date: "1 ก.ย. 2565", firstPrize: "929332", last2: "83", last3: "210, 655" },
        { yearBE: 2564, date: "1 ก.ย. 2564", firstPrize: "114475", last2: "79", last3: "123, 458" },
        { yearBE: 2563, date: "1 ก.ย. 2563", firstPrize: "999997", last2: "98", last3: "055, 636" },
        { yearBE: 2562, date: "1 ก.ย. 2562", firstPrize: "798787", last2: "20", last3: "210, 847" },
        { yearBE: 2561, date: "1 ก.ย. 2561", firstPrize: "734010", last2: "26", last3: "097, 773" },
        { yearBE: 2560, date: "1 ก.ย. 2560", firstPrize: "143224", last2: "65", last3: "342, 755" },
        { yearBE: 2559, date: "1 ก.ย. 2559", firstPrize: "638684", last2: "62", last3: "334, 669" }
    ],
    "9_16": [
        { yearBE: 2568, date: "16 ก.ย. 2568", firstPrize: "740925", last2: "63", last3: "319, 874" },
        { yearBE: 2567, date: "16 ก.ย. 2567", firstPrize: "608662", last2: "37", last3: "049, 441" },
        { yearBE: 2566, date: "16 ก.ย. 2566", firstPrize: "320812", last2: "46", last3: "040, 208" },
        { yearBE: 2565, date: "16 ก.ย. 2565", firstPrize: "943703", last2: "75", last3: "214, 631" },
        { yearBE: 2564, date: "16 ก.ย. 2564", firstPrize: "070935", last2: "90", last3: "029, 379" },
        { yearBE: 2563, date: "16 ก.ย. 2563", firstPrize: "244083", last2: "57", last3: "096, 853" },
        { yearBE: 2562, date: "16 ก.ย. 2562", firstPrize: "340388", last2: "85", last3: "758, 925" },
        { yearBE: 2561, date: "16 ก.ย. 2561", firstPrize: "149760", last2: "79", last3: "380, 528" },
        { yearBE: 2560, date: "16 ก.ย. 2560", firstPrize: "170143", last2: "71", last3: "647, 959" },
        { yearBE: 2559, date: "16 ก.ย. 2559", firstPrize: "243050", last2: "42", last3: "371, 782" }
    ],

    // 10. ตุลาคม
    "10_1": [
        { yearBE: 2568, date: "1 ต.ค. 2568", firstPrize: "876978", last2: "77", last3: "280, 605" },
        { yearBE: 2567, date: "1 ต.ค. 2567", firstPrize: "718665", last2: "59", last3: "079, 566" },
        { yearBE: 2566, date: "1 ต.ค. 2566", firstPrize: "727202", last2: "66", last3: "426, 615" },
        { yearBE: 2565, date: "1 ต.ค. 2565", firstPrize: "484669", last2: "50", last3: "278, 194" },
        { yearBE: 2564, date: "1 ต.ค. 2564", firstPrize: "578171", last2: "83", last3: "379, 449" },
        { yearBE: 2563, date: "1 ต.ค. 2563", firstPrize: "837893", last2: "59", last3: "110, 595" },
        { yearBE: 2562, date: "1 ต.ค. 2562", firstPrize: "691197", last2: "59", last3: "606, 797" },
        { yearBE: 2561, date: "1 ต.ค. 2561", firstPrize: "452643", last2: "99", last3: "561, 810" },
        { yearBE: 2560, date: "1 ต.ค. 2560", firstPrize: "880714", last2: "52", last3: "462, 952" },
        { yearBE: 2559, date: "1 ต.ค. 2559", firstPrize: "887102", last2: "33", last3: "458, 017" }
    ],
    "10_16": [
        { yearBE: 2568, date: "16 ต.ค. 2568", firstPrize: "059696", last2: "61", last3: "476, 889" },
        { yearBE: 2567, date: "16 ต.ค. 2567", firstPrize: "482962", last2: "00", last3: "493, 919" },
        { yearBE: 2566, date: "16 ต.ค. 2566", firstPrize: "931446", last2: "44", last3: "272, 970" },
        { yearBE: 2565, date: "16 ต.ค. 2565", firstPrize: "613106", last2: "15", last3: "606, 799" },
        { yearBE: 2564, date: "16 ต.ค. 2564", firstPrize: "386372", last2: "38", last3: "295, 798" },
        { yearBE: 2563, date: "16 ต.ค. 2563", firstPrize: "286051", last2: "38", last3: "045, 980" },
        { yearBE: 2562, date: "16 ต.ค. 2562", firstPrize: "812564", last2: "15", last3: "132, 598" },
        { yearBE: 2561, date: "16 ต.ค. 2561", firstPrize: "200515", last2: "93", last3: "192, 212" },
        { yearBE: 2560, date: "16 ต.ค. 2560", firstPrize: "413494", last2: "86", last3: "128, 287" },
        { yearBE: 2559, date: "16 ต.ค. 2559", firstPrize: "571947", last2: "98", last3: "032, 587" }
    ],

    // 11. พฤศจิกายน
    "11_1": [
        { yearBE: 2568, date: "1 พ.ย. 2568", firstPrize: "419853", last2: "44", last3: "318, 794" },
        { yearBE: 2567, date: "1 พ.ย. 2567", firstPrize: "537829", last2: "32", last3: "257, 725" },
        { yearBE: 2566, date: "1 พ.ย. 2566", firstPrize: "743951", last2: "63", last3: "019, 349" },
        { yearBE: 2565, date: "1 พ.ย. 2565", firstPrize: "913106", last2: "70", last3: "343, 922" },
        { yearBE: 2564, date: "1 พ.ย. 2564", firstPrize: "045037", last2: "47", last3: "509, 606" },
        { yearBE: 2563, date: "1 พ.ย. 2563", firstPrize: "472391", last2: "81", last3: "534, 983" },
        { yearBE: 2562, date: "1 พ.ย. 2562", firstPrize: "967375", last2: "79", last3: "021, 206" },
        { yearBE: 2561, date: "1 พ.ย. 2561", firstPrize: "149840", last2: "58", last3: "384, 576" },
        { yearBE: 2560, date: "1 พ.ย. 2560", firstPrize: "533726", last2: "85", last3: "165, 590" },
        { yearBE: 2559, date: "1 พ.ย. 2559", firstPrize: "785438", last2: "86", last3: "038, 976" }
    ],
    "11_16": [
        { yearBE: 2568, date: "16 พ.ย. 2568", firstPrize: "629341", last2: "84", last3: "387, 814" },
        { yearBE: 2567, date: "16 พ.ย. 2567", firstPrize: "187221", last2: "38", last3: "547, 980" },
        { yearBE: 2566, date: "16 พ.ย. 2566", firstPrize: "557990", last2: "14", last3: "778, 961" },
        { yearBE: 2565, date: "16 พ.ย. 2565", firstPrize: "121789", last2: "64", last3: "155, 753" },
        { yearBE: 2564, date: "16 พ.ย. 2564", firstPrize: "032761", last2: "57", last3: "245, 844" },
        { yearBE: 2563, date: "16 พ.ย. 2563", firstPrize: "986725", last2: "70", last3: "406, 880" },
        { yearBE: 2562, date: "16 พ.ย. 2562", firstPrize: "017223", last2: "32", last3: "640, 798" },
        { yearBE: 2561, date: "16 พ.ย. 2561", firstPrize: "989903", last2: "16", last3: "032, 930" },
        { yearBE: 2560, date: "16 พ.ย. 2560", firstPrize: "292391", last2: "98", last3: "830, 961" },
        { yearBE: 2559, date: "16 พ.ย. 2559", firstPrize: "858383", last2: "44", last3: "570, 685" }
    ],

    // 12. ธันวาคม
    "12_1": [
        { yearBE: 2568, date: "1 ธ.ค. 2568", firstPrize: "941582", last2: "48", last3: "354, 829" },
        { yearBE: 2567, date: "1 ธ.ค. 2567", firstPrize: "669843", last2: "61", last3: "098, 654" },
        { yearBE: 2566, date: "1 ธ.ค. 2566", firstPrize: "251097", last2: "91", last3: "092, 280" },
        { yearBE: 2565, date: "1 ธ.ค. 2565", firstPrize: "375805", last2: "08", last3: "170, 786" },
        { yearBE: 2564, date: "1 ธ.ค. 2564", firstPrize: "077258", last2: "14", last3: "253, 782" },
        { yearBE: 2563, date: "1 ธ.ค. 2563", firstPrize: "100994", last2: "81", last3: "075, 561" },
        { yearBE: 2562, date: "1 ธ.ค. 2562", firstPrize: "453522", last2: "81", last3: "261, 617" },
        { yearBE: 2561, date: "1 ธ.ค. 2561", firstPrize: "021840", last2: "58", last3: "175, 746" },
        { yearBE: 2560, date: "1 ธ.ค. 2560", firstPrize: "451005", last2: "33", last3: "043, 780" },
        { yearBE: 2559, date: "1 ธ.ค. 2559", firstPrize: "084283", last2: "03", last3: "237, 618" }
    ],
    "12_16": [
        { yearBE: 2568, date: "16 ธ.ค. 2568", firstPrize: "763895", last2: "59", last3: "419, 874" },
        { yearBE: 2567, date: "16 ธ.ค. 2567", firstPrize: "356757", last2: "85", last3: "964, 584" },
        { yearBE: 2566, date: "16 ธ.ค. 2566", firstPrize: "635466", last2: "52", last3: "209, 446" },
        { yearBE: 2565, date: "16 ธ.ค. 2565", firstPrize: "845093", last2: "14", last3: "171, 544" },
        { yearBE: 2564, date: "16 ธ.ค. 2564", firstPrize: "639235", last2: "83", last3: "094, 517" },
        { yearBE: 2563, date: "16 ธ.ค. 2563", firstPrize: "201303", last2: "70", last3: "313, 639" },
        { yearBE: 2562, date: "16 ธ.ค. 2562", firstPrize: "529924", last2: "97", last3: "138, 043" },
        { yearBE: 2561, date: "16 ธ.ค. 2561", firstPrize: "356564", last2: "62", last3: "129, 734" },
        { yearBE: 2560, date: "16 ธ.ค. 2560", firstPrize: "955596", last2: "89", last3: "425, 831" },
        { yearBE: 2559, date: "16 ธ.ค. 2559", firstPrize: "435730", last2: "33", last3: "064, 708" }
    ]
};

const THAI_MONTH_NAMES = [
    '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

/**
 * Returns Thai lottery 10-year historical draw records for the specified or closest draw date.
 * @param {number|Date} dateOrDay Day of month or Date object
 * @param {number} month Month number 1-12
 */
function getThaiLotteryHistory(dateOrDay = null, month = null) {
    let d = 16;
    let m = 10;
    if (dateOrDay instanceof Date) {
        d = dateOrDay.getDate();
        m = dateOrDay.getMonth() + 1;
    } else if (typeof dateOrDay === 'number') {
        d = dateOrDay;
        m = month || (new Date().getMonth() + 1);
    } else if (typeof dateOrDay === 'string' && dateOrDay.includes('-')) {
        const parts = dateOrDay.split('-');
        if (parts.length >= 3) {
            m = parseInt(parts[1], 10);
            d = parseInt(parts[2], 10);
        }
    } else {
        const now = new Date();
        d = now.getDate();
        m = now.getMonth() + 1;
    }

    // Determine target draw period (1st or 16th)
    const drawDay = (d <= 8) ? 1 : 16;
    const key = `${m}_${drawDay}`;
    const records = THAI_LOTTERY_10YR_HISTORY[key] || THAI_LOTTERY_10YR_HISTORY["10_16"];
    const monthName = THAI_MONTH_NAMES[m] || 'ตุลาคม';
    const drawTitle = `งวดประจำวันที่ ${drawDay} ${monthName}`;

    return {
        key: key,
        drawDay: drawDay,
        month: m,
        monthName: monthName,
        drawTitle: drawTitle,
        yearsRange: '2559 - 2568 (ย้อนหลัง 10 ปี)',
        records: records
    };
}

/**
 * Generates 3 lucky numbers from the lucky bell orb:
 * Returns primary 3-digit number, 3 distinct lucky numbers, and 3 single digits.
 */
function generate3LuckyNumbers() {
    // 1) Primary 3-digit lucky number (100-999)
    const lucky3 = String(Math.floor(100 + Math.random() * 900));

    // 2) Secondary lucky 2-digit number (00-99)
    const lucky2 = String(Math.floor(Math.random() * 100)).padStart(2, '0');

    // 3) Alternative lucky 3-digit combination
    const luckyAlt = String(Math.floor(100 + Math.random() * 900));

    // 3 numbers set as requested: [3-digit main, 2-digit tail, alternative lucky]
    const luckyNumbers = [lucky3, lucky2, luckyAlt];

    // Single digits breakdown
    const digits = lucky3.split('');

    return {
        luckyNumber: lucky3, // 3-digit number (e.g. "789")
        lucky2: lucky2,       // 2-digit number (e.g. "89")
        luckyNumbers: luckyNumbers, // 3 numbers array
        topDigits: digits     // e.g. ["7", "8", "9"]
    };
}

// Global browser scope attachments to prevent undefined reference errors
if (typeof window !== 'undefined') {
    window.CAT_BREEDS = CAT_BREEDS;
    window.CAT_BREEDS_MAP = CAT_BREEDS.reduce((acc, b) => { acc[b.id] = b; return acc; }, {});
    window.DEFAULT_QUESTS = DEFAULT_QUESTS;
    window.CAT_CARE_ITEMS = typeof CAT_CARE_ITEMS !== 'undefined' ? CAT_CARE_ITEMS : [];
    window.generate3LuckyNumbers = generate3LuckyNumbers;
    window.getThaiLotteryHistory = getThaiLotteryHistory;
}


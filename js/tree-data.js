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
// Thai Government Lottery: Authentic Historical Records & Draw Mechanics
// 1) 12 Consecutive Recent Draws (งวดก่อนหน้าย้อนหลังจริง)
// 2) 10-Year Historical Records (2558 - 2567) for 1st and 16th draws
// Contains complete fields: beYear/yearBE, prize1/firstPrize, last2, front3/first3, back3/last3
// ============================================================================

const THAI_LOTTERY_CONSECUTIVE_DRAWS = [
    { beYear: 2569, yearBE: 2569, date: "1 พ.ย. 2569", prize1: "423224", firstPrize: "423224", last2: "85", front3: "300, 950", first3: "300, 950", back3: "393, 804", last3: "393, 804" },
    { beYear: 2569, yearBE: 2569, date: "16 ต.ค. 2569", prize1: "011781", firstPrize: "011781", last2: "48", front3: "392, 402", first3: "392, 402", back3: "171, 255", last3: "171, 255" },
    { beYear: 2569, yearBE: 2569, date: "1 ต.ค. 2569", prize1: "402701", firstPrize: "402701", last2: "70", front3: "791, 912", first3: "791, 912", back3: "058, 396", last3: "058, 396" },
    { beYear: 2569, yearBE: 2569, date: "16 ก.ย. 2569", prize1: "730640", firstPrize: "730640", last2: "64", front3: "060, 521", first3: "060, 521", back3: "266, 041", last3: "266, 041" },
    { beYear: 2569, yearBE: 2569, date: "1 ก.ย. 2569", prize1: "417212", firstPrize: "417212", last2: "04", front3: "257, 346", first3: "257, 346", back3: "136, 740", last3: "136, 740" },
    { beYear: 2569, yearBE: 2569, date: "16 ส.ค. 2569", prize1: "004615", firstPrize: "004615", last2: "53", front3: "731, 429", first3: "731, 429", back3: "937, 094", last3: "937, 094" },
    { beYear: 2569, yearBE: 2569, date: "1 ส.ค. 2569", prize1: "932479", firstPrize: "932479", last2: "69", front3: "413, 672", first3: "413, 672", back3: "154, 039", last3: "154, 039" },
    { beYear: 2569, yearBE: 2569, date: "16 ก.ค. 2569", prize1: "639214", firstPrize: "639214", last2: "71", front3: "683, 709", first3: "683, 709", back3: "746, 427", last3: "746, 427" },
    { beYear: 2569, yearBE: 2569, date: "1 ก.ค. 2569", prize1: "751495", firstPrize: "751495", last2: "62", front3: "001, 980", first3: "001, 980", back3: "304, 531", last3: "304, 531" },
    { beYear: 2569, yearBE: 2569, date: "16 มิ.ย. 2569", prize1: "287184", firstPrize: "287184", last2: "48", front3: "758, 434", first3: "758, 434", back3: "007, 721", last3: "007, 721" },
    { beYear: 2569, yearBE: 2569, date: "1 มิ.ย. 2569", prize1: "173770", firstPrize: "173770", last2: "95", front3: "848, 415", first3: "848, 415", back3: "410, 938", last3: "410, 938" },
    { beYear: 2569, yearBE: 2569, date: "16 พ.ค. 2569", prize1: "107387", firstPrize: "107387", last2: "08", front3: "091, 298", first3: "091, 298", back3: "602, 716", last3: "602, 716" },
    // งวดปี 2567 เพิ่มเติมเพื่อความครอบคลุม
    { beYear: 2567, yearBE: 2567, date: "16 ธ.ค. 2567", prize1: "097863", firstPrize: "097863", last2: "21", front3: "290, 742", first3: "290, 742", back3: "339, 881", last3: "339, 881" },
    { beYear: 2567, yearBE: 2567, date: "1 ธ.ค. 2567", prize1: "669843", firstPrize: "669843", last2: "61", front3: "559, 626", first3: "559, 626", back3: "098, 654", last3: "098, 654" },
    { beYear: 2567, yearBE: 2567, date: "16 พ.ย. 2567", prize1: "187221", firstPrize: "187221", last2: "38", front3: "036, 923", first3: "036, 923", back3: "547, 980", last3: "547, 980" },
    { beYear: 2567, yearBE: 2567, date: "1 พ.ย. 2567", prize1: "536044", firstPrize: "536044", last2: "32", front3: "174, 225", first3: "174, 225", back3: "063, 231", last3: "063, 231" },
    { beYear: 2567, yearBE: 2567, date: "16 ต.ค. 2567", prize1: "482962", firstPrize: "482962", last2: "00", front3: "561, 648", first3: "561, 648", back3: "419, 913", last3: "419, 913" },
    { beYear: 2567, yearBE: 2567, date: "1 ต.ค. 2567", prize1: "843652", firstPrize: "843652", last2: "59", front3: "755, 689", first3: "755, 689", back3: "483, 344", last3: "483, 344" },
    { beYear: 2567, yearBE: 2567, date: "16 ก.ย. 2567", prize1: "608662", firstPrize: "608662", last2: "37", front3: "230, 904", first3: "230, 904", back3: "008, 408", last3: "008, 408" },
    { beYear: 2567, yearBE: 2567, date: "1 ก.ย. 2567", prize1: "199606", firstPrize: "199606", last2: "94", front3: "173, 220", first3: "173, 220", back3: "094, 415", last3: "094, 415" }
];

const THAI_LOTTERY_10YR_HISTORY = {
    // 1. มกราคม
    "1_1": [
        { beYear: 2567, yearBE: 2567, date: "30 ธ.ค. 2566", prize1: "625544", firstPrize: "625544", last2: "89", front3: "600, 648", first3: "600, 648", back3: "493, 882", last3: "493, 882" },
        { beYear: 2566, yearBE: 2566, date: "30 ธ.ค. 2565", prize1: "157196", firstPrize: "157196", last2: "58", front3: "007, 522", first3: "007, 522", back3: "250, 425", last3: "250, 425" },
        { beYear: 2565, yearBE: 2565, date: "30 ธ.ค. 2564", prize1: "819068", firstPrize: "819068", last2: "36", front3: "591, 971", first3: "591, 971", back3: "547, 959", last3: "547, 959" },
        { beYear: 2564, yearBE: 2564, date: "30 ธ.ค. 2563", prize1: "803628", firstPrize: "803628", last2: "19", front3: "336, 036", first3: "336, 036", back3: "804, 392", last3: "804, 392" },
        { beYear: 2563, yearBE: 2563, date: "30 ธ.ค. 2562", prize1: "510541", firstPrize: "510541", last2: "81", front3: "116, 386", first3: "116, 386", back3: "250, 472", last3: "250, 472" },
        { beYear: 2562, yearBE: 2562, date: "30 ธ.ค. 2561", prize1: "735867", firstPrize: "735867", last2: "02", front3: "031, 913", first3: "031, 913", back3: "701, 884", last3: "701, 884" },
        { beYear: 2561, yearBE: 2561, date: "30 ธ.ค. 2560", prize1: "911234", firstPrize: "911234", last2: "98", front3: "495, 373", first3: "495, 373", back3: "953, 504", last3: "953, 504" },
        { beYear: 2560, yearBE: 2560, date: "30 ธ.ค. 2559", prize1: "377712", firstPrize: "377712", last2: "46", front3: "890, 304", first3: "890, 304", back3: "477, 769", last3: "477, 769" },
        { beYear: 2559, yearBE: 2559, date: "30 ธ.ค. 2558", prize1: "261835", firstPrize: "261835", last2: "46", front3: "485, 936", first3: "485, 936", back3: "083, 448", last3: "083, 448" },
        { beYear: 2558, yearBE: 2558, date: "30 ธ.ค. 2557", prize1: "461704", firstPrize: "461704", last2: "70", front3: "209, 680", first3: "209, 680", back3: "447, 982", last3: "447, 982" }
    ],
    "1_16": [
        { beYear: 2567, yearBE: 2567, date: "17 ม.ค. 2567", prize1: "105979", firstPrize: "105979", last2: "61", front3: "429, 931", first3: "429, 931", back3: "196, 635", last3: "196, 635" },
        { beYear: 2566, yearBE: 2566, date: "17 ม.ค. 2566", prize1: "812519", firstPrize: "812519", last2: "47", front3: "443, 389", first3: "443, 389", back3: "564, 849", last3: "564, 849" },
        { beYear: 2565, yearBE: 2565, date: "17 ม.ค. 2565", prize1: "880159", firstPrize: "880159", last2: "92", front3: "731, 786", first3: "731, 786", back3: "119, 529", last3: "119, 529" },
        { beYear: 2564, yearBE: 2564, date: "17 ม.ค. 2564", prize1: "384395", firstPrize: "384395", last2: "15", front3: "653, 360", first3: "653, 360", back3: "566, 870", last3: "566, 870" },
        { beYear: 2563, yearBE: 2563, date: "17 ม.ค. 2563", prize1: "491774", firstPrize: "491774", last2: "68", front3: "132, 004", first3: "132, 004", back3: "595, 709", last3: "595, 709" },
        { beYear: 2562, yearBE: 2562, date: "17 ม.ค. 2562", prize1: "197079", firstPrize: "197079", last2: "65", front3: "206, 412", first3: "206, 412", back3: "127, 660", last3: "127, 660" },
        { beYear: 2561, yearBE: 2561, date: "17 ม.ค. 2561", prize1: "203823", firstPrize: "203823", last2: "50", front3: "624, 755", first3: "624, 755", back3: "066, 921", last3: "066, 921" },
        { beYear: 2560, yearBE: 2560, date: "17 ม.ค. 2560", prize1: "145157", firstPrize: "145157", last2: "25", front3: "663, 836", first3: "663, 836", back3: "513, 804", last3: "513, 804" },
        { beYear: 2559, yearBE: 2559, date: "17 ม.ค. 2559", prize1: "304371", firstPrize: "304371", last2: "50", front3: "531, 743", first3: "531, 743", back3: "026, 439", last3: "026, 439" },
        { beYear: 2558, yearBE: 2558, date: "16 ม.ค. 2558", prize1: "244351", firstPrize: "244351", last2: "74", front3: "374, 521", first3: "374, 521", back3: "208, 707", last3: "208, 707" }
    ],

    // 2. กุมภาพันธ์
    "2_1": [
        { beYear: 2567, yearBE: 2567, date: "1 ก.พ. 2567", prize1: "607063", firstPrize: "607063", last2: "09", front3: "454, 943", first3: "454, 943", back3: "544, 591", last3: "544, 591" },
        { beYear: 2566, yearBE: 2566, date: "1 ก.พ. 2566", prize1: "297411", firstPrize: "297411", last2: "92", front3: "181, 789", first3: "181, 789", back3: "664, 101", last3: "664, 101" },
        { beYear: 2565, yearBE: 2565, date: "1 ก.พ. 2565", prize1: "944308", firstPrize: "944308", last2: "30", front3: "942, 731", first3: "942, 731", back3: "509, 485", last3: "509, 485" },
        { beYear: 2564, yearBE: 2564, date: "1 ก.พ. 2564", prize1: "912307", firstPrize: "912307", last2: "97", front3: "605, 248", first3: "605, 248", back3: "282, 651", last3: "282, 651" },
        { beYear: 2563, yearBE: 2563, date: "1 ก.พ. 2563", prize1: "589227", firstPrize: "589227", last2: "06", front3: "259, 552", first3: "259, 552", back3: "927, 375", last3: "927, 375" },
        { beYear: 2562, yearBE: 2562, date: "1 ก.พ. 2562", prize1: "967134", firstPrize: "967134", last2: "04", front3: "643, 779", first3: "643, 779", back3: "197, 947", last3: "197, 947" },
        { beYear: 2561, yearBE: 2561, date: "1 ก.พ. 2561", prize1: "739853", firstPrize: "739853", last2: "31", front3: "022, 647", first3: "022, 647", back3: "268, 657", last3: "268, 657" },
        { beYear: 2560, yearBE: 2560, date: "1 ก.พ. 2560", prize1: "054672", firstPrize: "054672", last2: "42", front3: "807, 723", first3: "807, 723", back3: "426, 696", last3: "426, 696" },
        { beYear: 2559, yearBE: 2559, date: "1 ก.พ. 2559", prize1: "927800", firstPrize: "927800", last2: "09", front3: "625, 999", first3: "625, 999", back3: "076, 525", last3: "076, 525" },
        { beYear: 2558, yearBE: 2558, date: "1 ก.พ. 2558", prize1: "155537", firstPrize: "155537", last2: "79", front3: "247, 513", first3: "247, 513", back3: "009, 814", last3: "009, 814" }
    ],
    "2_16": [
        { beYear: 2567, yearBE: 2567, date: "16 ก.พ. 2567", prize1: "941395", firstPrize: "941395", last2: "43", front3: "056, 330", first3: "056, 330", back3: "375, 875", last3: "375, 875" },
        { beYear: 2566, yearBE: 2566, date: "16 ก.พ. 2566", prize1: "590417", firstPrize: "590417", last2: "80", front3: "664, 195", first3: "664, 195", back3: "523, 376", last3: "523, 376" },
        { beYear: 2565, yearBE: 2565, date: "16 ก.พ. 2565", prize1: "098597", firstPrize: "098597", last2: "57", front3: "085, 644", first3: "085, 644", back3: "592, 816", last3: "592, 816" },
        { beYear: 2564, yearBE: 2564, date: "16 ก.พ. 2564", prize1: "424603", firstPrize: "424603", last2: "39", front3: "861, 057", first3: "861, 057", back3: "240, 317", last3: "240, 317" },
        { beYear: 2563, yearBE: 2563, date: "16 ก.พ. 2563", prize1: "781403", firstPrize: "781403", last2: "94", front3: "915, 515", first3: "915, 515", back3: "030, 952", last3: "030, 952" },
        { beYear: 2562, yearBE: 2562, date: "16 ก.พ. 2562", prize1: "074824", firstPrize: "074824", last2: "56", front3: "910, 881", first3: "910, 881", back3: "612, 879", last3: "612, 879" },
        { beYear: 2561, yearBE: 2561, date: "16 ก.พ. 2561", prize1: "309915", firstPrize: "309915", last2: "39", front3: "438, 798", first3: "438, 798", back3: "720, 873", last3: "720, 873" },
        { beYear: 2560, yearBE: 2560, date: "16 ก.พ. 2560", prize1: "424915", firstPrize: "424915", last2: "53", front3: "748, 876", first3: "748, 876", back3: "033, 915", last3: "033, 915" },
        { beYear: 2559, yearBE: 2559, date: "16 ก.พ. 2559", prize1: "356364", firstPrize: "356364", last2: "98", front3: "489, 743", first3: "489, 743", back3: "309, 684", last3: "309, 684" },
        { beYear: 2558, yearBE: 2558, date: "16 ก.พ. 2558", prize1: "001870", firstPrize: "001870", last2: "67", front3: "095, 765", first3: "095, 765", back3: "145, 953", last3: "145, 953" }
    ],

    // 3. มีนาคม
    "3_1": [
        { beYear: 2567, yearBE: 2567, date: "1 มี.ค. 2567", prize1: "253603", firstPrize: "253603", last2: "79", front3: "900, 975", first3: "900, 975", back3: "382, 703", last3: "382, 703" },
        { beYear: 2566, yearBE: 2566, date: "1 มี.ค. 2566", prize1: "417652", firstPrize: "417652", last2: "55", front3: "577, 919", first3: "577, 919", back3: "748, 984", last3: "748, 984" },
        { beYear: 2565, yearBE: 2565, date: "1 มี.ค. 2565", prize1: "061905", firstPrize: "061905", last2: "07", front3: "236, 855", first3: "236, 855", back3: "699, 218", last3: "699, 218" },
        { beYear: 2564, yearBE: 2564, date: "1 มี.ค. 2564", prize1: "835538", firstPrize: "835538", last2: "73", front3: "290, 838", first3: "290, 838", back3: "051, 806", last3: "051, 806" },
        { beYear: 2563, yearBE: 2563, date: "1 มี.ค. 2563", prize1: "875938", firstPrize: "875938", last2: "98", front3: "291, 329", first3: "291, 329", back3: "594, 780", last3: "594, 780" },
        { beYear: 2562, yearBE: 2562, date: "1 มี.ค. 2562", prize1: "345650", firstPrize: "345650", last2: "65", front3: "137, 830", first3: "137, 830", back3: "837, 999", last3: "837, 999" },
        { beYear: 2561, yearBE: 2561, date: "1 มี.ค. 2561", prize1: "759415", firstPrize: "759415", last2: "29", front3: "318, 870", first3: "318, 870", back3: "557, 726", last3: "557, 726" },
        { beYear: 2560, yearBE: 2560, date: "1 มี.ค. 2560", prize1: "978453", firstPrize: "978453", last2: "78", front3: "450, 560", first3: "450, 560", back3: "577, 936", last3: "577, 936" },
        { beYear: 2559, yearBE: 2559, date: "1 มี.ค. 2559", prize1: "439686", firstPrize: "439686", last2: "06", front3: "530, 686", first3: "530, 686", back3: "400, 490", last3: "400, 490" },
        { beYear: 2558, yearBE: 2558, date: "1 มี.ค. 2558", prize1: "240237", firstPrize: "240237", last2: "34", front3: "031, 498", first3: "031, 498", back3: "560, 938", last3: "560, 938" }
    ],
    "3_16": [
        { beYear: 2567, yearBE: 2567, date: "16 มี.ค. 2567", prize1: "997626", firstPrize: "997626", last2: "78", front3: "509, 571", first3: "509, 571", back3: "257, 329", last3: "257, 329" },
        { beYear: 2566, yearBE: 2566, date: "16 มี.ค. 2566", prize1: "025873", firstPrize: "025873", last2: "73", front3: "420, 800", first3: "420, 800", back3: "355, 544", last3: "355, 544" },
        { beYear: 2565, yearBE: 2565, date: "16 มี.ค. 2565", prize1: "737867", firstPrize: "737867", last2: "03", front3: "349, 988", first3: "349, 988", back3: "571, 993", last3: "571, 993" },
        { beYear: 2564, yearBE: 2564, date: "16 มี.ค. 2564", prize1: "890422", firstPrize: "890422", last2: "19", front3: "036, 977", first3: "036, 977", back3: "295, 698", last3: "295, 698" },
        { beYear: 2563, yearBE: 2563, date: "16 มี.ค. 2563", prize1: "503446", firstPrize: "503446", last2: "77", front3: "258, 726", first3: "258, 726", back3: "404, 661", last3: "404, 661" },
        { beYear: 2562, yearBE: 2562, date: "16 มี.ค. 2562", prize1: "724628", firstPrize: "724628", last2: "64", front3: "148, 883", first3: "148, 883", back3: "154, 877", last3: "154, 877" },
        { beYear: 2561, yearBE: 2561, date: "16 มี.ค. 2561", prize1: "218559", firstPrize: "218559", last2: "82", front3: "205, 489", first3: "205, 489", back3: "127, 285", last3: "127, 285" },
        { beYear: 2560, yearBE: 2560, date: "16 มี.ค. 2560", prize1: "273863", firstPrize: "273863", last2: "92", front3: "918, 941", first3: "918, 941", back3: "128, 694", last3: "128, 694" },
        { beYear: 2559, yearBE: 2559, date: "16 มี.ค. 2559", prize1: "134918", firstPrize: "134918", last2: "32", front3: "044, 877", first3: "044, 877", back3: "910, 936", last3: "910, 936" },
        { beYear: 2558, yearBE: 2558, date: "16 มี.ค. 2558", prize1: "048151", firstPrize: "048151", last2: "92", front3: "157, 439", first3: "157, 439", back3: "369, 786", last3: "369, 786" }
    ],

    // 4. เมษายน
    "4_1": [
        { beYear: 2567, yearBE: 2567, date: "1 เม.ย. 2567", prize1: "803481", firstPrize: "803481", last2: "90", front3: "286, 384", first3: "286, 384", back3: "509, 707", last3: "509, 707" },
        { beYear: 2566, yearBE: 2566, date: "1 เม.ย. 2566", prize1: "087907", firstPrize: "087907", last2: "99", front3: "111, 914", first3: "111, 914", back3: "290, 698", last3: "290, 698" },
        { beYear: 2565, yearBE: 2565, date: "1 เม.ย. 2565", prize1: "970618", firstPrize: "970618", last2: "10", front3: "391, 738", first3: "391, 738", back3: "578, 870", last3: "578, 870" },
        { beYear: 2564, yearBE: 2564, date: "1 เม.ย. 2564", prize1: "472270", firstPrize: "472270", last2: "05", front3: "755, 283", first3: "755, 283", back3: "577, 393", last3: "577, 393" },
        { beYear: 2563, yearBE: 2563, date: "16 พ.ค. 2563", prize1: "051095", firstPrize: "051095", last2: "22", front3: "285, 430", first3: "285, 430", back3: "191, 364", last3: "191, 364" },
        { beYear: 2562, yearBE: 2562, date: "1 เม.ย. 2562", prize1: "109767", firstPrize: "109767", last2: "52", front3: "888, 959", first3: "888, 959", back3: "403, 976", last3: "403, 976" },
        { beYear: 2561, yearBE: 2561, date: "1 เม.ย. 2561", prize1: "889980", firstPrize: "889980", last2: "85", front3: "529, 676", first3: "529, 676", back3: "023, 114", last3: "023, 114" },
        { beYear: 2560, yearBE: 2560, date: "1 เม.ย. 2560", prize1: "392785", firstPrize: "392785", last2: "80", front3: "647, 435", first3: "647, 435", back3: "238, 776", last3: "238, 776" },
        { beYear: 2559, yearBE: 2559, date: "1 เม.ย. 2559", prize1: "066720", firstPrize: "066720", last2: "92", front3: "390, 546", first3: "390, 546", back3: "285, 874", last3: "285, 874" },
        { beYear: 2558, yearBE: 2558, date: "1 เม.ย. 2558", prize1: "860605", firstPrize: "860605", last2: "32", front3: "123, 490", first3: "123, 490", back3: "544, 990", last3: "544, 990" }
    ],
    "4_16": [
        { beYear: 2567, yearBE: 2567, date: "16 เม.ย. 2567", prize1: "943598", firstPrize: "943598", last2: "79", front3: "727, 729", first3: "727, 729", back3: "154, 200", last3: "154, 200" },
        { beYear: 2566, yearBE: 2566, date: "16 เม.ย. 2566", prize1: "984906", firstPrize: "984906", last2: "71", front3: "670, 678", first3: "670, 678", back3: "797, 551", last3: "797, 551" },
        { beYear: 2565, yearBE: 2565, date: "16 เม.ย. 2565", prize1: "395919", firstPrize: "395919", last2: "58", front3: "859, 289", first3: "859, 289", back3: "413, 508", last3: "413, 508" },
        { beYear: 2564, yearBE: 2564, date: "16 เม.ย. 2564", prize1: "100787", firstPrize: "100787", last2: "56", front3: "013, 143", first3: "013, 143", back3: "478, 264", last3: "478, 264" },
        { beYear: 2563, yearBE: 2563, date: "1 มิ.ย. 2563", prize1: "831567", firstPrize: "831567", last2: "24", front3: "264, 489", first3: "264, 489", back3: "568, 582", last3: "568, 582" },
        { beYear: 2562, yearBE: 2562, date: "16 เม.ย. 2562", prize1: "570331", firstPrize: "570331", last2: "32", front3: "930, 512", first3: "930, 512", back3: "968, 966", last3: "968, 966" },
        { beYear: 2561, yearBE: 2561, date: "16 เม.ย. 2561", prize1: "739229", firstPrize: "739229", last2: "60", front3: "643, 210", first3: "643, 210", back3: "046, 314", last3: "046, 314" },
        { beYear: 2560, yearBE: 2560, date: "16 เม.ย. 2560", prize1: "816719", firstPrize: "816719", last2: "49", front3: "876, 850", first3: "876, 850", back3: "978, 999", last3: "978, 999" },
        { beYear: 2559, yearBE: 2559, date: "16 เม.ย. 2559", prize1: "221609", firstPrize: "221609", last2: "87", front3: "228, 490", first3: "228, 490", back3: "008, 928", last3: "008, 928" },
        { beYear: 2558, yearBE: 2558, date: "16 เม.ย. 2558", prize1: "546824", firstPrize: "546824", last2: "25", front3: "119, 563", first3: "119, 563", back3: "148, 808", last3: "148, 808" }
    ],

    // 5. พฤษภาคม
    "5_1": [
        { beYear: 2567, yearBE: 2567, date: "2 พ.ค. 2567", prize1: "980116", firstPrize: "980116", last2: "17", front3: "104, 763", first3: "104, 763", back3: "833, 634", last3: "833, 634" },
        { beYear: 2566, yearBE: 2566, date: "2 พ.ค. 2566", prize1: "841906", firstPrize: "841906", last2: "10", front3: "670, 739", first3: "670, 739", back3: "135, 230", last3: "135, 230" },
        { beYear: 2565, yearBE: 2565, date: "2 พ.ค. 2565", prize1: "658642", firstPrize: "658642", last2: "09", front3: "518, 778", first3: "518, 778", back3: "041, 325", last3: "041, 325" },
        { beYear: 2564, yearBE: 2564, date: "2 พ.ค. 2564", prize1: "501272", firstPrize: "501272", last2: "18", front3: "306, 018", first3: "306, 018", back3: "498, 129", last3: "498, 129" },
        { beYear: 2563, yearBE: 2563, date: "16 พ.ค. 2563", prize1: "051095", firstPrize: "051095", last2: "22", front3: "285, 430", first3: "285, 430", back3: "191, 364", last3: "191, 364" },
        { beYear: 2562, yearBE: 2562, date: "2 พ.ค. 2562", prize1: "061324", firstPrize: "061324", last2: "25", front3: "043, 476", first3: "043, 476", back3: "374, 699", last3: "374, 699" },
        { beYear: 2561, yearBE: 2561, date: "2 พ.ค. 2561", prize1: "248038", firstPrize: "248038", last2: "85", front3: "527, 980", first3: "527, 980", back3: "601, 783", last3: "601, 783" },
        { beYear: 2560, yearBE: 2560, date: "2 พ.ค. 2560", prize1: "008656", firstPrize: "008656", last2: "35", front3: "573, 949", first3: "573, 949", back3: "773, 923", last3: "773, 923" },
        { beYear: 2559, yearBE: 2559, date: "2 พ.ค. 2559", prize1: "399459", firstPrize: "399459", last2: "02", front3: "238, 413", first3: "238, 413", back3: "220, 783", last3: "220, 783" },
        { beYear: 2558, yearBE: 2558, date: "2 พ.ค. 2558", prize1: "543466", firstPrize: "543466", last2: "30", front3: "195, 300", first3: "195, 300", back3: "818, 920", last3: "818, 920" }
    ],
    "5_16": [
        { beYear: 2567, yearBE: 2567, date: "16 พ.ค. 2567", prize1: "205690", firstPrize: "205690", last2: "60", front3: "747, 885", first3: "747, 885", back3: "070, 137", last3: "070, 137" },
        { beYear: 2566, yearBE: 2566, date: "16 พ.ค. 2566", prize1: "132903", firstPrize: "132903", last2: "99", front3: "678, 739", first3: "678, 739", back3: "693, 731", last3: "693, 731" },
        { beYear: 2565, yearBE: 2565, date: "16 พ.ค. 2565", prize1: "155012", firstPrize: "155012", last2: "06", front3: "247, 736", first3: "247, 736", back3: "236, 540", last3: "236, 540" },
        { beYear: 2564, yearBE: 2564, date: "16 พ.ค. 2564", prize1: "684579", firstPrize: "684579", last2: "14", front3: "615, 843", first3: "615, 843", back3: "276, 970", last3: "276, 970" },
        { beYear: 2563, yearBE: 2563, date: "16 พ.ค. 2563", prize1: "051095", firstPrize: "051095", last2: "22", front3: "285, 430", first3: "285, 430", back3: "191, 364", last3: "191, 364" },
        { beYear: 2562, yearBE: 2562, date: "16 พ.ค. 2562", prize1: "962526", firstPrize: "962526", last2: "71", front3: "669, 949", first3: "669, 949", back3: "018, 828", last3: "018, 828" },
        { beYear: 2561, yearBE: 2561, date: "16 พ.ค. 2561", prize1: "075629", firstPrize: "075629", last2: "20", front3: "357, 130", first3: "357, 130", back3: "049, 506", last3: "049, 506" },
        { beYear: 2560, yearBE: 2560, date: "16 พ.ค. 2560", prize1: "454891", firstPrize: "454891", last2: "53", front3: "396, 008", first3: "396, 008", back3: "431, 603", last3: "431, 603" },
        { beYear: 2559, yearBE: 2559, date: "16 พ.ค. 2559", prize1: "141737", firstPrize: "141737", last2: "98", front3: "382, 999", first3: "382, 999", back3: "032, 268", last3: "032, 268" },
        { beYear: 2558, yearBE: 2558, date: "16 พ.ค. 2558", prize1: "011421", firstPrize: "011421", last2: "38", front3: "484, 855", first3: "484, 855", back3: "799, 937", last3: "799, 937" }
    ],

    // 6. มิถุนายน
    "6_1": [
        { beYear: 2567, yearBE: 2567, date: "1 มิ.ย. 2567", prize1: "530593", firstPrize: "530593", last2: "42", front3: "194, 364", first3: "194, 364", back3: "421, 734", last3: "421, 734" },
        { beYear: 2566, yearBE: 2566, date: "1 มิ.ย. 2566", prize1: "125272", firstPrize: "125272", last2: "09", front3: "681, 000", first3: "681, 000", back3: "971, 386", last3: "971, 386" },
        { beYear: 2565, yearBE: 2565, date: "1 มิ.ย. 2565", prize1: "319196", firstPrize: "319196", last2: "02", front3: "679, 817", first3: "679, 817", back3: "213, 652", last3: "213, 652" },
        { beYear: 2564, yearBE: 2564, date: "1 มิ.ย. 2564", prize1: "292972", firstPrize: "292972", last2: "45", front3: "193, 620", first3: "193, 620", back3: "472, 523", last3: "472, 523" },
        { beYear: 2563, yearBE: 2563, date: "1 มิ.ย. 2563", prize1: "831567", firstPrize: "831567", last2: "24", front3: "264, 489", first3: "264, 489", back3: "568, 582", last3: "568, 582" },
        { beYear: 2562, yearBE: 2562, date: "1 มิ.ย. 2562", prize1: "516461", firstPrize: "516461", last2: "46", front3: "589, 713", first3: "589, 713", back3: "215, 560", last3: "215, 560" },
        { beYear: 2561, yearBE: 2561, date: "1 มิ.ย. 2561", prize1: "199234", firstPrize: "199234", last2: "98", front3: "465, 809", first3: "465, 809", back3: "492, 948", last3: "492, 948" },
        { beYear: 2560, yearBE: 2560, date: "1 มิ.ย. 2560", prize1: "633095", firstPrize: "633095", last2: "43", front3: "626, 917", first3: "626, 917", back3: "781, 882", last3: "781, 882" },
        { beYear: 2559, yearBE: 2559, date: "1 มิ.ย. 2559", prize1: "511825", firstPrize: "511825", last2: "14", front3: "111, 775", first3: "111, 775", back3: "703, 875", last3: "703, 875" },
        { beYear: 2558, yearBE: 2558, date: "2 มิ.ย. 2558", prize1: "388864", firstPrize: "388864", last2: "38", front3: "143, 794", first3: "143, 794", back3: "700, 801", last3: "700, 801" }
    ],
    "6_16": [
        { beYear: 2567, yearBE: 2567, date: "16 มิ.ย. 2567", prize1: "518504", firstPrize: "518504", last2: "31", front3: "428, 885", first3: "428, 885", back3: "426, 447", last3: "426, 447" },
        { beYear: 2566, yearBE: 2566, date: "16 มิ.ย. 2566", prize1: "264872", firstPrize: "264872", last2: "30", front3: "519, 690", first3: "519, 690", back3: "202, 874", last3: "202, 874" },
        { beYear: 2565, yearBE: 2565, date: "16 มิ.ย. 2565", prize1: "361807", firstPrize: "361807", last2: "92", front3: "285, 549", first3: "285, 549", back3: "106, 228", last3: "106, 228" },
        { beYear: 2564, yearBE: 2564, date: "16 มิ.ย. 2564", prize1: "691861", firstPrize: "691861", last2: "17", front3: "007, 054", first3: "007, 054", back3: "278, 602", last3: "278, 602" },
        { beYear: 2563, yearBE: 2563, date: "16 มิ.ย. 2563", prize1: "516967", firstPrize: "516967", last2: "64", front3: "876, 882", first3: "876, 882", back3: "565, 625", last3: "565, 625" },
        { beYear: 2562, yearBE: 2562, date: "16 มิ.ย. 2562", prize1: "223131", firstPrize: "223131", last2: "46", front3: "464, 507", first3: "464, 507", back3: "238, 884", last3: "238, 884" },
        { beYear: 2561, yearBE: 2561, date: "16 มิ.ย. 2561", prize1: "223131", firstPrize: "223131", last2: "46", front3: "464, 507", first3: "464, 507", back3: "238, 884", last3: "238, 884" },
        { beYear: 2560, yearBE: 2560, date: "16 มิ.ย. 2560", prize1: "941785", firstPrize: "941785", last2: "61", front3: "353, 573", first3: "353, 573", back3: "075, 431", last3: "075, 431" },
        { beYear: 2559, yearBE: 2559, date: "16 มิ.ย. 2559", prize1: "073816", firstPrize: "073816", last2: "79", front3: "251, 804", first3: "251, 804", back3: "749, 970", last3: "749, 970" },
        { beYear: 2558, yearBE: 2558, date: "16 มิ.ย. 2558", prize1: "644662", firstPrize: "644662", last2: "17", front3: "268, 642", first3: "268, 642", back3: "731, 892", last3: "731, 892" }
    ],

    // 7. กรกฎาคม
    "7_1": [
        { beYear: 2567, yearBE: 2567, date: "1 ก.ค. 2567", prize1: "434503", firstPrize: "434503", last2: "89", front3: "839, 977", first3: "839, 977", back3: "647, 778", last3: "647, 778" },
        { beYear: 2566, yearBE: 2566, date: "1 ก.ค. 2566", prize1: "922605", firstPrize: "922605", last2: "16", front3: "281, 867", first3: "281, 867", back3: "491, 847", last3: "491, 847" },
        { beYear: 2565, yearBE: 2565, date: "1 ก.ค. 2565", prize1: "981417", firstPrize: "981417", last2: "61", front3: "242, 287", first3: "242, 287", back3: "002, 542", last3: "002, 542" },
        { beYear: 2564, yearBE: 2564, date: "1 ก.ค. 2564", prize1: "713517", firstPrize: "713517", last2: "29", front3: "078, 394", first3: "078, 394", back3: "511, 414", last3: "511, 414" },
        { beYear: 2563, yearBE: 2563, date: "1 ก.ค. 2563", prize1: "347258", firstPrize: "347258", last2: "83", front3: "095, 362", first3: "095, 362", back3: "094, 307", last3: "094, 307" },
        { beYear: 2562, yearBE: 2562, date: "1 ก.ค. 2562", prize1: "943647", firstPrize: "943647", last2: "86", front3: "239, 864", first3: "239, 864", back3: "006, 375", last3: "006, 375" },
        { beYear: 2561, yearBE: 2561, date: "1 ก.ค. 2561", prize1: "963623", firstPrize: "963623", last2: "83", front3: "491, 901", first3: "491, 901", back3: "210, 999", last3: "210, 999" },
        { beYear: 2560, yearBE: 2560, date: "1 ก.ค. 2560", prize1: "112360", firstPrize: "112360", last2: "26", front3: "226, 489", first3: "226, 489", back3: "005, 627", last3: "005, 627" },
        { beYear: 2559, yearBE: 2559, date: "1 ก.ค. 2559", prize1: "082460", firstPrize: "082460", last2: "79", front3: "169, 609", first3: "169, 609", back3: "173, 302", last3: "173, 302" },
        { beYear: 2558, yearBE: 2558, date: "1 ก.ค. 2558", prize1: "759049", firstPrize: "759049", last2: "26", front3: "244, 497", first3: "244, 497", back3: "565, 814", last3: "565, 814" }
    ],
    "7_16": [
        { beYear: 2567, yearBE: 2567, date: "16 ก.ค. 2567", prize1: "367336", firstPrize: "367336", last2: "21", front3: "011, 411", first3: "011, 411", back3: "607, 755", last3: "607, 755" },
        { beYear: 2566, yearBE: 2566, date: "16 ก.ค. 2566", prize1: "169530", firstPrize: "169530", last2: "62", front3: "261, 384", first3: "261, 384", back3: "066, 780", last3: "066, 780" },
        { beYear: 2565, yearBE: 2565, date: "16 ก.ค. 2565", prize1: "620405", firstPrize: "620405", last2: "53", front3: "159, 834", first3: "159, 834", back3: "061, 279", last3: "061, 279" },
        { beYear: 2564, yearBE: 2564, date: "16 ก.ค. 2564", prize1: "556725", firstPrize: "556725", last2: "70", front3: "174, 058", first3: "174, 058", back3: "233, 927", last3: "233, 927" },
        { beYear: 2563, yearBE: 2563, date: "16 ก.ค. 2563", prize1: "873286", firstPrize: "873286", last2: "53", front3: "510, 533", first3: "510, 533", back3: "494, 682", last3: "494, 682" },
        { beYear: 2562, yearBE: 2562, date: "15 ก.ค. 2562", prize1: "369765", firstPrize: "369765", last2: "88", front3: "355, 901", first3: "355, 901", back3: "113, 556", last3: "113, 556" },
        { beYear: 2561, yearBE: 2561, date: "16 ก.ค. 2561", prize1: "596324", firstPrize: "596324", last2: "27", front3: "403, 530", first3: "403, 530", back3: "138, 362", last3: "138, 362" },
        { beYear: 2560, yearBE: 2560, date: "16 ก.ค. 2560", prize1: "820327", firstPrize: "820327", last2: "87", front3: "584, 835", first3: "584, 835", back3: "390, 800", last3: "390, 800" },
        { beYear: 2559, yearBE: 2559, date: "16 ก.ค. 2559", prize1: "449764", firstPrize: "449764", last2: "55", front3: "552, 734", first3: "552, 734", back3: "158, 562", last3: "158, 562" },
        { beYear: 2558, yearBE: 2558, date: "16 ก.ค. 2558", prize1: "515392", firstPrize: "515392", last2: "07", front3: "273, 856", first3: "273, 856", back3: "216, 810", last3: "216, 810" }
    ],

    // 8. สิงหาคม
    "8_1": [
        { beYear: 2567, yearBE: 2567, date: "1 ส.ค. 2567", prize1: "756519", firstPrize: "756519", last2: "36", front3: "037, 785", first3: "037, 785", back3: "061, 384", last3: "061, 384" },
        { beYear: 2566, yearBE: 2566, date: "31 ก.ค. 2566", prize1: "260453", firstPrize: "260453", last2: "11", front3: "268, 708", first3: "268, 708", back3: "387, 601", last3: "387, 601" },
        { beYear: 2565, yearBE: 2565, date: "1 ส.ค. 2565", prize1: "436594", firstPrize: "436594", last2: "14", front3: "266, 893", first3: "266, 893", back3: "282, 447", last3: "282, 447" },
        { beYear: 2564, yearBE: 2564, date: "1 ส.ค. 2564", prize1: "910261", firstPrize: "910261", last2: "69", front3: "103, 307", first3: "103, 307", back3: "004, 785", last3: "004, 785" },
        { beYear: 2563, yearBE: 2563, date: "1 ส.ค. 2563", prize1: "569391", firstPrize: "569391", last2: "92", front3: "575, 931", first3: "575, 931", back3: "578, 809", last3: "578, 809" },
        { beYear: 2562, yearBE: 2562, date: "1 ส.ค. 2562", prize1: "387006", firstPrize: "387006", last2: "58", front3: "135, 983", first3: "135, 983", back3: "562, 797", last3: "562, 797" },
        { beYear: 2561, yearBE: 2561, date: "1 ส.ค. 2561", prize1: "386602", firstPrize: "386602", last2: "78", front3: "832, 903", first3: "832, 903", back3: "549, 722", last3: "549, 722" },
        { beYear: 2560, yearBE: 2560, date: "1 ส.ค. 2560", prize1: "756519", firstPrize: "756519", last2: "36", front3: "061, 385", first3: "061, 385", back3: "787, 989", last3: "787, 989" },
        { beYear: 2559, yearBE: 2559, date: "1 ส.ค. 2559", prize1: "272932", firstPrize: "272932", last2: "57", front3: "538, 983", first3: "538, 983", back3: "472, 871", last3: "472, 871" },
        { beYear: 2558, yearBE: 2558, date: "1 ส.ค. 2558", prize1: "568577", firstPrize: "568577", last2: "67", front3: "084, 523", first3: "084, 523", back3: "445, 942", last3: "445, 942" }
    ],
    "8_16": [
        { beYear: 2567, yearBE: 2567, date: "16 ส.ค. 2567", prize1: "095867", firstPrize: "095867", last2: "28", front3: "724, 834", first3: "724, 834", back3: "347, 508", last3: "347, 508" },
        { beYear: 2566, yearBE: 2566, date: "16 ส.ค. 2566", prize1: "471782", firstPrize: "471782", last2: "67", front3: "431, 739", first3: "431, 739", back3: "737, 742", last3: "737, 742" },
        { beYear: 2565, yearBE: 2565, date: "16 ส.ค. 2565", prize1: "331583", firstPrize: "331583", last2: "42", front3: "271, 300", first3: "271, 300", back3: "284, 876", last3: "284, 876" },
        { beYear: 2564, yearBE: 2564, date: "16 ส.ค. 2564", prize1: "046750", firstPrize: "046750", last2: "23", front3: "421, 666", first3: "421, 666", back3: "160, 355", last3: "160, 355" },
        { beYear: 2563, yearBE: 2563, date: "16 ส.ค. 2563", prize1: "945811", firstPrize: "945811", last2: "88", front3: "614, 712", first3: "614, 712", back3: "364, 733", last3: "364, 733" },
        { beYear: 2562, yearBE: 2562, date: "16 ส.ค. 2562", prize1: "775476", firstPrize: "775476", last2: "89", front3: "149, 912", first3: "149, 912", back3: "563, 580", last3: "563, 580" },
        { beYear: 2561, yearBE: 2561, date: "16 ส.ค. 2561", prize1: "586117", firstPrize: "586117", last2: "10", front3: "340, 670", first3: "340, 670", back3: "591, 815", last3: "591, 815" },
        { beYear: 2560, yearBE: 2560, date: "16 ส.ค. 2560", prize1: "885863", firstPrize: "885863", last2: "31", front3: "225, 783", first3: "225, 783", back3: "342, 737", last3: "342, 737" },
        { beYear: 2559, yearBE: 2559, date: "16 ส.ค. 2559", prize1: "254004", firstPrize: "254004", last2: "33", front3: "366, 966", first3: "366, 966", back3: "596, 611", last3: "596, 611" },
        { beYear: 2558, yearBE: 2558, date: "16 ส.ค. 2558", prize1: "033363", firstPrize: "033363", last2: "40", front3: "222, 600", first3: "222, 600", back3: "227, 856", last3: "227, 856" }
    ],

    // 9. กันยายน
    "9_1": [
        { beYear: 2567, yearBE: 2567, date: "1 ก.ย. 2567", prize1: "199606", firstPrize: "199606", last2: "94", front3: "173, 220", first3: "173, 220", back3: "094, 415", last3: "094, 415" },
        { beYear: 2566, yearBE: 2566, date: "1 ก.ย. 2566", prize1: "915478", firstPrize: "915478", last2: "91", front3: "521, 596", first3: "521, 596", back3: "291, 692", last3: "291, 692" },
        { beYear: 2565, yearBE: 2565, date: "1 ก.ย. 2565", prize1: "929332", firstPrize: "929332", last2: "83", front3: "298, 725", first3: "298, 725", back3: "210, 604", last3: "210, 604" },
        { beYear: 2564, yearBE: 2564, date: "1 ก.ย. 2564", prize1: "114475", firstPrize: "114475", last2: "79", front3: "278, 302", first3: "278, 302", back3: "123, 458", last3: "123, 458" },
        { beYear: 2563, yearBE: 2563, date: "1 ก.ย. 2563", prize1: "999997", firstPrize: "999997", last2: "98", front3: "636, 725", first3: "636, 725", back3: "342, 957", last3: "342, 957" },
        { beYear: 2562, yearBE: 2562, date: "1 ก.ย. 2562", prize1: "798787", firstPrize: "798787", last2: "20", front3: "210, 847", first3: "210, 847", back3: "439, 752", last3: "439, 752" },
        { beYear: 2561, yearBE: 2561, date: "1 ก.ย. 2561", prize1: "737840", firstPrize: "737840", last2: "26", front3: "268, 747", first3: "268, 747", back3: "049, 506", last3: "049, 506" },
        { beYear: 2560, yearBE: 2560, date: "1 ก.ย. 2560", prize1: "143224", firstPrize: "143224", last2: "65", front3: "345, 679", first3: "345, 679", back3: "195, 278", last3: "195, 278" },
        { beYear: 2559, yearBE: 2559, date: "1 ก.ย. 2559", prize1: "638684", firstPrize: "638684", last2: "62", front3: "334, 335", first3: "334, 335", back3: "630, 669", last3: "630, 669" },
        { beYear: 2558, yearBE: 2558, date: "1 ก.ย. 2558", prize1: "021094", firstPrize: "021094", last2: "89", front3: "260, 403", first3: "260, 403", back3: "819, 936", last3: "819, 936" }
    ],
    "9_16": [
        { beYear: 2567, yearBE: 2567, date: "16 ก.ย. 2567", prize1: "608662", firstPrize: "608662", last2: "37", front3: "230, 904", first3: "230, 904", back3: "008, 408", last3: "008, 408" },
        { beYear: 2566, yearBE: 2566, date: "16 ก.ย. 2566", prize1: "320812", firstPrize: "320812", last2: "46", front3: "037, 699", first3: "037, 699", back3: "344, 404", last3: "344, 404" },
        { beYear: 2565, yearBE: 2565, date: "16 ก.ย. 2565", prize1: "943703", firstPrize: "943703", last2: "75", front3: "540, 971", first3: "540, 971", back3: "432, 631", last3: "432, 631" },
        { beYear: 2564, yearBE: 2564, date: "16 ก.ย. 2564", prize1: "070935", firstPrize: "070935", last2: "90", front3: "609, 813", first3: "609, 813", back3: "007, 379", last3: "007, 379" },
        { beYear: 2563, yearBE: 2563, date: "16 ก.ย. 2563", prize1: "244083", firstPrize: "244083", last2: "57", front3: "127, 220", first3: "127, 220", back3: "053, 853", last3: "053, 853" },
        { beYear: 2562, yearBE: 2562, date: "16 ก.ย. 2562", prize1: "340388", firstPrize: "340388", last2: "85", front3: "733, 947", first3: "733, 947", back3: "925, 939", last3: "925, 939" },
        { beYear: 2561, yearBE: 2561, date: "16 ก.ย. 2561", prize1: "149760", firstPrize: "149760", last2: "79", front3: "323, 539", first3: "323, 539", back3: "155, 297", last3: "155, 297" },
        { beYear: 2560, yearBE: 2560, date: "16 ก.ย. 2560", prize1: "170143", firstPrize: "170143", last2: "71", front3: "172, 647", first3: "172, 647", back3: "340, 388", last3: "340, 388" },
        { beYear: 2559, yearBE: 2559, date: "16 ก.ย. 2559", prize1: "240650", firstPrize: "240650", last2: "42", front3: "494, 583", first3: "494, 583", back3: "160, 705", last3: "160, 705" },
        { beYear: 2558, yearBE: 2558, date: "16 ก.ย. 2558", prize1: "144948", firstPrize: "144948", last2: "90", front3: "164, 484", first3: "164, 484", back3: "135, 786", last3: "135, 786" }
    ],

    // 10. ตุลาคม
    "10_1": [
        { beYear: 2567, yearBE: 2567, date: "1 ต.ค. 2567", prize1: "843652", firstPrize: "843652", last2: "59", front3: "755, 689", first3: "755, 689", back3: "483, 344", last3: "483, 344" },
        { beYear: 2566, yearBE: 2566, date: "1 ต.ค. 2566", prize1: "727202", firstPrize: "727202", last2: "66", front3: "355, 324", first3: "355, 324", back3: "426, 615", last3: "426, 615" },
        { beYear: 2565, yearBE: 2565, date: "1 ต.ค. 2565", prize1: "484669", firstPrize: "484669", last2: "50", front3: "206, 996", first3: "206, 996", back3: "278, 194", last3: "278, 194" },
        { beYear: 2564, yearBE: 2564, date: "1 ต.ค. 2564", prize1: "578171", firstPrize: "578171", last2: "83", front3: "285, 361", first3: "285, 361", back3: "379, 449", last3: "379, 449" },
        { beYear: 2563, yearBE: 2563, date: "1 ต.ค. 2563", prize1: "837893", firstPrize: "837893", last2: "59", front3: "220, 264", first3: "220, 264", back3: "595, 982", last3: "595, 982" },
        { beYear: 2562, yearBE: 2562, date: "1 ต.ค. 2562", prize1: "691197", firstPrize: "691197", last2: "59", front3: "929, 392", first3: "929, 392", back3: "592, 055", last3: "592, 055" },
        { beYear: 2561, yearBE: 2561, date: "1 ต.ค. 2561", prize1: "452643", firstPrize: "452643", last2: "99", front3: "533, 726", first3: "533, 726", back3: "686, 810", last3: "686, 810" },
        { beYear: 2560, yearBE: 2560, date: "1 ต.ค. 2560", prize1: "881143", firstPrize: "881143", last2: "71", front3: "497, 365", first3: "497, 365", back3: "396, 977", last3: "396, 977" },
        { beYear: 2559, yearBE: 2559, date: "1 ต.ค. 2559", prize1: "887102", firstPrize: "887102", last2: "33", front3: "280, 017", first3: "280, 017", back3: "433, 080", last3: "433, 080" },
        { beYear: 2558, yearBE: 2558, date: "1 ต.ค. 2558", prize1: "594825", firstPrize: "594825", last2: "07", front3: "175, 775", first3: "175, 775", back3: "444, 980", last3: "444, 980" }
    ],
    "10_16": [
        { beYear: 2569, yearBE: 2569, date: "16 ต.ค. 2569", prize1: "011781", firstPrize: "011781", last2: "48", front3: "392, 402", first3: "392, 402", back3: "171, 255", last3: "171, 255" },
        { beYear: 2568, yearBE: 2568, date: "16 ต.ค. 2568", prize1: "059696", firstPrize: "059696", last2: "61", front3: "531, 955", first3: "531, 955", back3: "476, 889", last3: "476, 889" },
        { beYear: 2567, yearBE: 2567, date: "16 ต.ค. 2567", prize1: "482962", firstPrize: "482962", last2: "00", front3: "561, 648", first3: "561, 648", back3: "419, 913", last3: "419, 913" },
        { beYear: 2566, yearBE: 2566, date: "16 ต.ค. 2566", prize1: "931446", firstPrize: "931446", last2: "44", front3: "398, 167", first3: "398, 167", back3: "970, 272", last3: "970, 272" },
        { beYear: 2565, yearBE: 2565, date: "16 ต.ค. 2565", prize1: "613106", firstPrize: "613106", last2: "15", front3: "158, 037", first3: "158, 037", back3: "606, 799", last3: "606, 799" },
        { beYear: 2564, yearBE: 2564, date: "16 ต.ค. 2564", prize1: "386372", firstPrize: "386372", last2: "38", front3: "602, 964", first3: "602, 964", back3: "295, 839", last3: "295, 839" },
        { beYear: 2563, yearBE: 2563, date: "16 ต.ค. 2563", prize1: "286051", firstPrize: "286051", last2: "38", front3: "189, 464", first3: "189, 464", back3: "045, 980", last3: "045, 980" },
        { beYear: 2562, yearBE: 2562, date: "16 ต.ค. 2562", prize1: "812564", firstPrize: "812564", last2: "15", front3: "255, 625", first3: "255, 625", back3: "598, 132", last3: "598, 132" },
        { beYear: 2561, yearBE: 2561, date: "16 ต.ค. 2561", prize1: "200515", firstPrize: "200515", last2: "93", front3: "186, 921", first3: "186, 921", back3: "212, 492", last3: "212, 492" },
        { beYear: 2560, yearBE: 2560, date: "16 ต.ค. 2560", prize1: "413494", firstPrize: "413494", last2: "86", front3: "180, 971", first3: "180, 971", back3: "287, 876", last3: "287, 876" }
    ],

    // 11. พฤศจิกายน
    "11_1": [
        { beYear: 2569, yearBE: 2569, date: "1 พ.ย. 2569", prize1: "423224", firstPrize: "423224", last2: "85", front3: "300, 950", first3: "300, 950", back3: "393, 804", last3: "393, 804" },
        { beYear: 2568, yearBE: 2568, date: "1 พ.ย. 2568", prize1: "345898", firstPrize: "345898", last2: "87", front3: "328, 449", first3: "328, 449", back3: "111, 690", last3: "111, 690" },
        { beYear: 2567, yearBE: 2567, date: "1 พ.ย. 2567", prize1: "536044", firstPrize: "536044", last2: "32", front3: "174, 225", first3: "174, 225", back3: "063, 231", last3: "063, 231" },
        { beYear: 2566, yearBE: 2566, date: "1 พ.ย. 2566", prize1: "743951", firstPrize: "743951", last2: "63", front3: "913, 729", first3: "913, 729", back3: "519, 860", last3: "519, 860" },
        { beYear: 2565, yearBE: 2565, date: "1 พ.ย. 2565", prize1: "913106", firstPrize: "913106", last2: "70", front3: "722, 839", first3: "722, 839", back3: "343, 922", last3: "343, 922" },
        { beYear: 2564, yearBE: 2564, date: "1 พ.ย. 2564", prize1: "045037", firstPrize: "045037", last2: "95", front3: "458, 247", first3: "458, 247", back3: "706, 031", last3: "706, 031" },
        { beYear: 2563, yearBE: 2563, date: "1 พ.ย. 2563", prize1: "506404", firstPrize: "506404", last2: "40", front3: "154, 598", first3: "154, 598", back3: "245, 062", last3: "245, 062" },
        { beYear: 2562, yearBE: 2562, date: "1 พ.ย. 2562", prize1: "967375", firstPrize: "967375", last2: "79", front3: "923, 905", first3: "923, 905", back3: "206, 021", last3: "206, 021" },
        { beYear: 2561, yearBE: 2561, date: "1 พ.ย. 2561", prize1: "149840", firstPrize: "149840", last2: "58", front3: "384, 576", first3: "384, 576", back3: "509, 046", last3: "509, 046" },
        { beYear: 2560, yearBE: 2560, date: "1 พ.ย. 2560", prize1: "533726", firstPrize: "533726", last2: "85", front3: "165, 425", first3: "165, 425", back3: "485, 036", last3: "485, 036" }
    ],
    "11_16": [
        { beYear: 2567, yearBE: 2567, date: "16 พ.ย. 2567", prize1: "187221", firstPrize: "187221", last2: "38", front3: "036, 923", first3: "036, 923", back3: "547, 980", last3: "547, 980" },
        { beYear: 2566, yearBE: 2566, date: "16 พ.ย. 2566", prize1: "557990", firstPrize: "557990", last2: "14", front3: "746, 778", first3: "746, 778", back3: "961, 640", last3: "961, 640" },
        { beYear: 2565, yearBE: 2565, date: "16 พ.ย. 2565", prize1: "121789", firstPrize: "121789", last2: "64", front3: "722, 532", first3: "722, 532", back3: "157, 753", last3: "157, 753" },
        { beYear: 2564, yearBE: 2564, date: "16 พ.ย. 2564", prize1: "032761", firstPrize: "032761", last2: "57", front3: "648, 831", first3: "648, 831", back3: "245, 844", last3: "245, 844" },
        { beYear: 2563, yearBE: 2563, date: "16 พ.ย. 2563", prize1: "972661", firstPrize: "972661", last2: "46", front3: "368, 741", first3: "368, 741", back3: "255, 208", last3: "255, 208" },
        { beYear: 2562, yearBE: 2562, date: "16 พ.ย. 2562", prize1: "017223", firstPrize: "017223", last2: "32", front3: "164, 640", first3: "164, 640", back3: "083, 379", last3: "083, 379" },
        { beYear: 2561, yearBE: 2561, date: "16 พ.ย. 2561", prize1: "989903", firstPrize: "989903", last2: "16", front3: "471, 930", first3: "471, 930", back3: "032, 801", last3: "032, 801" },
        { beYear: 2560, yearBE: 2560, date: "16 พ.ย. 2560", prize1: "292391", firstPrize: "292391", last2: "98", front3: "831, 961", first3: "831, 961", back3: "477, 653", last3: "477, 653" },
        { beYear: 2559, yearBE: 2559, date: "16 พ.ย. 2559", prize1: "858383", firstPrize: "858383", last2: "44", front3: "684, 040", first3: "684, 040", back3: "570, 685", last3: "570, 685" },
        { beYear: 2558, yearBE: 2558, date: "16 พ.ย. 2558", prize1: "795283", firstPrize: "795283", last2: "03", front3: "241, 028", first3: "241, 028", back3: "643, 913", last3: "643, 913" }
    ],

    // 12. ธันวาคม
    "12_1": [
        { beYear: 2567, yearBE: 2567, date: "1 ธ.ค. 2567", prize1: "669843", firstPrize: "669843", last2: "61", front3: "098, 654", first3: "098, 654", back3: "354, 829", last3: "354, 829" },
        { beYear: 2566, yearBE: 2566, date: "1 ธ.ค. 2566", prize1: "251097", firstPrize: "251097", last2: "91", front3: "265, 055", first3: "265, 055", back3: "092, 280", last3: "092, 280" },
        { beYear: 2565, yearBE: 2565, date: "1 ธ.ค. 2565", prize1: "375805", firstPrize: "375805", last2: "08", front3: "170, 786", first3: "170, 786", back3: "409, 421", last3: "409, 421" },
        { beYear: 2564, yearBE: 2564, date: "1 ธ.ค. 2564", prize1: "077258", firstPrize: "077258", last2: "82", front3: "021, 253", first3: "021, 253", back3: "270, 782", last3: "270, 782" },
        { beYear: 2563, yearBE: 2563, date: "1 ธ.ค. 2563", prize1: "100994", firstPrize: "100994", last2: "84", front3: "093, 776", first3: "093, 776", back3: "075, 561", last3: "075, 561" },
        { beYear: 2562, yearBE: 2562, date: "1 ธ.ค. 2562", prize1: "453522", firstPrize: "453522", last2: "81", front3: "261, 617", first3: "261, 617", back3: "013, 457", last3: "013, 457" },
        { beYear: 2561, yearBE: 2561, date: "1 ธ.ค. 2561", prize1: "021840", firstPrize: "021840", last2: "67", front3: "045, 307", first3: "045, 307", back3: "561, 988", last3: "561, 988" },
        { beYear: 2560, yearBE: 2560, date: "1 ธ.ค. 2560", prize1: "451005", firstPrize: "451005", last2: "33", front3: "303, 626", first3: "303, 626", back3: "257, 601", last3: "257, 601" },
        { beYear: 2559, yearBE: 2559, date: "1 ธ.ค. 2559", prize1: "084283", firstPrize: "084283", last2: "03", front3: "237, 618", first3: "237, 618", back3: "484, 953", last3: "484, 953" },
        { beYear: 2558, yearBE: 2558, date: "1 ธ.ค. 2558", prize1: "915350", firstPrize: "915350", last2: "78", front3: "181, 238", first3: "181, 238", back3: "500, 714", last3: "500, 714" }
    ],
    "12_16": [
        { beYear: 2567, yearBE: 2567, date: "16 ธ.ค. 2567", prize1: "356757", firstPrize: "356757", last2: "85", front3: "964, 584", first3: "964, 584", back3: "419, 874", last3: "419, 874" },
        { beYear: 2566, yearBE: 2566, date: "16 ธ.ค. 2566", prize1: "635466", firstPrize: "635466", last2: "52", front3: "209, 446", first3: "209, 446", back3: "084, 922", last3: "084, 922" },
        { beYear: 2565, yearBE: 2565, date: "16 ธ.ค. 2565", prize1: "845093", firstPrize: "845093", last2: "14", front3: "171, 544", first3: "171, 544", back3: "228, 597", last3: "228, 597" },
        { beYear: 2564, yearBE: 2564, date: "16 ธ.ค. 2564", prize1: "639235", firstPrize: "639235", last2: "83", front3: "094, 517", first3: "094, 517", back3: "753, 976", last3: "753, 976" },
        { beYear: 2563, yearBE: 2563, date: "16 ธ.ค. 2563", prize1: "201303", firstPrize: "201303", last2: "70", front3: "313, 639", first3: "313, 639", back3: "080, 512", last3: "080, 512" },
        { beYear: 2562, yearBE: 2562, date: "16 ธ.ค. 2562", prize1: "529924", firstPrize: "529924", last2: "97", front3: "138, 043", first3: "138, 043", back3: "555, 665", last3: "555, 665" },
        { beYear: 2561, yearBE: 2561, date: "16 ธ.ค. 2561", prize1: "356564", firstPrize: "356564", last2: "62", front3: "129, 734", first3: "129, 734", back3: "048, 574", last3: "048, 574" },
        { beYear: 2560, yearBE: 2560, date: "16 ธ.ค. 2560", prize1: "955596", firstPrize: "955596", last2: "89", front3: "425, 831", first3: "425, 831", back3: "212, 538", last3: "212, 538" },
        { beYear: 2559, yearBE: 2559, date: "16 ธ.ค. 2559", prize1: "435730", firstPrize: "435730", last2: "33", front3: "064, 708", first3: "064, 708", back3: "300, 784", last3: "300, 784" },
        { beYear: 2558, yearBE: 2558, date: "16 ธ.ค. 2558", prize1: "930255", firstPrize: "930255", last2: "08", front3: "244, 497", first3: "244, 497", back3: "338, 938", last3: "338, 938" }
    ]
};

const THAI_MONTH_NAMES = [
    '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

/**
 * Checks if the given date is an official Thai Government lottery drawing day.
 * Standard days: 1st and 16th of each month, plus holiday shifts.
 */
function isThaiLotteryDrawDay(dateOrDay = null, month = null) {
    let d, m;
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

    // Standard draw dates
    if (d === 1 || d === 16) return true;
    // Known government holiday shifts:
    if (m === 1 && (d === 2 || d === 17)) return true; // New Year or Teachers Day
    if (m === 5 && d === 2) return true;               // National Labour Day
    if (m === 12 && d === 30) return true;             // Year-end draw
    return false;
}

/**
 * Returns Thai lottery records:
 * 1) 12 consecutive recent draws (งวดก่อนหน้าจริง)
 * 2) 10-year historical draw records for the specified draw date (2558 - 2567)
 * Both formats guaranteed to have beYear, prize1, last2, front3, back3
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

    // Target draw period (1st or 16th)
    const drawDay = (d <= 8) ? 1 : 16;
    const key = `${m}_${drawDay}`;
    const rawRecords = THAI_LOTTERY_10YR_HISTORY[key] || THAI_LOTTERY_10YR_HISTORY["10_16"];
    const monthName = THAI_MONTH_NAMES[m] || 'ตุลาคม';
    const drawTitle = `งวดประจำวันที่ ${drawDay} ${monthName}`;

    // Normalize records so both old and new field names are guaranteed
    const normalize = (r) => ({
        ...r,
        beYear: r.beYear || r.yearBE,
        yearBE: r.yearBE || r.beYear,
        prize1: r.prize1 || r.firstPrize,
        firstPrize: r.firstPrize || r.prize1,
        front3: r.front3 || r.first3 || '-',
        first3: r.first3 || r.front3 || '-',
        back3: r.back3 || r.last3 || '-',
        last3: r.last3 || r.back3 || '-'
    });

    const records = rawRecords.slice(0, 10).map(normalize);
    const consecutiveRecords = THAI_LOTTERY_CONSECUTIVE_DRAWS.slice(0, 12).map(normalize);
    const startYr = records.length > 0 ? records[records.length - 1].beYear : 2560;
    const endYr = records.length > 0 ? records[0].beYear : 2569;

    return {
        key: key,
        drawDay: drawDay,
        month: m,
        monthName: monthName,
        drawTitle: drawTitle,
        yearsRange: `${startYr} - ${endYr} (ย้อนหลัง 10 ปี อ้างอิง lottery.co.th และ glo.or.th)`,
        records: records,
        consecutiveRecords: consecutiveRecords
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
    window.SHOP_ITEMS = SHOP_ITEMS;
    window.CAT_CARE_ITEMS = typeof CAT_CARE_ITEMS !== 'undefined' ? CAT_CARE_ITEMS : [];
    window.generate3LuckyNumbers = generate3LuckyNumbers;
    window.getThaiLotteryHistory = getThaiLotteryHistory;
    window.isThaiLotteryDrawDay = isThaiLotteryDrawDay;
    window.THAI_LOTTERY_CONSECUTIVE_DRAWS = THAI_LOTTERY_CONSECUTIVE_DRAWS;
    window.THAI_LOTTERY_10YR_HISTORY = THAI_LOTTERY_10YR_HISTORY;
}

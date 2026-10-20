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
        title: 'ตอบคำถามทายใจประจำวัน',
        detail: 'ร่วมตอบควิซประจำวันวัดความรู้ใจกับคนรัก',
        reward: 30,
        category: 'quiz',
        targetView: 'view-quiz'
    }
];

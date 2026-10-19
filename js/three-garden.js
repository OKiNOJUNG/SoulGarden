// 3D Cute Pixar-Style Cat Visualization using Three.js (High-Fidelity Smooth Rig)
// Designed from reference: Large expressive cartoon eyes, chubby cheeks, sweet smile, whiskers,
// curved S-tail with ring stripes, 4 cute paw toes, and breed-specific markings (10 breeds).

class Garden3D {
    constructor(canvasContainerId) {
        this.container = document.getElementById(canvasContainerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Cat 3D Rig Groups
        this.catGroup = null;
        this.headGroup = null;
        this.bodyMesh = null;
        this.chestMesh = null;
        this.frontLeftLeg = null;
        this.frontRightLeg = null;
        this.backLeftLeg = null;
        this.backRightLeg = null;
        this.tailGroup = null;
        this.tailSegments = [];
        this.eyesGroup = null;
        this.leftEyeMesh = null;
        this.rightEyeMesh = null;
        this.leftEyelid = null;
        this.rightEyelid = null;
        this.collarBell = null;
        this.sicknessGroup = null;
        this.emptyBedGroup = null;

        this.islandMesh = null;
        this.particleSystems = [];
        this.clock = new THREE.Clock();
        this.isInteracting = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.currentBreed = 'orange_tabby';
        this.growthPercent = 25;
        this.hasCat = false;

        // Animation State Machine: 'walk', 'sit', 'jump', 'sleep', 'smile'
        this.animState = 'sit';
        this.animTimer = 0;
        this.walkPathAngle = 0;
        this.jumpHeight = 0;
        this.breathPhase = 0;

        if (this.container) {
            this.init();
        }
    }

    init() {
        const width = this.container.clientWidth || 360;
        const height = this.container.clientHeight || 320;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0xFFF9F5, 0.035);

        this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
        this.camera.position.set(0, 2.5, 6.4);
        this.camera.lookAt(0, 1.05, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);

        // Warm Cinematic Studio Lighting (Enhances Pixar character feel)
        const ambientLight = new THREE.AmbientLight(0xFFF8EE, 0.95);
        this.scene.add(ambientLight);

        // Key Light (Warm soft sunlight)
        const keyLight = new THREE.DirectionalLight(0xFFF4E6, 1.35);
        keyLight.position.set(4, 8, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.bias = -0.0005;
        this.scene.add(keyLight);

        // Fill Light (Soft peach/mint bounce)
        const fillLight = new THREE.DirectionalLight(0xE3F2FD, 0.55);
        fillLight.position.set(-4, 3, -3);
        this.scene.add(fillLight);

        // Rim Light (Back light for fluffy silhouette glow)
        const rimLight = new THREE.PointLight(0xFFD54F, 0.8, 15);
        rimLight.position.set(0, 4, -4);
        this.scene.add(rimLight);

        // Pedestal Island
        this.createCatPedestal();

        // Cat Root Group
        this.catGroup = new THREE.Group();
        this.scene.add(this.catGroup);

        // Sickness Indicator Group
        this.sicknessGroup = new THREE.Group();
        this.scene.add(this.sicknessGroup);

        // Empty adoption bed group
        this.emptyBedGroup = new THREE.Group();
        this.scene.add(this.emptyBedGroup);

        this.setupControls();
        window.addEventListener('resize', () => this.onResize());
        this.animate();
    }

    createCatPedestal() {
        const island = new THREE.Group();

        // Round grassy play cushion
        const cushionGeo = new THREE.CylinderGeometry(2.35, 2.05, 0.45, 48);
        const cushionMat = new THREE.MeshStandardMaterial({
            color: 0xFFE0B2,
            roughness: 0.65,
            metalness: 0.05
        });
        const cushion = new THREE.Mesh(cushionGeo, cushionMat);
        cushion.position.y = -0.22;
        cushion.receiveShadow = true;
        island.add(cushion);

        // Soft pastel rug center
        const rugGeo = new THREE.CircleGeometry(1.95, 40);
        const rugMat = new THREE.MeshStandardMaterial({
            color: 0xFFF8F0,
            roughness: 0.85
        });
        const rug = new THREE.Mesh(rugGeo, rugMat);
        rug.rotation.x = -Math.PI / 2;
        rug.position.y = 0.01;
        rug.receiveShadow = true;
        island.add(rug);

        // Decorative pastel paw prints on rug edge
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const pawGeo = new THREE.SphereGeometry(0.08, 16, 16);
            const pawMat = new THREE.MeshStandardMaterial({ color: 0xFFAB91, roughness: 0.8 });
            const paw = new THREE.Mesh(pawGeo, pawMat);
            paw.position.set(Math.cos(angle) * 1.45, 0.02, Math.sin(angle) * 1.45);
            paw.scale.set(1, 0.2, 1);
            island.add(paw);
        }

        this.islandMesh = island;
        this.scene.add(island);
    }

    // Display Empty Bed Waiting For Adoption
    showEmptyAdoptionBed() {
        this.hasCat = false;
        while (this.catGroup.children.length > 0) {
            this.catGroup.remove(this.catGroup.children[0]);
        }
        while (this.emptyBedGroup.children.length > 0) {
            this.emptyBedGroup.remove(this.emptyBedGroup.children[0]);
        }

        // Cozy plush basket
        const basketGeo = new THREE.TorusGeometry(1.0, 0.28, 24, 40);
        const basketMat = new THREE.MeshStandardMaterial({ color: 0xFFCC80, roughness: 0.7 });
        const basket = new THREE.Mesh(basketGeo, basketMat);
        basket.rotation.x = Math.PI / 2;
        basket.position.y = 0.25;
        this.emptyBedGroup.add(basket);

        // Soft pink cloud pillow inside
        const pillowGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.25, 32);
        const pillowMat = new THREE.MeshStandardMaterial({ color: 0xFFCDD2, roughness: 0.6 });
        const pillow = new THREE.Mesh(pillowGeo, pillowMat);
        pillow.position.y = 0.2;
        this.emptyBedGroup.add(pillow);

        // Floating glowing heart placeholder above bed
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0.3);
        heartShape.bezierCurveTo(0, 0.5, -0.4, 0.75, -0.4, 0.4);
        heartShape.bezierCurveTo(-0.4, 0.2, -0.2, 0.05, 0, -0.3);
        heartShape.bezierCurveTo(0.2, 0.05, 0.4, 0.2, 0.4, 0.4);
        heartShape.bezierCurveTo(0.4, 0.75, 0, 0.5, 0, 0.3);

        const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelSegments: 3, steps: 2, bevelSize: 0.08, bevelThickness: 0.08 };
        const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
        const heartMat = new THREE.MeshStandardMaterial({
            color: 0xFF5376,
            roughness: 0.2,
            metalness: 0.3,
            emissive: 0xFF5376,
            emissiveIntensity: 0.25
        });
        const heartMesh = new THREE.Mesh(heartGeo, heartMat);
        heartMesh.scale.set(0.65, 0.65, 0.65);
        heartMesh.position.set(0, 1.4, 0);
        heartMesh.rotation.z = Math.PI;
        this.emptyBedGroup.add(heartMesh);
        this.floatingHeart = heartMesh;
    }

    // Build Pixar-Style 3D Cat Rig (Exact character proportions from reference photo)
    buildCat(breedId = 'orange_tabby', growthPercent = 25) {
        this.hasCat = true;
        this.currentBreed = breedId;
        this.growthPercent = Math.max(5, Math.min(100, growthPercent));

        // Clear empty bed and existing cat
        while (this.emptyBedGroup.children.length > 0) {
            this.emptyBedGroup.remove(this.emptyBedGroup.children[0]);
        }
        while (this.catGroup.children.length > 0) {
            this.catGroup.remove(this.catGroup.children[0]);
        }

        const breed = (typeof CAT_BREEDS !== 'undefined' ? CAT_BREEDS.find(b => b.id === breedId) : null) || {
            bodyColor: '#D9A066',
            bellyColor: '#FFF3E0',
            pointColor: '#6E4A35',
            eyeColor: '#F39C12',
            earType: 'standard',
            patternType: 'tabby_striped'
        };

        // Kitten Growth scale factor:
        const scaleFactor = 0.78 + (this.growthPercent / 100) * 0.42;

        // Standard Materials with velvety cartoon sheen
        const bodyMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(breed.bodyColor),
            roughness: 0.45,
            metalness: 0.06
        });
        const bellyMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(breed.bellyColor || '#FFF3E0'),
            roughness: 0.5,
            metalness: 0.04
        });
        const stripeMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(breed.pointColor || '#6E4A35'),
            roughness: 0.5,
            metalness: 0.05
        });
        const noseMat = new THREE.MeshStandardMaterial({
            color: 0xEE7D77, // Soft warm coral-pink nose
            roughness: 0.25
        });
        const innerEarMat = new THREE.MeshStandardMaterial({
            color: 0xFFAAA6, // Warm peach-pink inner ear
            roughness: 0.6
        });
        const eyeColorLeft = new THREE.Color(breed.eyeColor || '#F39C12');
        const eyeColorRight = breed.eyeColorRight ? new THREE.Color(breed.eyeColorRight) : eyeColorLeft;

        // ====================================================================
        // 1. Torso / Pear-Shaped Body (Soft Kitten Anatomy)
        // ====================================================================
        const bodyGeo = new THREE.SphereGeometry(0.68 * scaleFactor, 36, 28);
        this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        this.bodyMesh.scale.set(0.88, 1.08, 1.25);
        this.bodyMesh.position.set(0, 0.76 * scaleFactor, 0);
        this.bodyMesh.castShadow = true;
        this.bodyMesh.receiveShadow = true;
        this.catGroup.add(this.bodyMesh);

        // Creamy Chest / Belly Bib
        const chestGeo = new THREE.SphereGeometry(0.48 * scaleFactor, 24, 20);
        this.chestMesh = new THREE.Mesh(chestGeo, bellyMat);
        this.chestMesh.scale.set(0.72, 0.95, 0.55);
        this.chestMesh.position.set(0, 0.72 * scaleFactor, 0.48 * scaleFactor);
        this.catGroup.add(this.chestMesh);

        // Body Tabby Stripes (Curved bands across back/flanks)
        if (breed.patternType === 'tabby_striped' || breed.patternType === 'tiger_classic' || breed.id === 'orange_tabby' || breed.id === 'maine_coon' || breed.id === 'bengal') {
            [-0.22, 0.0, 0.22].forEach((zOffset, i) => {
                const stripeGeo = new THREE.TorusGeometry(0.60 * scaleFactor, 0.045 * scaleFactor, 12, 28, Math.PI * 0.95);
                const stripe = new THREE.Mesh(stripeGeo, stripeMat);
                stripe.rotation.x = Math.PI / 2 + 0.1;
                stripe.rotation.y = Math.PI;
                stripe.position.set(0, (0.82 + (i % 2) * 0.04) * scaleFactor, zOffset * scaleFactor);
                this.catGroup.add(stripe);
            });
        }

        // ====================================================================
        // 2. Head Group (Prominent Pixar Styling: Big Round Head + Chubby Cheeks)
        // ====================================================================
        this.headGroup = new THREE.Group();
        this.headGroup.position.set(0, 1.48 * scaleFactor, 0.62 * scaleFactor);

        // Main Head Sphere (Slightly squashed sphere for cartoon cuteness)
        const headGeo = new THREE.SphereGeometry(0.58 * scaleFactor, 36, 30);
        const headMesh = new THREE.Mesh(headGeo, bodyMat);
        headMesh.scale.set(1.18, 1.02, 1.04);
        headMesh.castShadow = true;
        this.headGroup.add(headMesh);

        // Chubby Cheek Puffs (Left and Right)
        [-0.38, 0.38].forEach((xOffset) => {
            const cheekGeo = new THREE.SphereGeometry(0.25 * scaleFactor, 24, 20);
            const cheek = new THREE.Mesh(cheekGeo, bodyMat);
            cheek.position.set(xOffset * scaleFactor, -0.14 * scaleFactor, 0.22 * scaleFactor);
            cheek.scale.set(1.1, 0.9, 0.85);
            this.headGroup.add(cheek);
        });

        // Forehead Tabby 'M' Mark (3 vertical subtle stripes)
        if (breed.patternType === 'tabby_striped' || breed.id === 'orange_tabby' || breed.id === 'maine_coon') {
            [-0.12, 0.0, 0.12].forEach((xOffset, i) => {
                const fStripeGeo = new THREE.BoxGeometry(0.035 * scaleFactor, (i === 1 ? 0.22 : 0.16) * scaleFactor, 0.04 * scaleFactor);
                const fStripe = new THREE.Mesh(fStripeGeo, stripeMat);
                fStripe.position.set(xOffset * scaleFactor, 0.32 * scaleFactor, 0.52 * scaleFactor);
                fStripe.rotation.x = 0.35;
                this.headGroup.add(fStripe);
            });
        }

        // Siamese Mask or Ragdoll V-Blaze (Face Markings)
        if (breed.patternType === 'colorpoint' || breed.id === 'siamese') {
            const maskGeo = new THREE.SphereGeometry(0.36 * scaleFactor, 24, 20);
            const mask = new THREE.Mesh(maskGeo, stripeMat);
            mask.scale.set(1.05, 0.9, 0.65);
            mask.position.set(0, -0.05 * scaleFactor, 0.40 * scaleFactor);
            this.headGroup.add(mask);
        }

        // ====================================================================
        // 3. Muzzle, Nose, Mouth & Whiskers
        // ====================================================================
        // Two Creamy Whisker Pads meeting at center
        const muzzlePadMat = (breed.patternType === 'colorpoint') ? stripeMat : bellyMat;
        [-0.11, 0.11].forEach((xOffset) => {
            const padGeo = new THREE.SphereGeometry(0.145 * scaleFactor, 24, 20);
            const pad = new THREE.Mesh(padGeo, muzzlePadMat);
            pad.position.set(xOffset * scaleFactor, -0.16 * scaleFactor, 0.48 * scaleFactor);
            pad.scale.set(1.15, 0.85, 0.75);
            this.headGroup.add(pad);
        });

        // Pink Button Nose (Soft rounded triangle)
        const noseGeo = new THREE.CylinderGeometry(0.065 * scaleFactor, 0.015 * scaleFactor, 0.06 * scaleFactor, 16);
        const noseMesh = new THREE.Mesh(noseGeo, noseMat);
        noseMesh.rotation.z = Math.PI;
        noseMesh.position.set(0, -0.085 * scaleFactor, 0.59 * scaleFactor);
        this.headGroup.add(noseMesh);

        // Smiling Mouth Line (Gentle upward curve under whisker pads)
        const smileGeo = new THREE.TorusGeometry(0.12 * scaleFactor, 0.018 * scaleFactor, 8, 20, Math.PI * 0.9);
        const smileMat = new THREE.MeshBasicMaterial({ color: 0x4E342E });
        const smileMesh = new THREE.Mesh(smileGeo, smileMat);
        smileMesh.rotation.x = -0.35;
        smileMesh.position.set(0, -0.22 * scaleFactor, 0.52 * scaleFactor);
        this.headGroup.add(smileMesh);

        // 3D Whiskers (3 on each side curving outward)
        [-1, 1].forEach((side) => {
            [-0.03, 0.0, 0.03].forEach((yOffset, wi) => {
                const whiskerGeo = new THREE.CylinderGeometry(0.004 * scaleFactor, 0.002 * scaleFactor, 0.36 * scaleFactor, 8);
                const whiskerMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
                const whisker = new THREE.Mesh(whiskerGeo, whiskerMat);
                whisker.position.set(side * 0.26 * scaleFactor, (-0.15 + yOffset) * scaleFactor, 0.46 * scaleFactor);
                whisker.rotation.z = side * (Math.PI / 2 + (wi - 1) * 0.18);
                whisker.rotation.y = -side * 0.3;
                this.headGroup.add(whisker);
            });
        });

        // ====================================================================
        // 4. Disney/Pixar Expressive Eyes (Large, Bright Iris, Dual Specular Glints)
        // ====================================================================
        this.eyesGroup = new THREE.Group();
        [-0.22, 0.22].forEach((xOffset, i) => {
            const eyeSocket = new THREE.Group();
            eyeSocket.position.set(xOffset * scaleFactor, 0.10 * scaleFactor, 0.44 * scaleFactor);
            eyeSocket.rotation.y = (i === 0 ? 0.14 : -0.14); // Slight outward tilt for cartoon charm

            // 1) Sclera (Eye White Dome)
            const whiteGeo = new THREE.SphereGeometry(0.18 * scaleFactor, 24, 20);
            const whiteMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.15 });
            const whiteMesh = new THREE.Mesh(whiteGeo, whiteMat);
            whiteMesh.scale.set(1.0, 1.16, 0.42);
            eyeSocket.add(whiteMesh);

            // 2) Iris (Huge Glowing Cartoon Ring)
            const currentIrisColor = (i === 0) ? eyeColorLeft : eyeColorRight;
            const irisMat = new THREE.MeshStandardMaterial({
                color: currentIrisColor,
                roughness: 0.15,
                metalness: 0.15,
                emissive: currentIrisColor,
                emissiveIntensity: 0.18
            });
            const irisGeo = new THREE.SphereGeometry(0.13 * scaleFactor, 24, 20);
            const irisMesh = new THREE.Mesh(irisGeo, irisMat);
            irisMesh.position.set(0, 0, 0.062 * scaleFactor);
            irisMesh.scale.set(0.96, 1.08, 0.25);
            eyeSocket.add(irisMesh);

            // 3) Large Pupil (Rich Black)
            const pupilGeo = new THREE.SphereGeometry(0.078 * scaleFactor, 20, 16);
            const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0A0A0A });
            const pupilMesh = new THREE.Mesh(pupilGeo, pupilMat);
            pupilMesh.position.set(0, 0, 0.088 * scaleFactor);
            pupilMesh.scale.set(0.95, 1.05, 0.15);
            eyeSocket.add(pupilMesh);

            // 4) Primary Specular Glint (Big glossy reflection top-right)
            const glint1Geo = new THREE.SphereGeometry(0.038 * scaleFactor, 12, 12);
            const glintMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const glint1 = new THREE.Mesh(glint1Geo, glintMat);
            glint1.position.set(0.038 * scaleFactor, 0.045 * scaleFactor, 0.108 * scaleFactor);
            eyeSocket.add(glint1);

            // 5) Secondary Specular Glint (Small soft reflection bottom-left)
            const glint2Geo = new THREE.SphereGeometry(0.018 * scaleFactor, 10, 10);
            const glint2 = new THREE.Mesh(glint2Geo, glintMat);
            glint2.position.set(-0.032 * scaleFactor, -0.035 * scaleFactor, 0.108 * scaleFactor);
            eyeSocket.add(glint2);

            // 6) Eyelid / Blink Mesh (for sleep/smile animations)
            const lidGeo = new THREE.SphereGeometry(0.188 * scaleFactor, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
            const lidMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(breed.bodyColor), roughness: 0.45 });
            const lidMesh = new THREE.Mesh(lidGeo, lidMat);
            lidMesh.rotation.x = -Math.PI / 2;
            lidMesh.position.set(0, 0.05 * scaleFactor, 0.04 * scaleFactor);
            lidMesh.visible = false;
            eyeSocket.add(lidMesh);

            if (i === 0) {
                this.leftEyeMesh = eyeSocket;
                this.leftEyelid = lidMesh;
            } else {
                this.rightEyeMesh = eyeSocket;
                this.rightEyelid = lidMesh;
            }

            this.eyesGroup.add(eyeSocket);
        });
        this.headGroup.add(this.eyesGroup);

        // ====================================================================
        // 5. Ears with Deep Peach-Pink Inner Cavity (Breed Variations)
        // ====================================================================
        const earOuterMat = (breed.patternType === 'colorpoint') ? stripeMat : bodyMat;
        [-0.36, 0.36].forEach((xOffset, i) => {
            const earHolder = new THREE.Group();
            earHolder.position.set(xOffset * scaleFactor, 0.46 * scaleFactor, 0.02 * scaleFactor);

            // Outer Ear Cone
            const earHeight = (breed.earType === 'large_bat' ? 0.62 : 0.48) * scaleFactor;
            const earRadius = (breed.earType === 'large_bat' ? 0.25 : 0.20) * scaleFactor;
            const earGeo = new THREE.ConeGeometry(earRadius, earHeight, 24);
            const earOuter = new THREE.Mesh(earGeo, earOuterMat);
            earOuter.scale.set(1.15, 1.0, 0.45);
            earHolder.add(earOuter);

            // Inner Ear Peach-Pink Pocket
            const inEarGeo = new THREE.ConeGeometry(earRadius * 0.78, earHeight * 0.78, 20);
            const earInner = new THREE.Mesh(inEarGeo, innerEarMat);
            earInner.position.set(0, -0.02 * scaleFactor, 0.035 * scaleFactor);
            earInner.scale.set(1.05, 1.0, 0.35);
            earHolder.add(earInner);

            // Angle & Fold
            earHolder.rotation.z = (i === 0 ? 0.38 : -0.38);
            earHolder.rotation.x = -0.15;

            // Scottish Fold forward-fold
            if (breed.earType === 'folded_forward' || breed.id === 'scottish_fold') {
                earHolder.rotation.x = 0.65;
                earHolder.scale.set(0.9, 0.65, 0.9);
            }

            // Maine Coon Lynx Hair Tufts on Tips
            if (breed.id === 'maine_coon') {
                const tuftGeo = new THREE.ConeGeometry(0.04 * scaleFactor, 0.15 * scaleFactor, 8);
                const tuft = new THREE.Mesh(tuftGeo, stripeMat);
                tuft.position.set(0, earHeight * 0.55, 0);
                earHolder.add(tuft);
            }

            this.headGroup.add(earHolder);
        });

        // Collar with Golden Bell
        const collarGeo = new THREE.TorusGeometry(0.36 * scaleFactor, 0.048 * scaleFactor, 16, 32);
        const collarMat = new THREE.MeshStandardMaterial({ color: 0xFF5376, roughness: 0.3 });
        const collar = new THREE.Mesh(collarGeo, collarMat);
        collar.rotation.x = Math.PI / 2;
        collar.position.set(0, -0.42 * scaleFactor, 0.12 * scaleFactor);
        this.headGroup.add(collar);

        const bellGeo = new THREE.SphereGeometry(0.095 * scaleFactor, 16, 16);
        const bellMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.2, metalness: 0.85 });
        this.collarBell = new THREE.Mesh(bellGeo, bellMat);
        this.collarBell.position.set(0, -0.46 * scaleFactor, 0.44 * scaleFactor);
        this.headGroup.add(this.collarBell);

        this.catGroup.add(this.headGroup);

        // ====================================================================
        // 6. Limbs and 4 Detailed Rounded Paws (Each Paw with 4 Distinct Toe Spheres)
        // ====================================================================
        const pawMat = (breed.patternType === 'colorpoint') ? stripeMat : bellyMat;
        const makeLeg = (x, z, isFront = true) => {
            const legGroup = new THREE.Group();
            legGroup.position.set(x * scaleFactor, 0.58 * scaleFactor, z * scaleFactor);

            // Limb Cylinder
            const limbGeo = new THREE.CylinderGeometry(0.10 * scaleFactor, 0.12 * scaleFactor, 0.54 * scaleFactor, 18);
            const limb = new THREE.Mesh(limbGeo, (breed.patternType === 'colorpoint' && !isFront) ? stripeMat : bodyMat);
            limb.position.y = -0.16 * scaleFactor;
            limb.castShadow = true;
            legGroup.add(limb);

            // Paw Base Pad
            const pawPadGeo = new THREE.SphereGeometry(0.125 * scaleFactor, 18, 16);
            const pawPad = new THREE.Mesh(pawPadGeo, pawMat);
            pawPad.scale.set(1.05, 0.55, 1.25);
            pawPad.position.set(0, -0.41 * scaleFactor, 0.06 * scaleFactor);
            pawPad.castShadow = true;
            legGroup.add(pawPad);

            // 4 Distinct Cute Toe Spheres (Reference: Rounded paws with clear toe beans!)
            [-0.075, -0.025, 0.025, 0.075].forEach((toeX) => {
                const toeGeo = new THREE.SphereGeometry(0.042 * scaleFactor, 12, 10);
                const toe = new THREE.Mesh(toeGeo, pawMat);
                toe.position.set(toeX * scaleFactor, -0.42 * scaleFactor, 0.16 * scaleFactor);
                toe.castShadow = true;
                legGroup.add(toe);
            });

            return legGroup;
        };

        this.frontLeftLeg = makeLeg(-0.30, 0.36, true);
        this.frontRightLeg = makeLeg(0.30, 0.36, true);
        this.backLeftLeg = makeLeg(-0.34, -0.34, false);
        this.backRightLeg = makeLeg(0.34, -0.34, false);

        this.catGroup.add(this.frontLeftLeg);
        this.catGroup.add(this.frontRightLeg);
        this.catGroup.add(this.backLeftLeg);
        this.catGroup.add(this.backRightLeg);

        // ====================================================================
        // 7. Expressive S-Curved Animated Tail with Ring Stripes
        // ====================================================================
        this.tailGroup = new THREE.Group();
        this.tailGroup.position.set(0, 0.76 * scaleFactor, -0.66 * scaleFactor);

        this.tailSegments = [];
        const numSegments = 6;
        let prevSeg = this.tailGroup;

        for (let t = 0; t < numSegments; t++) {
            const segRadius = (0.075 - t * 0.008) * scaleFactor;
            const segLength = 0.22 * scaleFactor;
            const segGeo = new THREE.CylinderGeometry(segRadius * 0.9, segRadius, segLength, 16);

            // Alternating dark ring stripes on tail
            const isStripe = (t % 2 === 1 || t === numSegments - 1);
            const currentTailMat = isStripe ? stripeMat : bodyMat;
            const segMesh = new THREE.Mesh(segGeo, currentTailMat);
            segMesh.position.set(0, 0.16 * scaleFactor, (t < 3 ? -0.04 : 0.04) * scaleFactor);

            // S-Curve curvature
            segMesh.rotation.x = (t < 3 ? -0.32 : 0.38);
            prevSeg.add(segMesh);
            this.tailSegments.push(segMesh);
            prevSeg = segMesh;
        }

        this.catGroup.add(this.tailGroup);

        // Check hour for initial state
        const hour = new Date().getHours();
        if (hour >= 21 || hour < 6) {
            this.setAnimState('sleep');
        } else {
            this.setAnimState('sit');
        }
    }

    // Set Sickness Obstacle State
    setSicknessState(hasFever = false, hasLongNails = false) {
        while (this.sicknessGroup.children.length > 0) {
            this.sicknessGroup.remove(this.sicknessGroup.children[0]);
        }

        if (hasFever) {
            // Sick sweat droplets
            const sweatGeo = new THREE.SphereGeometry(0.08, 12, 12);
            const sweatMat = new THREE.MeshStandardMaterial({ color: 0x4FC3F7, roughness: 0.1 });
            const sweat = new THREE.Mesh(sweatGeo, sweatMat);
            sweat.position.set(0.35, 2.15, 0.65);
            this.sicknessGroup.add(sweat);
        }

        if (hasLongNails) {
            // Tangled fluff cloud
            for (let i = 0; i < 3; i++) {
                const angle = i * 2.1;
                const cloudGeo = new THREE.DodecahedronGeometry(0.12, 1);
                const cloudMat = new THREE.MeshStandardMaterial({ color: 0xCFD8DC });
                const cloud = new THREE.Mesh(cloudGeo, cloudMat);
                cloud.position.set(Math.cos(angle) * 0.75, 0.4, Math.sin(angle) * 0.75);
                this.sicknessGroup.add(cloud);
            }
        }
    }

    // State Machine Switcher
    setAnimState(state) {
        this.animState = state;
        this.animTimer = 0;

        if (!this.hasCat) return;

        // Reset default rotations
        if (state === 'sit') {
            this.catGroup.position.set(0, 0, 0);
            if (this.bodyMesh) this.bodyMesh.rotation.x = 0.18;
            if (this.frontLeftLeg) this.frontLeftLeg.rotation.x = -0.15;
            if (this.frontRightLeg) this.frontRightLeg.rotation.x = -0.15;
            if (this.backLeftLeg) this.backLeftLeg.rotation.x = 0.35;
            if (this.backRightLeg) this.backRightLeg.rotation.x = 0.35;
            if (this.leftEyelid) this.leftEyelid.visible = false;
            if (this.rightEyelid) this.rightEyelid.visible = false;
        } else if (state === 'sleep') {
            this.catGroup.position.y = -0.25;
            if (this.headGroup) this.headGroup.position.y = 0.85;
            if (this.leftEyelid) this.leftEyelid.visible = true;
            if (this.rightEyelid) this.rightEyelid.visible = true;
        } else if (state === 'jump') {
            this.jumpHeight = 0;
            if (this.leftEyelid) this.leftEyelid.visible = false;
            if (this.rightEyelid) this.rightEyelid.visible = false;
        } else if (state === 'smile') {
            if (this.leftEyelid) this.leftEyelid.visible = true;
            if (this.rightEyelid) this.rightEyelid.visible = true;
        }
    }

    // Interactive Head Petting (Warm Purr + Smile + Tender Hearts)
    triggerPetHead() {
        if (!this.hasCat) return;
        this.setAnimState('smile');
        if (window.soundManager) {
            window.soundManager.playCatPet(this.currentBreed);
        }

        // Cute head tilt
        if (this.headGroup) {
            const origX = this.headGroup.rotation.x;
            const origZ = this.headGroup.rotation.z;
            this.headGroup.rotation.x = -0.18;
            this.headGroup.rotation.z = 0.12;
            setTimeout(() => {
                if (this.headGroup) {
                    this.headGroup.rotation.x = origX;
                    this.headGroup.rotation.z = origZ;
                }
            }, 1400);
        }

        // Spawn glowing pink hearts directly above head
        const count = 22;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];

        const headY = this.headGroup ? this.headGroup.position.y + 0.35 : 1.6;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 0.45;
            positions[i * 3] = Math.cos(angle) * dist;
            positions[i * 3 + 1] = headY + Math.random() * 0.3;
            positions[i * 3 + 2] = 0.45 + Math.sin(angle) * dist;
            velocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: 0.035 + Math.random() * 0.03,
                z: (Math.random() - 0.5) * 0.02
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: 0xFF5376,
            size: 0.22,
            transparent: true,
            opacity: 0.95
        });

        const hearts = new THREE.Points(geometry, material);
        this.scene.add(hearts);

        this.particleSystems.push({
            mesh: hearts,
            velocities: velocities,
            life: 1.6,
            update: () => {
                const pos = hearts.geometry.attributes.position.array;
                for (let i = 0; i < count; i++) {
                    pos[i * 3] += velocities[i].x;
                    pos[i * 3 + 1] += velocities[i].y;
                    pos[i * 3 + 2] += velocities[i].z;
                }
                hearts.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    // Interactive Body Tap Trigger (Playful Hop + Breed Meow)
    triggerTouch() {
        if (!this.hasCat) return;
        this.setAnimState('jump');
        if (window.soundManager) {
            window.soundManager.playCatMeow(this.currentBreed, 'happy');
        }

        // Tail whip excitement
        if (this.tailMesh) {
            this.tailMesh.rotation.z += 0.4;
            setTimeout(() => {
                if (this.tailMesh) this.tailMesh.rotation.z -= 0.4;
            }, 600);
        }

        // Spawn pink and gold starburst particles
        const count = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 0.9;
            positions[i * 3 + 1] = 0.8 + Math.random() * 0.8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.9;
            velocities.push({
                x: (Math.random() - 0.5) * 0.04,
                y: 0.04 + Math.random() * 0.04,
                z: (Math.random() - 0.5) * 0.04
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: 0xFFA07A,
            size: 0.20,
            transparent: true,
            opacity: 0.95
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);

        this.particleSystems.push({
            mesh: particles,
            velocities: velocities,
            life: 1.5,
            update: () => {
                const pos = particles.geometry.attributes.position.array;
                for (let i = 0; i < count; i++) {
                    pos[i * 3] += velocities[i].x;
                    pos[i * 3 + 1] += velocities[i].y;
                    pos[i * 3 + 2] += velocities[i].z;
                }
                particles.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    // 3D Feed Main Meal Animation (Ceramic Salmon Bowl + Food Droplets + Eating Motion)
    triggerFeedAnimation() {
        if (!this.hasCat) return;
        this.setAnimState('smile');
        if (window.soundManager) {
            window.soundManager.playCatEat(this.currentBreed);
        }

        // Create 3D Salmon Feast Bowl on the rug in front of cat
        const bowlGroup = new THREE.Group();
        const bowlGeo = new THREE.CylinderGeometry(0.38, 0.26, 0.16, 28);
        const bowlMat = new THREE.MeshStandardMaterial({
            color: 0x4DD0E1, // Vibrant pastel turquoise bowl
            roughness: 0.3,
            metalness: 0.1
        });
        const bowlMesh = new THREE.Mesh(bowlGeo, bowlMat);
        bowlMesh.castShadow = true;
        bowlGroup.add(bowlMesh);

        // Salmon pink chunks inside bowl
        const salmonMat = new THREE.MeshStandardMaterial({ color: 0xFF6E40, roughness: 0.4 });
        const kibbleMat = new THREE.MeshStandardMaterial({ color: 0x8D6E63, roughness: 0.7 });

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const chunkGeo = new THREE.BoxGeometry(0.09, 0.07, 0.09);
            const chunk = new THREE.Mesh(chunkGeo, i % 2 === 0 ? salmonMat : kibbleMat);
            chunk.position.set(Math.cos(angle) * 0.14, 0.06, Math.sin(angle) * 0.14);
            chunk.rotation.y = Math.random() * Math.PI;
            bowlGroup.add(chunk);
        }

        bowlGroup.position.set(0, 0.08, 0.98);
        this.scene.add(bowlGroup);

        // Chewing / Munching head bobbing
        let chewCount = 0;
        const chewInterval = setInterval(() => {
            if (!this.headGroup) return;
            this.headGroup.rotation.x = (chewCount % 2 === 0) ? 0.32 : 0.18;
            chewCount++;
            if (chewCount > 10) {
                clearInterval(chewInterval);
                if (this.headGroup) this.headGroup.rotation.x = 0;
            }
        }, 180);

        // Food falling particles
        const count = 35;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 0.8;
            positions[i * 3 + 1] = 2.4 + Math.random() * 0.8;
            positions[i * 3 + 2] = 0.9 + (Math.random() - 0.5) * 0.6;
            velocities.push({
                x: (Math.random() - 0.5) * 0.015,
                y: -(0.05 + Math.random() * 0.04),
                z: (Math.random() - 0.5) * 0.015
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: 0xFF7043,
            size: 0.15,
            transparent: true,
            opacity: 0.95
        });

        const drops = new THREE.Points(geometry, material);
        this.scene.add(drops);

        this.particleSystems.push({
            mesh: drops,
            velocities: velocities,
            life: 2.2,
            update: () => {
                const pos = drops.geometry.attributes.position.array;
                for (let i = 0; i < count; i++) {
                    pos[i * 3 + 1] += velocities[i].y;
                    if (pos[i * 3 + 1] < 0.15) pos[i * 3 + 1] = 0.15;
                }
                drops.geometry.attributes.position.needsUpdate = true;
            }
        });

        // Fade out bowl after feeding
        setTimeout(() => {
            const fadeInterval = setInterval(() => {
                bowlGroup.scale.multiplyScalar(0.9);
                if (bowlGroup.scale.x < 0.1) {
                    clearInterval(fadeInterval);
                    this.scene.remove(bowlGroup);
                }
            }, 40);
        }, 2200);
    }

    // 3D Creamy Treat Hearts Animation (Golden Foil Tube + Licking Motion + Stars)
    triggerTreatAnimation() {
        if (!this.hasCat) return;
        this.setAnimState('smile');
        if (window.soundManager) {
            window.soundManager.playCatTreat(this.currentBreed);
        }

        // Create 3D Treat Sachet / Tube floating toward cat's mouth
        const treatGroup = new THREE.Group();
        const tubeGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.48, 16);
        const tubeMat = new THREE.MeshStandardMaterial({
            color: 0xFFD54F, // Golden glossy foil
            roughness: 0.2,
            metalness: 0.6
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        tubeMesh.rotation.z = Math.PI / 3;
        tubeMesh.rotation.x = -0.2;
        treatGroup.add(tubeMesh);

        // Heart badge on treat
        const heartDecoGeo = new THREE.SphereGeometry(0.04, 12, 12);
        const heartDecoMat = new THREE.MeshStandardMaterial({ color: 0xFF5376 });
        const heartDeco = new THREE.Mesh(heartDecoGeo, heartDecoMat);
        heartDeco.position.set(0, 0, 0.05);
        treatGroup.add(heartDeco);

        const headY = this.headGroup ? this.headGroup.position.y : 1.48;
        treatGroup.position.set(0.22, headY - 0.05, 0.95);
        this.scene.add(treatGroup);

        // Joyful head waggle & paw twitch
        let lickCount = 0;
        const lickInterval = setInterval(() => {
            if (!this.headGroup) return;
            this.headGroup.rotation.z = Math.sin(lickCount * 0.8) * 0.12;
            if (this.frontRightLeg) this.frontRightLeg.rotation.x = -0.3 + Math.sin(lickCount) * 0.15;
            lickCount++;
            if (lickCount > 12) {
                clearInterval(lickInterval);
                if (this.headGroup) this.headGroup.rotation.z = 0;
                if (this.frontRightLeg) this.frontRightLeg.rotation.x = -0.15;
            }
        }, 140);

        // Creamy treat sparkle droplets
        const count = 45;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.15 + Math.random() * 0.5;
            positions[i * 3] = 0.1 + Math.cos(angle) * radius;
            positions[i * 3 + 1] = headY - 0.2 + Math.random() * 0.4;
            positions[i * 3 + 2] = 0.8 + Math.sin(angle) * radius;

            velocities.push({
                x: (Math.random() - 0.5) * 0.03,
                y: 0.03 + Math.random() * 0.04,
                z: (Math.random() - 0.5) * 0.03
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: 0xFFE082,
            size: 0.18,
            transparent: true,
            opacity: 0.95
        });

        const stars = new THREE.Points(geometry, material);
        this.scene.add(stars);

        this.particleSystems.push({
            mesh: stars,
            velocities: velocities,
            life: 2.0,
            update: () => {
                const pos = stars.geometry.attributes.position.array;
                for (let i = 0; i < count; i++) {
                    pos[i * 3] += velocities[i].x;
                    pos[i * 3 + 1] += velocities[i].y;
                    pos[i * 3 + 2] += velocities[i].z;
                }
                stars.geometry.attributes.position.needsUpdate = true;
            }
        });

        setTimeout(() => {
            const fadeInterval = setInterval(() => {
                treatGroup.position.y += 0.04;
                treatGroup.scale.multiplyScalar(0.88);
                if (treatGroup.scale.x < 0.1) {
                    clearInterval(fadeInterval);
                    this.scene.remove(treatGroup);
                }
            }, 40);
        }, 2000);
    }

    // 3D Vaccine Healing Animation (Golden Syringe + Recovery Leap + Mint Sparkles)
    triggerVaccineAnimation() {
        if (!this.hasCat) return;
        if (window.soundManager) {
            window.soundManager.playCatVaccine(this.currentBreed);
        }

        // Glowing medical syringe
        const syringeGroup = new THREE.Group();
        const barrelGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.32, 16);
        const barrelMat = new THREE.MeshStandardMaterial({
            color: 0x80DEEA,
            roughness: 0.2,
            metalness: 0.4,
            transparent: true,
            opacity: 0.85
        });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        syringeGroup.add(barrel);

        const needleGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.16, 8);
        const needleMat = new THREE.MeshStandardMaterial({ color: 0xCFD8DC, metalness: 0.9, roughness: 0.1 });
        const needle = new THREE.Mesh(needleGeo, needleMat);
        needle.position.y = -0.22;
        syringeGroup.add(needle);

        // Mint cross badge
        const crossGeo = new THREE.BoxGeometry(0.08, 0.025, 0.02);
        const crossMat = new THREE.MeshBasicMaterial({ color: 0x00E676 });
        const cross1 = new THREE.Mesh(crossGeo, crossMat);
        const cross2 = new THREE.Mesh(crossGeo, crossMat);
        cross2.rotation.z = Math.PI / 2;
        cross1.position.z = 0.05;
        cross2.position.z = 0.05;
        syringeGroup.add(cross1);
        syringeGroup.add(cross2);

        syringeGroup.rotation.z = -Math.PI / 4;
        syringeGroup.position.set(-0.65, 1.25, 0.35);
        this.scene.add(syringeGroup);

        // Initial wince -> then vitality leap!
        this.setAnimState('smile');
        setTimeout(() => {
            this.setAnimState('jump');
            syringeGroup.position.y += 0.3;
        }, 320);

        // Huge shower of minty vitality sparkles
        const count = 65;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 1.8;
            positions[i * 3 + 1] = 0.3 + Math.random() * 2.2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: 0x2EC4B6,
            size: 0.20,
            transparent: true,
            opacity: 0.95
        });

        const sparkles = new THREE.Points(geometry, material);
        this.scene.add(sparkles);

        this.particleSystems.push({
            mesh: sparkles,
            life: 1.8,
            update: () => {
                sparkles.rotation.y += 0.04;
            }
        });

        setTimeout(() => {
            this.scene.remove(syringeGroup);
        }, 2200);
    }

    // 3D Grooming & Nails Animation (Floating Scissors & Soap Bubbles + Cat Stretch)
    triggerGroomingAnimation() {
        if (!this.hasCat) return;
        this.setAnimState('smile');
        if (window.soundManager) {
            window.soundManager.playCatGroom(this.currentBreed);
        }

        // Cute scissors and comb model
        const toolGroup = new THREE.Group();
        const bladeGeo = new THREE.BoxGeometry(0.02, 0.24, 0.04);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0xB0BEC5, metalness: 0.8, roughness: 0.2 });
        const b1 = new THREE.Mesh(bladeGeo, bladeMat);
        const b2 = new THREE.Mesh(bladeGeo, bladeMat);
        b1.rotation.z = 0.25;
        b2.rotation.z = -0.25;
        toolGroup.add(b1);
        toolGroup.add(b2);

        toolGroup.position.set(0.65, 1.15, 0.4);
        this.scene.add(toolGroup);

        // Snip-snip motion
        let snipCount = 0;
        const snipInterval = setInterval(() => {
            b1.rotation.z = (snipCount % 2 === 0) ? 0.35 : 0.05;
            b2.rotation.z = (snipCount % 2 === 0) ? -0.35 : -0.05;
            snipCount++;
            if (snipCount > 8) clearInterval(snipInterval);
        }, 120);

        // Cat stretches back comfortably
        if (this.catGroup) {
            this.catGroup.rotation.x = -0.12;
            setTimeout(() => {
                if (this.catGroup) this.catGroup.rotation.x = 0;
            }, 1500);
        }

        // Fluffy iridescent bubbles
        const count = 45;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 1.6;
            positions[i * 3 + 1] = 0.3 + Math.random() * 1.8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: 0xFF80AB,
            size: 0.18,
            transparent: true,
            opacity: 0.85
        });

        const bubbles = new THREE.Points(geometry, material);
        this.scene.add(bubbles);

        this.particleSystems.push({
            mesh: bubbles,
            life: 1.8,
            update: () => {
                bubbles.rotation.y -= 0.03;
            }
        });

        setTimeout(() => {
            this.scene.remove(toolGroup);
        }, 2000);
    }

    // Alias for obstacle cure
    triggerCureAnimation(isVaccine = true) {
        if (isVaccine) {
            this.triggerVaccineAnimation();
        } else {
            this.triggerGroomingAnimation();
        }
    }

    setupControls() {
        let isDragging = false;
        const dom = this.renderer.domElement;
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onStart = (e) => {
            isDragging = true;
            this.isInteracting = true;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            this.previousMousePosition = { x: clientX, y: clientY };
            this.touchStartPos = { x: clientX, y: clientY };
            this.touchStartTime = Date.now();
        };

        const onMove = (e) => {
            if (!isDragging) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const deltaX = clientX - this.previousMousePosition.x;

            if (this.catGroup) {
                this.catGroup.rotation.y += deltaX * 0.01;
            }
            if (this.islandMesh) {
                this.islandMesh.rotation.y += deltaX * 0.01;
            }

            // Cat rotation murmur / audio trigger (throttled inside SoundManager)
            if (Math.abs(deltaX) > 2 && window.soundManager && this.hasCat) {
                window.soundManager.playCatRotate(this.currentBreed);
            }

            this.previousMousePosition = { x: clientX, y: clientY };
        };

        const onEnd = (e) => {
            if (isDragging && Date.now() - this.touchStartTime < 320) {
                const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : this.previousMousePosition.x;
                const endY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : this.previousMousePosition.y;
                const distMoved = Math.hypot(endX - this.touchStartPos.x, endY - this.touchStartPos.y);

                if (distMoved < 15 && this.hasCat) {
                    const rect = dom.getBoundingClientRect();
                    mouse.x = ((endX - rect.left) / rect.width) * 2 - 1;
                    mouse.y = -((endY - rect.top) / rect.height) * 2 + 1;

                    raycaster.setFromCamera(mouse, this.camera);
                    const intersects = raycaster.intersectObjects(this.catGroup.children, true);

                    if (intersects.length > 0) {
                        const hit = intersects[0];
                        // If tapped upper area / head
                        if (hit.point.y > 1.15) {
                            this.triggerPetHead();
                        } else {
                            this.triggerTouch();
                        }
                    } else {
                        // Fallback check by normalized click height
                        if (mouse.y > 0.05) {
                            this.triggerPetHead();
                        } else {
                            this.triggerTouch();
                        }
                    }
                }
            }
            isDragging = false;
            setTimeout(() => { this.isInteracting = false; }, 2000);
        };

        dom.addEventListener('mousedown', onStart);
        dom.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        dom.addEventListener('touchstart', onStart, { passive: true });
        dom.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onEnd);
    }

    onResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // Floating heart in empty adoption bed
        if (!this.hasCat && this.floatingHeart) {
            this.floatingHeart.position.y = 1.35 + Math.sin(time * 2.5) * 0.12;
            this.floatingHeart.rotation.y = time * 1.2;
            if (this.emptyBedGroup) {
                this.emptyBedGroup.rotation.y = time * 0.15;
            }
        }

        // Procedural Cat Animation Loop
        if (this.hasCat && this.catGroup) {
            this.animTimer += delta;
            this.breathPhase += delta * 2.0;

            // Subtle breathing motion (always active)
            const breath = Math.sin(this.breathPhase) * 0.02;
            if (this.bodyMesh && this.animState !== 'jump') {
                this.bodyMesh.scale.y = 1.08 + breath;
            }

            // Tail swaying (playful S-curve movement)
            if (this.tailGroup && this.tailSegments.length > 0) {
                const sway = Math.sin(time * 2.8) * 0.22;
                this.tailGroup.rotation.y = sway;
                this.tailSegments.forEach((seg, idx) => {
                    seg.rotation.z = Math.cos(time * 3.2 + idx * 0.5) * 0.12;
                });
            }

            // Bell Jingle
            if (this.collarBell) {
                this.collarBell.rotation.z = Math.sin(time * 4.0) * 0.15;
            }

            // State-specific procedural behaviors
            if (this.animState === 'sit') {
                // Subtle head tilt & blink
                if (this.headGroup) {
                    this.headGroup.rotation.y = Math.sin(time * 0.8) * 0.12;
                    this.headGroup.rotation.z = Math.cos(time * 0.5) * 0.06;
                }
                // Random blink every 4-6 seconds
                const blinkTime = Math.floor(time) % 5 === 0 && (time % 1 < 0.15);
                if (this.leftEyelid) this.leftEyelid.visible = blinkTime;
                if (this.rightEyelid) this.rightEyelid.visible = blinkTime;

                // After 10s of sitting, walk around for a bit (daytime only)
                const hour = new Date().getHours();
                if (this.animTimer > 12 && (hour >= 6 && hour < 21) && !this.isInteracting) {
                    this.setAnimState('walk');
                }
            } else if (this.animState === 'walk') {
                this.walkPathAngle += delta * 0.85;
                const radius = 0.55;
                this.catGroup.position.x = Math.cos(this.walkPathAngle) * radius;
                this.catGroup.position.z = Math.sin(this.walkPathAngle) * radius;
                this.catGroup.rotation.y = -this.walkPathAngle + Math.PI / 2;

                // Walking leg swings
                const walkCycle = Math.sin(time * 8.0);
                if (this.frontLeftLeg) this.frontLeftLeg.rotation.x = walkCycle * 0.35;
                if (this.frontRightLeg) this.frontRightLeg.rotation.x = -walkCycle * 0.35;
                if (this.backLeftLeg) this.backLeftLeg.rotation.x = -walkCycle * 0.35;
                if (this.backRightLeg) this.backRightLeg.rotation.x = walkCycle * 0.35;

                if (this.animTimer > 8) {
                    this.setAnimState('sit');
                    this.catGroup.position.set(0, 0, 0);
                    this.catGroup.rotation.y = 0;
                }
            } else if (this.animState === 'jump') {
                const jumpProgress = Math.min(1, this.animTimer / 0.8);
                const jumpCurve = Math.sin(jumpProgress * Math.PI);
                this.catGroup.position.y = jumpCurve * 0.65;

                if (this.headGroup) {
                    this.headGroup.rotation.x = -jumpCurve * 0.25;
                }
                if (this.frontLeftLeg) this.frontLeftLeg.rotation.x = jumpCurve * 0.4;
                if (this.frontRightLeg) this.frontRightLeg.rotation.x = jumpCurve * 0.4;

                if (jumpProgress >= 1) {
                    this.setAnimState('sit');
                }
            } else if (this.animState === 'sleep') {
                // Gentle breathing loaf
                const sleepBob = Math.sin(time * 1.8) * 0.03;
                this.catGroup.position.y = -0.25 + sleepBob;
                if (this.leftEyelid) this.leftEyelid.visible = true;
                if (this.rightEyelid) this.rightEyelid.visible = true;
            } else if (this.animState === 'smile') {
                if (this.animTimer > 2.5) {
                    this.setAnimState('sit');
                }
            }
        }

        // Particle System Updates
        for (let i = this.particleSystems.length - 1; i >= 0; i--) {
            const p = this.particleSystems[i];
            p.life -= delta;
            if (p.update) p.update();
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particleSystems.splice(i, 1);
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.Garden3D = Garden3D;

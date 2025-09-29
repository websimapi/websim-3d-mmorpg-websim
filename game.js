import * as THREE from 'three';

// Game State
const game = {
    scene: null,
    camera: null,
    renderer: null,
    player: null,
    playerData: {
        username: '',
        class: 'warrior',
        appearance: {
            skinColor: '#fdbcb4',
            hairStyle: 'short',
            hairColor: '#2c1608'
        },
        position: { x: 0, y: 0, z: 0 },
        stats: {
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            stamina: 100,
            maxStamina: 100,
            level: 1,
            xp: 0,
            xpRequired: 100,
            strength: 10,
            agility: 10,
            intelligence: 10,
            defense: 10,
            gold: 0
        },
        inventory: [],
        equipment: {},
        skills: [],
        activeQuests: []
    },
    world: {
        terrain: null,
        enemies: [],
        npcs: [],
        otherPlayers: [],
        objects: [],
        particles: []
    },
    controls: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
        sprint: false,
        attack: false
    },
    ui: {
        selectedTarget: null,
        inventoryOpen: false,
        settingsOpen: false,
        chatMessages: []
    },
    time: {
        lastFrame: 0,
        deltaTime: 0,
        fps: 60,
        frameCount: 0,
        lastFpsUpdate: 0
    },
    cameraData: {
        offset: { x: 0, y: 5, z: 10 },
        shake: { x: 0, y: 0, intensity: 0, duration: 0 }
    }
};

let loadingTips = [
    "Use WASD to move around the world!",
    "Click on enemies to attack them!",
    "Press Space to jump over obstacles!",
    "Hold Shift while moving to sprint!",
    "Press I to open your inventory!",
    "Press E to interact with NPCs!",
    "Use number keys 1-0 to cast spells!",
    "Your health regenerates when not in combat!",
    "Level up by gaining experience from enemies!",
    "Complete quests for great rewards!"
];

// Character Creation
let selectedClass = 'warrior';
let selectedSkinColor = '#fdbcb4';
let selectedHairColor = '#2c1608';

function initializeCharacterCreation() {
    // Class selection
    document.querySelectorAll('.class-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedClass = btn.dataset.class;
        });
    });

    // Color pickers
    document.querySelectorAll('#skinColorPicker .color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('#skinColorPicker .color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedSkinColor = option.dataset.color;
        });
    });

    document.querySelectorAll('#hairColorPicker .color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('#hairColorPicker .color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedHairColor = option.dataset.color;
        });
    });

    // Set defaults
    document.querySelector('.class-btn[data-class="warrior"]').classList.add('selected');
    document.querySelector('#skinColorPicker .color-option').classList.add('selected');
    document.querySelector('#hairColorPicker .color-option').classList.add('selected');
}

function startGame() {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username || username.length < 3) {
        alert('Please enter a username (3+ characters)');
        return;
    }

    // Store character data
    game.playerData.username = username;
    game.playerData.class = selectedClass;
    game.playerData.appearance.skinColor = selectedSkinColor;
    game.playerData.appearance.hairColor = selectedHairColor;
    game.playerData.appearance.hairStyle = document.getElementById('hairStyleSelect').value;

    // Apply class bonuses
    switch (selectedClass) {
        case 'warrior':
            game.playerData.stats.maxHealth = 150;
            game.playerData.stats.health = 150;
            game.playerData.stats.defense = 15;
            game.playerData.stats.strength = 15;
            break;
        case 'mage':
            game.playerData.stats.maxMana = 100;
            game.playerData.stats.mana = 100;
            game.playerData.stats.intelligence = 15;
            break;
        case 'rogue':
            game.playerData.stats.agility = 15;
            game.playerData.stats.maxStamina = 150;
            game.playerData.stats.stamina = 150;
            break;
    }

    // Show loading screen
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('loadingScreen').style.display = 'flex';

    // Simulate loading
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            setTimeout(() => {
                document.getElementById('loadingScreen').style.display = 'none';
                initializeGame();
            }, 500);
        }

        document.getElementById('loadingProgress').style.width = progress + '%';
        document.getElementById('loadingPercentage').textContent = Math.floor(progress) + '%';

        // Rotate loading tips
        if (Math.random() < 0.3) {
            const tip = loadingTips[Math.floor(Math.random() * loadingTips.length)];
            document.getElementById('loadingTip').textContent = 'Tip: ' + tip;
        }
    }, 100);
}

function initializeGame() {
    initializeThreeJS();
    generateWorld();
    createPlayer();
    initializeEnemies();
    initializeNPCs();
    initializeOtherPlayers();
    initializeSkills();
    initializeQuests();
    initializeInventory();
    initializeControls();
    initializeChatSystem();
    startGameLoop();

    addChatMessage('System', 'Welcome to the world, ' + game.playerData.username + '!', '#ffff00');
}

function initializeThreeJS() {
    // Scene
    game.scene = new THREE.Scene();
    game.scene.background = new THREE.Color(0x87CEEB);

    // Camera
    game.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Renderer
    const canvas = document.getElementById('gameCanvas');
    game.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    game.renderer.setSize(window.innerWidth, window.innerHeight);
    game.renderer.setPixelRatio(window.devicePixelRatio);
    game.renderer.shadowMap.enabled = true;
    game.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    game.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    game.scene.add(directionalLight);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
}

function generateWorld() {
    // Terrain
    const terrainGeometry = new THREE.PlaneGeometry(500, 500, 100, 100);

    // Apply height displacement (simple noise)
    const vertices = terrainGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        vertices[i + 1] = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 5 + 
                          Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
    }
    terrainGeometry.attributes.position.needsUpdate = true;
    terrainGeometry.computeVertexNormals();

    const terrainMaterial = new THREE.MeshLambertMaterial({ color: 0x3a5f0b });
    game.world.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    game.world.terrain.rotation.x = -Math.PI / 2;
    game.world.terrain.receiveShadow = true;
    game.scene.add(game.world.terrain);

    // Generate trees
    for (let i = 0; i < 200; i++) {
        createTree();
    }

    // Generate rocks
    for (let i = 0; i < 50; i++) {
        createRock();
    }

    // Create skybox
    const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    game.scene.add(sky);
}

function createTree() {
    const treeGroup = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 6, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 3;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Foliage
    const foliageGeometry = new THREE.SphereGeometry(3, 8, 6);
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 7;
    foliage.castShadow = true;
    treeGroup.add(foliage);

    // Random position
    treeGroup.position.x = (Math.random() - 0.5) * 400;
    treeGroup.position.z = (Math.random() - 0.5) * 400;
    treeGroup.position.y = getTerrainHeight(treeGroup.position.x, treeGroup.position.z);

    game.scene.add(treeGroup);
    game.world.objects.push(treeGroup);
}

function createRock() {
    const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 2 + 1, 0);
    const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);

    rock.position.x = (Math.random() - 0.5) * 400;
    rock.position.z = (Math.random() - 0.5) * 400;
    rock.position.y = getTerrainHeight(rock.position.x, rock.position.z) + 1;

    rock.castShadow = true;
    rock.receiveShadow = true;

    game.scene.add(rock);
    game.world.objects.push(rock);
}

function getTerrainHeight(x, z) {
    return Math.sin(x * 0.02) * Math.cos(z * 0.02) * 5 + 
           Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
}

function createPlayer() {
    const playerGroup = new THREE.Group();

    // Head
    const headGeometry = new THREE.SphereGeometry(0.8, 8, 6);
    const headMaterial = new THREE.MeshLambertMaterial({ color: game.playerData.appearance.skinColor });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.5;
    head.castShadow = true;
    playerGroup.add(head);

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.6, 0.8, 2, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    playerGroup.add(body);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 6);
    const armMaterial = new THREE.MeshLambertMaterial({ color: game.playerData.appearance.skinColor });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-1, 1.5, 0);
    leftArm.castShadow = true;
    playerGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(1, 1.5, 0);
    rightArm.castShadow = true;
    playerGroup.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.25, 0.3, 1.5, 6);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, -0.25, 0);
    leftLeg.castShadow = true;
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, -0.25, 0);
    rightLeg.castShadow = true;
    playerGroup.add(rightLeg);

    // Hair (if not bald)
    if (game.playerData.appearance.hairStyle !== 'bald') {
        let hairGeometry;
        switch (game.playerData.appearance.hairStyle) {
            case 'short':
                hairGeometry = new THREE.SphereGeometry(0.85, 8, 6);
                break;
            case 'long':
                hairGeometry = new THREE.CylinderGeometry(0.8, 0.9, 1.5, 8);
                break;
            case 'curly':
                hairGeometry = new THREE.SphereGeometry(1, 8, 6);
                break;
            case 'spiky':
                hairGeometry = new THREE.ConeGeometry(0.8, 1.2, 8);
                break;
        }

        const hairMaterial = new THREE.MeshLambertMaterial({ color: game.playerData.appearance.hairColor });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 2.8;
        hair.castShadow = true;
        playerGroup.add(hair);
    }

    // Position player
    playerGroup.position.set(0, 0, 0);
    playerGroup.userData = { type: 'player', health: game.playerData.stats.health };

    game.player = playerGroup;
    game.scene.add(playerGroup);

    // Position camera
    updateCamera();
}

function initializeEnemies() {
    const enemyTypes = [
        { name: 'Goblin', color: 0x8B4513, health: 60, damage: 8, xp: 15, level: 1 },
        { name: 'Orc', color: 0x556B2F, health: 100, damage: 15, xp: 25, level: 2 },
        { name: 'Troll', color: 0x2F4F4F, health: 180, damage: 25, xp: 40, level: 3 }
    ];

    for (let i = 0; i < 25; i++) {
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        createEnemy(type);
    }
}

function createEnemy(type) {
    const enemyGroup = new THREE.Group();

    // Body (different shape for different enemies)
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.6, 1.5, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: type.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    enemyGroup.add(body);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 4, 4);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 1.8, 0.4);
    enemyGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 1.8, 0.4);
    enemyGroup.add(rightEye);

    // Random position (away from player)
    let x, z;
    do {
        x = (Math.random() - 0.5) * 400;
        z = (Math.random() - 0.5) * 400;
    } while (Math.sqrt(x * x + z * z) < 20); // At least 20 units from center

    enemyGroup.position.x = x;
    enemyGroup.position.z = z;
    enemyGroup.position.y = getTerrainHeight(x, z);

    // Enemy data
    enemyGroup.userData = {
        type: 'enemy',
        enemyType: type.name,
        health: type.health,
        maxHealth: type.health,
        damage: type.damage,
        xpReward: type.xp,
        level: type.level,
        state: 'idle',
        spawnPosition: { x, y: enemyGroup.position.y, z },
        lastAttack: 0,
        target: null,
        moveDirection: new THREE.Vector3(),
        wanderTarget: new THREE.Vector3(x, 0, z),
        aggroRange: 15,
        returnRange: 25
    };

    game.world.enemies.push(enemyGroup);
    game.scene.add(enemyGroup);
}

function initializeNPCs() {
    const npcData = [
        {
            name: 'Village Elder',
            position: { x: 30, z: 30 },
            color: 0x8B4513,
            dialogue: [
                "Welcome, young adventurer!",
                "The world is dangerous, but filled with opportunity.",
                "Seek out the ancient ruins to the north for great treasure!"
            ],
            quests: ['ancient_ruins', 'collect_herbs']
        },
        {
            name: 'Merchant',
            position: { x: -25, z: 40 },
            color: 0x4B0082,
            dialogue: [
                "Welcome to my shop!",
                "I have the finest wares in the land!",
                "Come back anytime, friend!"
            ],
            isShop: true
        },
        {
            name: 'Guard Captain',
            position: { x: 0, z: 50 },
            color: 0x2F4F4F,
            dialogue: [
                "Stay safe out there, citizen.",
                "The monsters have been more aggressive lately.",
                "We could use more brave souls like you!"
            ],
            quests: ['monster_threat']
        }
    ];

    npcData.forEach(data => createNPC(data));
}

function createNPC(data) {
    const npcGroup = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.4, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: data.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    npcGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.6, 8, 6);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xfdbcb4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.2;
    head.castShadow = true;
    npcGroup.add(head);

    // Position
    npcGroup.position.x = data.position.x;
    npcGroup.position.z = data.position.z;
    npcGroup.position.y = getTerrainHeight(data.position.x, data.position.z);

    // NPC data
    npcGroup.userData = {
        type: 'npc',
        name: data.name,
        dialogue: data.dialogue,
        dialogueIndex: 0,
        quests: data.quests || [],
        isShop: data.isShop || false
    };

    game.world.npcs.push(npcGroup);
    game.scene.add(npcGroup);

    // Add name label
    createNameLabel(npcGroup, data.name, 0xffff00);
}

function createNameLabel(object, name, color) {
    // For now, we'll store the name in userData and render it in the UI
    object.userData.displayName = name;
    object.userData.nameColor = color;
}

function initializeOtherPlayers() {
    const playerNames = [
        'DragonSlayer_2023', 'MageKnight', 'ShadowRogue', 'HealingHand', 'BeastMaster',
        'IronWill', 'FireStorm', 'NightCrawler', 'GoldSeeker', 'WarriorPoet'
    ];

    for (let i = 0; i < 8; i++) {
        createOtherPlayer(playerNames[i]);
    }
}

function createOtherPlayer(name) {
    const playerGroup = new THREE.Group();

    // Similar to player but different colors
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7, 0xdda0dd, 0x98d8c8];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Head
    const headGeometry = new THREE.SphereGeometry(0.7, 8, 6);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xfdbcb4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.3;
    head.castShadow = true;
    playerGroup.add(head);

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.7, 1.8, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    body.castShadow = true;
    playerGroup.add(body);

    // Random position
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 100;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;

    playerGroup.position.x = x;
    playerGroup.position.z = z;
    playerGroup.position.y = getTerrainHeight(x, z);

    // AI data
    playerGroup.userData = {
        type: 'otherPlayer',
        name: name,
        level: Math.floor(Math.random() * 10) + 1,
        waypoints: [],
        currentWaypoint: 0,
        state: 'wandering',
        lastChat: Date.now() + Math.random() * 30000,
        moveSpeed: 2 + Math.random()
    };

    // Generate waypoints
    for (let i = 0; i < 5; i++) {
        const wpAngle = Math.random() * Math.PI * 2;
        const wpDistance = 10 + Math.random() * 40;
        playerGroup.userData.waypoints.push({
            x: x + Math.cos(wpAngle) * wpDistance,
            z: z + Math.sin(wpAngle) * wpDistance
        });
    }

    game.world.otherPlayers.push(playerGroup);
    game.scene.add(playerGroup);

    // Add name label
    createNameLabel(playerGroup, name, 0xffffff);
}

function initializeSkills() {
    game.playerData.skills = [
        {
            name: 'Fireball',
            description: 'Shoots a fireball at target location',
            manaCost: 20,
            cooldown: 5000,
            lastUsed: 0,
            damage: 30,
            requiredLevel: 3,
            icon: '🔥',
            type: 'projectile'
        },
        {
            name: 'Heal',
            description: 'Restores health',
            manaCost: 25,
            cooldown: 10000,
            lastUsed: 0,
            healing: 40,
            requiredLevel: 1,
            icon: '💚',
            type: 'self'
        },
        {
            name: 'Dash',
            description: 'Teleports forward',
            staminaCost: 15,
            cooldown: 8000,
            lastUsed: 0,
            distance: 10,
            requiredLevel: 5,
            icon: '💨',
            type: 'movement'
        },
        {
            name: 'Shield',
            description: 'Temporary defense boost',
            manaCost: 30,
            cooldown: 15000,
            lastUsed: 0,
            duration: 5000,
            defenseBoost: 20,
            requiredLevel: 7,
            icon: '🛡️',
            type: 'buff'
        },
        {
            name: 'Area Attack',
            description: 'Damages all nearby enemies',
            manaCost: 35,
            cooldown: 12000,
            lastUsed: 0,
            damage: 25,
            radius: 8,
            requiredLevel: 10,
            icon: '💥',
            type: 'area'
        }
    ];

    updateSkillBar();
}

function initializeQuests() {
    const questTemplates = [
        {
            id: 'ancient_ruins',
            title: 'Ancient Ruins',
            description: 'Explore the mysterious ruins to the north',
            objectives: [
                { type: 'explore', target: { x: 0, z: -100 }, radius: 10, current: 0, required: 1, text: 'Reach the ancient ruins' }
            ],
            rewards: { xp: 100, gold: 50 },
            giver: 'Village Elder'
        },
        {
            id: 'collect_herbs',
            title: 'Herb Collection',
            description: 'Collect healing herbs for the village',
            objectives: [
                { type: 'kill', target: 'Goblin', current: 0, required: 5, text: 'Defeat 5 Goblins for herbs' }
            ],
            rewards: { xp: 75, gold: 30 },
            giver: 'Village Elder'
        },
        {
            id: 'monster_threat',
            title: 'Monster Threat',
            description: 'Reduce the monster population around the village',
            objectives: [
                { type: 'kill', target: 'any', current: 0, required: 10, text: 'Defeat 10 monsters' }
            ],
            rewards: { xp: 150, gold: 75 },
            giver: 'Guard Captain'
        }
    ];

    // Auto-assign first quest
    if (questTemplates.length > 0) {
        addQuest(questTemplates[0]);
    }
}

function addQuest(questTemplate) {
    const quest = JSON.parse(JSON.stringify(questTemplate)); // Deep copy
    quest.status = 'active';
    quest.startTime = Date.now();

    game.playerData.activeQuests.push(quest);
    updateQuestLog();

    addChatMessage('System', `New quest: ${quest.title}`, '#ffff00');
}

function updateQuestProgress(type, target = null) {
    game.playerData.activeQuests.forEach(quest => {
        if (quest.status !== 'active') return;

        quest.objectives.forEach(objective => {
            if (objective.type === type) {
                if (type === 'kill') {
                    if (target === objective.target || objective.target === 'any') {
                        objective.current = Math.min(objective.current + 1, objective.required);
                    }
                } else if (type === 'explore') {
                    const playerPos = game.player.position;
                    const distance = Math.sqrt(
                        Math.pow(playerPos.x - objective.target.x, 2) +
                        Math.pow(playerPos.z - objective.target.z, 2)
                    );
                    if (distance <= objective.radius) {
                        objective.current = 1;
                    }
                }
            }
        });

        // Check if quest is complete
        const allCompleted = quest.objectives.every(obj => obj.current >= obj.required);
        if (allCompleted && quest.status === 'active') {
            completeQuest(quest);
        }
    });

    updateQuestLog();
}

function completeQuest(quest) {
    quest.status = 'completed';

    // Give rewards
    game.playerData.stats.xp += quest.rewards.xp;
    game.playerData.stats.gold += quest.rewards.gold || 0;

    addChatMessage('System', `Quest completed: ${quest.title}! Gained ${quest.rewards.xp} XP!`, '#00ff00');

    // Check for level up
    checkLevelUp();
    updateUI();
}

function initializeInventory() {
    // Initialize empty inventory
    for (let i = 0; i < 20; i++) {
        game.playerData.inventory.push(null);
    }

    // Create inventory grid
    const inventoryGrid = document.getElementById('inventoryGrid');
    for (let i = 0; i < 20; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.dataset.slot = i;

        slot.addEventListener('click', () => useInventoryItem(i));
        slot.addEventListener('dragover', e => e.preventDefault());
        slot.addEventListener('drop', e => handleInventoryDrop(e, i));

        inventoryGrid.appendChild(slot);
    }

    // Add some starting items
    addItemToInventory({ type: 'potion', name: 'Health Potion', effect: 'heal', value: 50, icon: '🧪', rarity: 'common' });
    addItemToInventory({ type: 'potion', name: 'Mana Potion', effect: 'mana', value: 30, icon: '🔮', rarity: 'common' });
}

function addItemToInventory(item) {
    for (let i = 0; i < game.playerData.inventory.length; i++) {
        if (game.playerData.inventory[i] === null) {
            game.playerData.inventory[i] = item;
            updateInventoryDisplay();
            return true;
        }
    }
    return false; // Inventory full
}

function updateInventoryDisplay() {
    const slots = document.querySelectorAll('.inventory-slot');
    slots.forEach((slot, index) => {
        const item = game.playerData.inventory[index];
        if (item) {
            slot.textContent = item.icon || '📦';
            slot.classList.add('occupied');
            slot.title = `${item.name}\n${item.description || ''}`;
        } else {
            slot.textContent = '';
            slot.classList.remove('occupied');
            slot.title = '';
        }
    });
}

function useInventoryItem(slotIndex) {
    const item = game.playerData.inventory[slotIndex];
    if (!item) return;

    if (item.type === 'potion') {
        if (item.effect === 'heal') {
            const healAmount = Math.min(item.value, game.playerData.stats.maxHealth - game.playerData.stats.health);
            game.playerData.stats.health += healAmount;
            showFloatingText(game.player.position, `+${healAmount}`, '#00ff00');
        } else if (item.effect === 'mana') {
            const manaAmount = Math.min(item.value, game.playerData.stats.maxMana - game.playerData.stats.mana);
            game.playerData.stats.mana += manaAmount;
            showFloatingText(game.player.position, `+${manaAmount} MP`, '#0066ff');
        }

        // Remove item from inventory
        game.playerData.inventory[slotIndex] = null;
        updateInventoryDisplay();
        updateUI();

        addChatMessage('System', `Used ${item.name}`, '#ffff00');
    }
}

function handleInventoryDrop(e, slotIndex) {
    // Placeholder for drag and drop functionality
    e.preventDefault();
}

function initializeControls() {
    // Keyboard controls
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Mouse controls
    document.addEventListener('click', onMouseClick);
    document.addEventListener('mousemove', onMouseMove);

    // Chat input
    const chatInput = document.getElementById('chatInput');
    chatInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW':
            game.controls.forward = true;
            break;
        case 'KeyS':
            game.controls.backward = true;
            break;
        case 'KeyA':
            game.controls.left = true;
            break;
        case 'KeyD':
            game.controls.right = true;
            break;
        case 'Space':
            event.preventDefault();
            game.controls.jump = true;
            break;
        case 'ShiftLeft':
            game.controls.sprint = true;
            break;
        case 'KeyI':
            toggleInventory();
            break;
        case 'Escape':
            toggleSettings();
            break;
        case 'KeyE':
            interactWithNearby();
            break;
        // Skill keys
        case 'Digit1':
            useSkill(0);
            break;
        case 'Digit2':
            useSkill(1);
            break;
        case 'Digit3':
            useSkill(2);
            break;
        case 'Digit4':
            useSkill(3);
            break;
        case 'Digit5':
            useSkill(4);
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW':
            game.controls.forward = false;
            break;
        case 'KeyS':
            game.controls.backward = false;
            break;
        case 'KeyA':
            game.controls.left = false;
            break;
        case 'KeyD':
            game.controls.right = false;
            break;
        case 'Space':
            game.controls.jump = false;
            break;
        case 'ShiftLeft':
            game.controls.sprint = false;
            break;
    }
}

function onMouseClick(event) {
    if (event.target.id === 'gameCanvas') {
        // Check for enemy click
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, game.camera);

        const enemies = game.world.enemies.filter(enemy => enemy.userData.health > 0);
        const intersects = raycaster.intersectObjects(enemies, true);

        if (intersects.length > 0) {
            const enemy = intersects[0].object.parent;
            if (enemy.userData.type === 'enemy') {
                attackEnemy(enemy);
            }
        }
    }
}

function onMouseMove(event) {
    // Could implement camera rotation here
}

function attackEnemy(enemy) {
    const currentTime = Date.now();
    if (currentTime - (game.playerData.lastAttack || 0) < 1500) return; // Attack cooldown

    const distance = game.player.position.distanceTo(enemy.position);
    if (distance > 5) {
        addChatMessage('System', 'Target too far away!', '#ff0000');
        return;
    }

    game.playerData.lastAttack = currentTime;
    game.ui.selectedTarget = enemy;

    // Calculate damage
    const baseDamage = game.playerData.stats.strength * 2;
    const variance = (Math.random() - 0.5) * 20; // ±10
    const isCritical = Math.random() < 0.1; // 10% crit chance
    let damage = Math.floor(baseDamage + variance - (enemy.userData.defense || 0) * 0.5);

    if (isCritical) {
        damage *= 2;
    }

    damage = Math.max(1, damage); // Minimum 1 damage

    // Apply damage
    enemy.userData.health -= damage;

    // Show damage number
    showFloatingText(enemy.position, damage.toString(), isCritical ? '#ff8800' : '#ff4444');

    // Play attack sound effect (visual notification)
    addChatMessage('System', '⚔️ sword swing', '#666666');

    if (enemy.userData.health <= 0) {
        killEnemy(enemy);
    } else {
        // Make enemy aggressive
        enemy.userData.state = 'chase';
        enemy.userData.target = game.player;
    }

    updateTargetFrame();
}

function killEnemy(enemy) {
    // Give XP
    game.playerData.stats.xp += enemy.userData.xpReward;

    // Update quest progress
    updateQuestProgress('kill', enemy.userData.enemyType);
    updateQuestProgress('kill', 'any');

    // Drop loot
    if (Math.random() < 0.4) { // 40% chance
        dropLoot(enemy.position);
    }

    // Gain gold
    const goldGain = Math.floor(Math.random() * 20) + 5;
    game.playerData.stats.gold += goldGain;

    // Show XP gain
    showFloatingText(enemy.position, `+${enemy.userData.xpReward}
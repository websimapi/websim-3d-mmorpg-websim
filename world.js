import { game } from './game.js';

export function generateWorld() {
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

    // Create NPCs
    createNPCs();

    // Create AI players
    createAIPlayers();

    // Create skybox
    const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    game.scene.add(sky);
}

export function getTerrainHeight(x, z) {
    return Math.sin(x * 0.02) * Math.cos(z * 0.02) * 5 + 
           Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
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

function createNPCs() {
    const npcData = [
        {
            name: "Village Elder",
            position: { x: 10, z: 10 },
            color: 0x8B4513,
            dialogues: ["Welcome to our village, traveler!", "The goblins have been troubling us lately.", "Please help us!"],
            quests: [{
                id: 'goblin_slayer',
                title: 'Goblin Problem',
                description: 'Defeat 5 goblins threatening the village',
                objectives: [{ type: 'kill', target: 'Goblin', current: 0, required: 5, description: 'Defeat Goblins' }],
                rewards: { xp: 100, gold: 50 }
            }]
        },
        {
            name: "Merchant",
            position: { x: -15, z: 5 },
            color: 0x4169E1,
            dialogues: ["Welcome to my shop!", "I have the finest goods!", "Come back anytime!"],
            quests: []
        },
        {
            name: "Guard Captain",
            position: { x: 20, z: -10 },
            color: 0x2F4F4F,
            dialogues: ["Stay alert, citizen.", "The roads are dangerous.", "Train hard and stay strong."],
            quests: [{
                id: 'orc_threat',
                title: 'Orc Menace',
                description: 'Clear out the orc camp',
                objectives: [{ type: 'kill', target: 'Orc', current: 0, required: 3, description: 'Defeat Orcs' }],
                rewards: { xp: 200, gold: 100, items: [{ type: 'weapon', name: 'Iron Sword', damage: 15, icon: '⚔️' }] }
            }]
        }
    ];

    npcData.forEach(data => {
        const npc = createNPC(data);
        game.world.npcs.push(npc);
        game.scene.add(npc);
    });
}

function createNPC(data) {
    const npcGroup = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.6, 0.8, 1.8, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: data.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    npcGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.7, 8, 6);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xfdbcb4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.3;
    head.castShadow = true;
    npcGroup.add(head);

    // Position
    npcGroup.position.set(data.position.x, getTerrainHeight(data.position.x, data.position.z), data.position.z);

    // User data
    npcGroup.userData = {
        type: 'npc',
        name: data.name,
        dialogues: data.dialogues,
        quests: data.quests,
        currentDialogue: 0
    };

    return npcGroup;
}

function createAIPlayers() {
    const playerNames = ["Shadowblade", "FireMage", "HealBot", "WarriorX", "RogueOne", "IceMage", "PaladinDude"];
    
    for (let i = 0; i < 5; i++) {
        const aiPlayer = createAIPlayer(playerNames[i] || `Player${i}`);
        game.world.otherPlayers.push(aiPlayer);
        game.scene.add(aiPlayer);
    }
}

function createAIPlayer(name) {
    const playerGroup = new THREE.Group();

    // Similar to player but different colors
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b, 0xeb4d4b, 0x6c5ce7];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.6, 0.8, 2, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    playerGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.8, 8, 6);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xfdbcb4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.5;
    head.castShadow = true;
    playerGroup.add(head);

    // Random position
    let x, z;
    do {
        x = (Math.random() - 0.5) * 100;
        z = (Math.random() - 0.5) * 100;
    } while (Math.sqrt(x * x + z * z) < 10);

    playerGroup.position.set(x, getTerrainHeight(x, z), z);

    playerGroup.userData = {
        type: 'ai_player',
        name: name,
        level: Math.floor(Math.random() * 10) + 1,
        moveTarget: new THREE.Vector3(),
        lastAction: 0,
        state: 'idle'
    };

    return playerGroup;
}

export function updateAIPlayers() {
    const currentTime = Date.now();
    
    game.world.otherPlayers.forEach(aiPlayer => {
        // Random behavior every 3-10 seconds
        if (currentTime - aiPlayer.userData.lastAction > (3000 + Math.random() * 7000)) {
            aiPlayer.userData.lastAction = currentTime;
            
            const action = Math.random();
            if (action < 0.3) {
                // Move to random location
                const angle = Math.random() * Math.PI * 2;
                const distance = 10 + Math.random() * 20;
                aiPlayer.userData.moveTarget.set(
                    aiPlayer.position.x + Math.cos(angle) * distance,
                    0,
                    aiPlayer.position.z + Math.sin(angle) * distance
                );
                aiPlayer.userData.state = 'moving';
            } else if (action < 0.4) {
                // Jump
                aiPlayer.userData.jumpVelocity = 5;
            }
        }

        // Execute movement
        if (aiPlayer.userData.state === 'moving') {
            const direction = new THREE.Vector3()
                .subVectors(aiPlayer.userData.moveTarget, aiPlayer.position)
                .normalize();
            
            if (aiPlayer.position.distanceTo(aiPlayer.userData.moveTarget) > 1) {
                aiPlayer.position.add(direction.multiplyScalar(3 * game.time.deltaTime));
            } else {
                aiPlayer.userData.state = 'idle';
            }
        }

        // Apply jumping
        if (aiPlayer.userData.jumpVelocity !== undefined) {
            aiPlayer.position.y += aiPlayer.userData.jumpVelocity * game.time.deltaTime;
            aiPlayer.userData.jumpVelocity -= 15 * game.time.deltaTime;

            const groundHeight = getTerrainHeight(aiPlayer.position.x, aiPlayer.position.z);
            if (aiPlayer.position.y <= groundHeight) {
                aiPlayer.position.y = groundHeight;
                aiPlayer.userData.jumpVelocity = undefined;
            }
        }

        // Keep on terrain
        aiPlayer.position.y = getTerrainHeight(aiPlayer.position.x, aiPlayer.position.z);
    });
}
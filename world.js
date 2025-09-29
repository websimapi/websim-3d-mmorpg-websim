import * as THREE from 'three';
import { game } from './game.js';

export function getTerrainHeight(x, z) {
    return Math.sin(x * 0.02) * Math.cos(z * 0.02) * 5 + 
           Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
}

export function initializeWorld() {
    generateTerrain();
    generateTrees();
    generateRocks();
    createSkybox();
    initializeNPCs();
    initializeOtherPlayers();
}

function generateTerrain() {
    const terrainGeometry = new THREE.PlaneGeometry(500, 500, 100, 100);
    
    const vertices = terrainGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        vertices[i + 1] = getTerrainHeight(x, z);
    }
    terrainGeometry.attributes.position.needsUpdate = true;
    terrainGeometry.computeVertexNormals();

    const terrainMaterial = new THREE.MeshLambertMaterial({ color: 0x3a5f0b });
    game.world.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    game.world.terrain.rotation.x = -Math.PI / 2;
    game.world.terrain.receiveShadow = true;
    game.scene.add(game.world.terrain);
}

function generateTrees() {
    for (let i = 0; i < 200; i++) {
        createTree();
    }
}

function createTree() {
    const treeGroup = new THREE.Group();
    
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 6, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 3;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const foliageGeometry = new THREE.SphereGeometry(3, 8, 6);
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 7;
    foliage.castShadow = true;
    treeGroup.add(foliage);

    treeGroup.position.x = (Math.random() - 0.5) * 400;
    treeGroup.position.z = (Math.random() - 0.5) * 400;
    treeGroup.position.y = getTerrainHeight(treeGroup.position.x, treeGroup.position.z);

    game.scene.add(treeGroup);
    game.world.objects.push(treeGroup);
}

function generateRocks() {
    for (let i = 0; i < 50; i++) {
        createRock();
    }
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

function createSkybox() {
    const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    game.scene.add(sky);
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
    
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.4, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: data.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    npcGroup.add(body);

    const headGeometry = new THREE.SphereGeometry(0.6, 8, 6);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xfdbcb4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.2;
    head.castShadow = true;
    npcGroup.add(head);

    npcGroup.position.x = data.position.x;
    npcGroup.position.z = data.position.z;
    npcGroup.position.y = getTerrainHeight(data.position.x, data.position.z);

    npcGroup.userData = {
        type: 'npc',
        name: data.name,
        dialogue: data.dialogue,
        dialogueIndex: 0,
        quests: data.quests || [],
        isShop: data.isShop || false,
        displayName: data.name,
        nameColor: 0xffff00
    };

    game.world.npcs.push(npcGroup);
    game.scene.add(npcGroup);
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
    
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7, 0xdda0dd, 0x98d8c8];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const headGeometry = new THREE.SphereGeometry(0.7, 8, 6);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xfdbcb4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.3;
    head.castShadow = true;
    playerGroup.add(head);

    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.7, 1.8, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    body.castShadow = true;
    playerGroup.add(body);

    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 100;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;

    playerGroup.position.x = x;
    playerGroup.position.z = z;
    playerGroup.position.y = getTerrainHeight(x, z);

    playerGroup.userData = {
        type: 'otherPlayer',
        name: name,
        level: Math.floor(Math.random() * 10) + 1,
        waypoints: [],
        currentWaypoint: 0,
        state: 'wandering',
        lastChat: Date.now() + Math.random() * 30000,
        moveSpeed: 2 + Math.random(),
        displayName: name,
        nameColor: 0xffffff
    };

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
}

export function updateOtherPlayers() {
    const deltaTime = game.time.deltaTime;
    
    game.world.otherPlayers.forEach(player => {
        if (player.userData.waypoints.length > 0) {
            const targetWaypoint = player.userData.waypoints[player.userData.currentWaypoint];
            const direction = new THREE.Vector3()
                .subVectors(
                    new THREE.Vector3(targetWaypoint.x, 0, targetWaypoint.z),
                    player.position
                )
                .normalize();
            
            const distance = player.position.distanceTo(new THREE.Vector3(targetWaypoint.x, 0, targetWaypoint.z));
            
            if (distance < 2) {
                player.userData.currentWaypoint = (player.userData.currentWaypoint + 1) % player.userData.waypoints.length;
            } else {
                player.position.add(direction.multiplyScalar(player.userData.moveSpeed * deltaTime));
            }
        }
        
        player.position.y = getTerrainHeight(player.position.x, player.position.z);
    });
}
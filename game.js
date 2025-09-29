import { initializeWorld, getTerrainHeight } from './world.js';
import { initializePlayer, updatePlayer, createPlayer } from './player.js';
import { initializeEnemies, updateEnemies } from './enemies.js';
import { initializeUI, updateUI, initializeCharacterCreation } from './ui.js';
import { initializeSkills } from './skills.js';
import { initializeQuests } from './quests.js';
import * as THREE from 'three';

// Game State (exported for other modules to use)
export const game = {
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

const loadingTips = [
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

function initializeThreeJS() {
    game.scene = new THREE.Scene();
    game.scene.background = new THREE.Color(0x87CEEB);

    game.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const canvas = document.getElementById('gameCanvas');
    game.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    game.renderer.setSize(window.innerWidth, window.innerHeight);
    game.renderer.setPixelRatio(window.devicePixelRatio);
    game.renderer.shadowMap.enabled = true;
    game.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
}

export function startGame() {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username || username.length < 3) {
        alert('Please enter a username (3+ characters)');
        return;
    }

    // Store character data
    game.playerData.username = username;
    const characterCreation = initializeCharacterCreation();
    game.playerData.class = characterCreation.selectedClass;
    game.playerData.appearance.skinColor = characterCreation.selectedSkinColor;
    game.playerData.appearance.hairColor = characterCreation.selectedHairColor;
    game.playerData.appearance.hairStyle = document.getElementById('hairStyleSelect').value;

    // Apply class bonuses
    switch (game.playerData.class) {
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

    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('loadingScreen').style.display = 'flex';

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

        if (Math.random() < 0.3) {
            const tip = loadingTips[Math.floor(Math.random() * loadingTips.length)];
            document.getElementById('loadingTip').textContent = 'Tip: ' + tip;
        }
    }, 100);
}

function initializeGame() {
    initializeThreeJS();
    initializeWorld();
    createPlayer();
    initializeEnemies();
    initializeSkills();
    initializeQuests();
    initializeUI();
    startGameLoop();
}

function updateCamera() {
    const targetPos = new THREE.Vector3()
        .copy(game.player.position)
        .add(new THREE.Vector3(
            game.cameraData.offset.x + game.cameraData.shake.x,
            game.cameraData.offset.y + game.cameraData.shake.y,
            game.cameraData.offset.z
        ));

    game.camera.position.lerp(targetPos, 0.1);
    game.camera.lookAt(game.player.position);

    if (game.cameraData.shake.duration > 0) {
        game.cameraData.shake.duration -= game.time.deltaTime * 1000;
        game.cameraData.shake.x = (Math.random() - 0.5) * game.cameraData.shake.intensity;
        game.cameraData.shake.y = (Math.random() - 0.5) * game.cameraData.shake.intensity;
    } else {
        game.cameraData.shake.x = 0;
        game.cameraData.shake.y = 0;
        game.cameraData.shake.intensity = 0;
    }
}

function updateParticles() {
    const deltaTime = game.time.deltaTime;

    for (let i = game.world.particles.length - 1; i >= 0; i--) {
        const particle = game.world.particles[i];

        particle.position.x += particle.velocity.x * deltaTime;
        particle.position.y += particle.velocity.y * deltaTime;
        particle.position.z += particle.velocity.z * deltaTime;

        particle.life -= deltaTime;

        if (particle.life <= 0) {
            game.world.particles.splice(i, 1);
        }
    }
}

function startGameLoop() {
    function gameLoop(currentTime) {
        game.time.deltaTime = (currentTime - game.time.lastFrame) / 1000;
        game.time.lastFrame = currentTime;
        game.time.deltaTime = Math.min(game.time.deltaTime, 0.016);

        updatePlayer();
        updateEnemies();
        updateParticles();
        updateCamera();
        updateUI();

        game.renderer.render(game.scene, game.camera);
        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
}

// Make functions globally accessible
window.startGame = startGame;

// Initialize character creation when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeCharacterCreation();
});
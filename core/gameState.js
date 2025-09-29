// Game State Management
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

export const loadingTips = [
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

export { loadingTips } from './gameState.js';
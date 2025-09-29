// Core game state and initialization
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

export function initializeGame() {
    import('./renderer.js').then(module => module.initializeThreeJS());
    import('./world.js').then(module => module.generateWorld());
    import('./player.js').then(module => module.createPlayer());
    import('./enemies.js').then(module => module.initializeEnemies());
    import('./npcs.js').then(module => module.initializeNPCs());
    import('./otherPlayers.js').then(module => module.initializeOtherPlayers());
    import('./skills.js').then(module => module.initializeSkills());
    import('./quests.js').then(module => module.initializeQuests());
    import('./inventory.js').then(module => module.initializeInventory());
    import('./controls.js').then(module => module.initializeControls());
    import('./chat.js').then(module => module.initializeChatSystem());
    import('./gameLoop.js').then(module => module.startGameLoop());
    
    import('./chat.js').then(module => 
        module.addChatMessage('System', 'Welcome to the world, ' + game.playerData.username + '!', '#ffff00')
    );
}
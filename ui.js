import { game, initializeGame } from './game.js';
import { getCharacterData } from './characterCreation.js';
import { addChatMessage } from './chat.js';

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

export function startGame() {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username || username.length < 3) {
        alert('Please enter a username (3+ characters)');
        return;
    }

    const charData = getCharacterData();
    game.playerData.username = username;
    game.playerData.class = charData.class;
    game.playerData.appearance.skinColor = charData.skinColor;
    game.playerData.appearance.hairColor = charData.hairColor;
    game.playerData.appearance.hairStyle = charData.hairStyle;

    // Apply class bonuses
    switch (charData.class) {
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

export function updateUI() {
    const healthPercent = (game.playerData.stats.health / game.playerData.stats.maxHealth) * 100;
    document.querySelector('#healthBar .bar-fill').style.width = healthPercent + '%';
    document.querySelector('#healthBar .bar-text').textContent = 
        `${Math.floor(game.playerData.stats.health)}/${game.playerData.stats.maxHealth}`;
    
    const manaPercent = (game.playerData.stats.mana / game.playerData.stats.maxMana) * 100;
    document.querySelector('#manaBar .bar-fill').style.width = manaPercent + '%';
    document.querySelector('#manaBar .bar-text').textContent = 
        `${Math.floor(game.playerData.stats.mana)}/${game.playerData.stats.maxMana}`;
    
    const staminaPercent = (game.playerData.stats.stamina / game.playerData.stats.maxStamina) * 100;
    document.querySelector('#staminaBar .bar-fill').style.width = staminaPercent + '%';
    document.querySelector('#staminaBar .bar-text').textContent = 
        `${Math.floor(game.playerData.stats.stamina)}/${game.playerData.stats.maxStamina}`;
    
    const xpPercent = (game.playerData.stats.xp / game.playerData.stats.xpRequired) * 100;
    document.querySelector('#xpBar .xp-fill').style.width = xpPercent + '%';
    document.getElementById('levelText').textContent = 
        `Level ${game.playerData.stats.level} - ${game.playerData.stats.xp}/${game.playerData.stats.xpRequired} XP`;
    
    document.getElementById('goldCounter').textContent = `💰 ${game.playerData.stats.gold} Gold`;
    
    import('./skills.js').then(module => module.updateSkillBar());
}

export function updateTargetFrame() {
    const target = game.ui.selectedTarget;
    const targetFrame = document.getElementById('targetFrame');
    
    if (target && target.userData.health > 0) {
        targetFrame.style.display = 'block';
        document.getElementById('targetName').textContent = target.userData.enemyType;
        document.getElementById('targetLevel').textContent = `Level ${target.userData.level}`;
        
        const healthPercent = (target.userData.health / target.userData.maxHealth) * 100;
        document.getElementById('targetHealthFill').style.width = healthPercent + '%';
    } else {
        targetFrame.style.display = 'none';
        game.ui.selectedTarget = null;
    }
}

export function updateMinimap() {
    const canvas = document.getElementById('minimapCanvas');
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, 146, 146);
    
    const scale = 0.3;
    const centerX = 73;
    const centerY = 73;
    
    // Draw player
    ctx.fillStyle = '#00aaff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw enemies
    ctx.fillStyle = '#ff4444';
    game.world.enemies.forEach(enemy => {
        if (enemy.userData.health <= 0) return;
        
        const relativeX = (enemy.position.x - game.player.position.x) * scale;
        const relativeZ = (enemy.position.z - game.player.position.z) * scale;
        
        const mapX = centerX + relativeX;
        const mapY = centerY + relativeZ;
        
        if (mapX >= 0 && mapX <= 146 && mapY >= 0 && mapY <= 146) {
            ctx.beginPath();
            ctx.arc(mapX, mapY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Draw NPCs
    ctx.fillStyle = '#ffff00';
    game.world.npcs.forEach(npc => {
        const relativeX = (npc.position.x - game.player.position.x) * scale;
        const relativeZ = (npc.position.z - game.player.position.z) * scale;
        
        const mapX = centerX + relativeX;
        const mapY = centerY + relativeZ;
        
        if (mapX >= 0 && mapX <= 146 && mapY >= 0 && mapY <= 146) {
            ctx.beginPath();
            ctx.arc(mapX, mapY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Draw other players
    ctx.fillStyle = '#ffffff';
    game.world.otherPlayers.forEach(player => {
        const relativeX = (player.position.x - game.player.position.x) * scale;
        const relativeZ = (player.position.z - game.player.position.z) * scale;
        
        const mapX = centerX + relativeX;
        const mapY = centerY + relativeZ;
        
        if (mapX >= 0 && mapX <= 146 && mapY >= 0 && mapY <= 146) {
            ctx.beginPath();
            ctx.arc(mapX, mapY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

export function toggleInventory() {
    const inventory = document.getElementById('inventory');
    game.ui.inventoryOpen = !game.ui.inventoryOpen;
    inventory.style.display = game.ui.inventoryOpen ? 'block' : 'none';
    
    if (game.ui.inventoryOpen) {
        import('./inventory.js').then(module => module.updateInventoryDisplay());
    }
}

export function toggleSettings() {
    const settings = document.getElementById('settingsMenu');
    game.ui.settingsOpen = !game.ui.settingsOpen;
    settings.style.display = game.ui.settingsOpen ? 'block' : 'none';
}

export function logout() {
    location.reload();
}
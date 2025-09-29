import { game } from '../core/gameState.js';
import { updatePlayer } from './player.js';
import { updateEnemies } from './enemies.js';
import { updateOtherPlayers } from './otherPlayers.js';
import { checkNPCInteraction } from './npcs.js';

export function startGameLoop() {
    game.time.lastFrame = performance.now();
    gameLoop();
}

function gameLoop() {
    const currentTime = performance.now();
    game.time.deltaTime = (currentTime - game.time.lastFrame) / 1000;
    game.time.lastFrame = currentTime;
    
    // Update game systems
    updatePlayer(game.time.deltaTime);
    updateEnemies(game.time.deltaTime);
    updateOtherPlayers(game.time.deltaTime);
    checkNPCInteraction();
    
    // Update UI
    updateUI();
    
    // Render
    if (game.renderer && game.scene && game.camera) {
        game.renderer.render(game.scene, game.camera);
    }
    
    // Update FPS counter
    game.time.frameCount++;
    if (currentTime - game.time.lastFpsUpdate > 1000) {
        game.time.fps = game.time.frameCount;
        game.time.frameCount = 0;
        game.time.lastFpsUpdate = currentTime;
        
        document.getElementById('fpsCounter').textContent = `FPS: ${game.time.fps}`;
    }
    
    requestAnimationFrame(gameLoop);
}

function updateUI() {
    // Update health bar
    const healthPercentage = (game.playerData.stats.health / game.playerData.stats.maxHealth) * 100;
    document.querySelector('.health-fill').style.width = healthPercentage + '%';
    document.querySelector('#healthBar .bar-text').textContent = 
        `${Math.floor(game.playerData.stats.health)}/${game.playerData.stats.maxHealth}`;
    
    // Update mana bar
    const manaPercentage = (game.playerData.stats.mana / game.playerData.stats.maxMana) * 100;
    document.querySelector('.mana-fill').style.width = manaPercentage + '%';
    document.querySelector('#manaBar .bar-text').textContent = 
        `${Math.floor(game.playerData.stats.mana)}/${game.playerData.stats.maxMana}`;
    
    // Update stamina bar
    const staminaBar = document.getElementById('staminaBar');
    if (game.playerData.stats.stamina < game.playerData.stats.maxStamina || game.controls.sprint) {
        staminaBar.style.display = 'block';
        const staminaPercentage = (game.playerData.stats.stamina / game.playerData.stats.maxStamina) * 100;
        document.querySelector('.stamina-fill').style.width = staminaPercentage + '%';
        document.querySelector('#staminaBar .bar-text').textContent = 
            `${Math.floor(game.playerData.stats.stamina)}/${game.playerData.stats.maxStamina}`;
    } else {
        staminaBar.style.display = 'none';
    }
    
    // Update XP bar
    const xpPercentage = (game.playerData.stats.xp / game.playerData.stats.xpRequired) * 100;
    document.querySelector('.xp-fill').style.width = xpPercentage + '%';
    document.getElementById('levelText').textContent = 
        `Level ${game.playerData.stats.level} - ${game.playerData.stats.xp}/${game.playerData.stats.xpRequired} XP`;
    
    // Update gold counter
    document.getElementById('goldCounter').textContent = `💰 ${game.playerData.stats.gold} Gold`;
    
    // Hide interaction prompt if no NPCs nearby
    let nearNPC = false;
    game.world.npcs.forEach(npc => {
        if (npc.position.distanceTo(game.player.position) <= 3) {
            nearNPC = true;
        }
    });
    
    if (!nearNPC) {
        document.getElementById('interactionPrompt').style.display = 'none';
    }
}
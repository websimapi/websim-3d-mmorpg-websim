import { game } from './game.js';
import { updatePlayer } from './player.js';
import { updateEnemies } from './enemies.js';
import { updateCamera } from './camera.js';
import { updateUI, updateTargetFrame, updateMinimap } from './ui.js';

export function startGameLoop() {
    function gameLoop(currentTime) {
        game.time.deltaTime = (currentTime - game.time.lastFrame) / 1000;
        game.time.lastFrame = currentTime;
        game.time.deltaTime = Math.min(game.time.deltaTime, 0.016);
        
        updatePlayer();
        updateEnemies();
        
        import('./otherPlayers.js').then(module => module.updateOtherPlayers());
        import('./effects.js').then(module => module.updateParticles());
        
        updateCamera();
        updateUI();
        updateTargetFrame();
        updateMinimap();
        updateFPS();
        checkNearbyInteractions();
        
        game.renderer.render(game.scene, game.camera);
        requestAnimationFrame(gameLoop);
    }
    
    requestAnimationFrame(gameLoop);
}

function updateFPS() {
    game.time.frameCount++;
    const currentTime = Date.now();
    
    if (currentTime - game.time.lastFpsUpdate >= 1000) {
        game.time.fps = game.time.frameCount;
        game.time.frameCount = 0;
        game.time.lastFpsUpdate = currentTime;
        
        document.getElementById('fpsCounter').textContent = `FPS: ${game.time.fps}`;
    }
}

function checkNearbyInteractions() {
    const playerPos = game.player.position;
    let canInteract = false;
    
    for (const npc of game.world.npcs) {
        if (playerPos.distanceTo(npc.position) < 3) {
            canInteract = true;
            break;
        }
    }
    
    if (!canInteract) {
        for (const object of game.world.objects) {
            if (object.userData.type === 'loot' && playerPos.distanceTo(object.position) < 2) {
                canInteract = true;
                break;
            }
        }
    }
    
    document.getElementById('interactionPrompt').style.display = canInteract ? 'block' : 'none';
}


import { game } from '../core/gameState.js';
import { useSkill } from './skills.js';
import { checkNPCInteraction } from './npcs.js';

export function initializeControls() {
    // Keyboard controls
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Mouse controls
    document.addEventListener('click', onMouseClick);
    document.addEventListener('mousemove', onMouseMove);

    // Window resize
    window.addEventListener('resize', onWindowResize);

    // Chat input
    const chatInput = document.getElementById('chatInput');
    chatInput.addEventListener('keypress', (e) => {
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
            interactWithNPC();
            break;
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
        case 'Digit0':
            const skillIndex = event.code === 'Digit0' ? 9 : parseInt(event.code.slice(-1)) - 1;
            useSkill(skillIndex);
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
    // Attack enemies
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, game.camera);

    const intersects = raycaster.intersectObjects(game.world.enemies, true);
    if (intersects.length > 0) {
        const enemy = intersects[0].object.parent;
        attackEnemy(enemy);
    }
}

function onMouseMove(event) {
    // Update mouse position for targeting
}

function onWindowResize() {
    if (game.camera && game.renderer) {
        game.camera.aspect = window.innerWidth / window.innerHeight;
        game.camera.updateProjectionMatrix();
        game.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

function attackEnemy(enemy) {
    if (!enemy.userData || enemy.userData.type !== 'enemy') return;

    const damage = game.playerData.stats.strength * 2 + (Math.random() * 20 - 10);
    const isCritical = Math.random() < 0.1;
    const finalDamage = isCritical ? damage * 2 : damage;

    enemy.userData.health -= finalDamage;

    // Show damage number
    showDamageNumber(finalDamage, enemy.position, isCritical ? 'damage-critical' : 'damage-normal');

    if (enemy.userData.health <= 0) {
        // Enemy dies
        game.scene.remove(enemy);
        const index = game.world.enemies.indexOf(enemy);
        game.world.enemies.splice(index, 1);

        // Give XP and gold
        game.playerData.stats.xp += enemy.userData.xpReward;
        game.playerData.stats.gold += Math.floor(Math.random() * 10) + 5;

        checkLevelUp();

        // Update quest progress
        updateQuestProgress('kill', 'enemy');
    }

    // Set enemy to chase state
    enemy.userData.state = 'chase';
}

function interactWithNPC() {
    game.world.npcs.forEach(npc => {
        const distance = npc.position.distanceTo(game.player.position);
        if (distance <= 3) {
            // Show dialogue or quest interface
            console.log(`Talking to ${npc.userData.name}`);
            if (npc.userData.quests.length > 0) {
                acceptQuest(npc.userData.quests[0]);
            }
        }
    });
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (message) {
        addChatMessage(game.playerData.username, message, '#00ffff');
        input.value = '';
    }
}

// Import functions that are used
import { toggleInventory, toggleSettings } from '../ui/uiManager.js';
import { acceptQuest, updateQuestProgress } from './quests.js';
import { addChatMessage } from './chat.js';

function showDamageNumber(damage, position, className) {
    // Implementation moved to enemies.js to avoid duplication
}

function checkLevelUp() {
    // Implementation in skills.js
}
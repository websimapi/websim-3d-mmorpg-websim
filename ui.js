import { game } from './game.js';

export function initializeUI() {
    // Initialize UI event handlers and systems
}

export function updateUI() {
    // Health bar
    const healthPercent = (game.playerData.stats.health / game.playerData.stats.maxHealth) * 100;
    document.querySelector('#healthBar .bar-fill').style.width = healthPercent + '%';
    document.querySelector('#healthBar .bar-text').textContent = 
        `${Math.floor(game.playerData.stats.health)}/${game.playerData.stats.maxHealth}`;

    // Mana bar
    const manaPercent = (game.playerData.stats.mana / game.playerData.stats.maxMana) * 100;
    document.querySelector('#manaBar .bar-fill').style.width = manaPercent + '%';
    document.querySelector('#manaBar .bar-text').textContent = 
        `${Math.floor(game.playerData.stats.mana)}/${game.playerData.stats.maxMana}`;

    // Stamina bar
    const staminaPercent = (game.playerData.stats.stamina / game.playerData.stats.maxStamina) * 100;
    document.querySelector('#staminaBar .bar-fill').style.width = staminaPercent + '%';
    document.querySelector('#staminaBar .bar-text').textContent = 
        `${Math.floor(game.playerData.stats.stamina)}/${game.playerData.stats.maxStamina}`;

    // XP bar
    const xpPercent = (game.playerData.stats.xp / game.playerData.stats.xpRequired) * 100;
    document.querySelector('#xpBar .xp-fill').style.width = xpPercent + '%';
    document.getElementById('levelText').textContent = 
        `Level ${game.playerData.stats.level} - ${game.playerData.stats.xp}/${game.playerData.stats.xpRequired} XP`;

    // Gold counter
    document.getElementById('goldCounter').textContent = ` ${game.playerData.stats.gold} Gold`;

    updateFPS();
    updateMinimap();
    updateTargetFrame();
}

export function showFloatingText(position, text, color) {
    const floatingText = document.createElement('div');
    floatingText.className = 'damage-number';
    floatingText.textContent = text;
    floatingText.style.color = color;
    floatingText.style.left = '50%';
    floatingText.style.top = '50%';

    document.getElementById('gameUI').appendChild(floatingText);

    // Animate upward movement
    let startTime = Date.now();
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / 1000; // 1 second duration

        if (progress >= 1) {
            floatingText.remove();
            return;
        }

        // Convert world position to screen position
        const screenPos = worldToScreen(position);
        floatingText.style.left = screenPos.x + 'px';
        floatingText.style.top = (screenPos.y - progress * 50) + 'px';
        floatingText.style.opacity = 1 - progress;

        requestAnimationFrame(animate);
    };
    animate();
}

function worldToScreen(worldPosition) {
    const vector = new THREE.Vector3().copy(worldPosition);
    vector.project(game.camera);

    return {
        x: (vector.x + 1) * window.innerWidth / 2,
        y: (-vector.y + 1) * window.innerHeight / 2
    };
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

function updateMinimap() {
    const canvas = document.getElementById('minimapCanvas');
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, 146, 146);

    const scale = 0.3; // Minimap scale
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
}

function updateTargetFrame() {
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

export function toggleInventory() {
    const inventory = document.getElementById('inventory');
    game.ui.inventoryOpen = !game.ui.inventoryOpen;
    inventory.style.display = game.ui.inventoryOpen ? 'block' : 'none';
}

export function toggleSettings() {
    const settings = document.getElementById('settingsMenu');
    game.ui.settingsOpen = !game.ui.settingsOpen;
    settings.style.display = game.ui.settingsOpen ? 'block' : 'none';
}

export function logout() {
    location.reload();
}

export function updateQuestProgress(type, target = null, amount = 1) {
    game.playerData.activeQuests.forEach(quest => {
        quest.objectives.forEach(objective => {
            if (objective.type === type && objective.current < objective.required) {
                if (!target || objective.target === target) {
                    objective.current += amount;
                    if (objective.current >= objective.required) {
                        addChatMessage('System', `Quest objective completed: ${objective.description}`, '#00ff00');
                    }
                }
            }
        });

        // Check if quest is complete
        const allComplete = quest.objectives.every(obj => obj.current >= obj.required);
        if (allComplete && quest.status === 'active') {
            completeQuest(quest);
        }
    });

    updateQuestDisplay();
}

export function checkLevelUp() {
    while (game.playerData.stats.xp >= game.playerData.stats.xpRequired) {
        game.playerData.stats.xp -= game.playerData.stats.xpRequired;
        game.playerData.stats.level++;
        game.playerData.stats.xpRequired = Math.floor(game.playerData.stats.xpRequired * 1.5);

        // Increase stats
        game.playerData.stats.maxHealth += 10;
        game.playerData.stats.maxMana += 5;
        game.playerData.stats.maxStamina += 5;
        game.playerData.stats.strength += 2;
        game.playerData.stats.agility += 2;
        game.playerData.stats.intelligence += 2;
        game.playerData.stats.defense += 1;

        // Restore stats
        game.playerData.stats.health = game.playerData.stats.maxHealth;
        game.playerData.stats.mana = game.playerData.stats.maxMana;
        game.playerData.stats.stamina = game.playerData.stats.maxStamina;

        // Level up effect
        createLevelUpEffect();
        addChatMessage('System', `Level up! You are now level ${game.playerData.stats.level}!`, '#ffd700');
    }
}

function createLevelUpEffect() {
    const particles = [];
    for (let i = 0; i < 50; i++) {
        const particle = {
            position: {
                x: game.player.position.x + (Math.random() - 0.5) * 4,
                y: game.player.position.y + Math.random() * 5,
                z: game.player.position.z + (Math.random() - 0.5) * 4
            },
            velocity: {
                x: (Math.random() - 0.5) * 0.3,
                y: Math.random() * 0.5,
                z: (Math.random() - 0.5) * 0.3
            },
            life: 2.0,
            maxLife: 2.0,
            color: '#ffd700'
        };
        particles.push(particle);
    }
    game.world.particles.push(...particles);
}

function completeQuest(quest) {
    quest.status = 'completed';
    
    // Give rewards
    game.playerData.stats.xp += quest.rewards.xp || 0;
    game.playerData.stats.gold += quest.rewards.gold || 0;
    
    if (quest.rewards.items) {
        quest.rewards.items.forEach(item => {
            addItemToInventory(item);
        });
    }

    addChatMessage('System', `Quest completed: ${quest.title}! Gained ${quest.rewards.xp} XP and ${quest.rewards.gold} gold!`, '#ffd700');
    checkLevelUp();
}

function updateQuestDisplay() {
    const questList = document.getElementById('questList');
    questList.innerHTML = '';

    game.playerData.activeQuests.filter(q => q.status === 'active').forEach(quest => {
        const questDiv = document.createElement('div');
        questDiv.className = 'quest-item';
        
        questDiv.innerHTML = `
            <div class="quest-title">${quest.title}</div>
            ${quest.objectives.map(obj => `
                <div class="quest-objective">${obj.description} (${obj.current}/${obj.required})</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(obj.current / obj.required) * 100}%"></div>
                </div>
            `).join('')}
        `;
        
        questList.appendChild(questDiv);
    });
}

export function interactWithNearby() {
    // Check for nearby NPCs
    game.world.npcs.forEach(npc => {
        const distance = game.player.position.distanceTo(npc.position);
        if (distance <= 3) {
            showNPCDialogue(npc);
        }
    });
}

function showNPCDialogue(npc) {
    // Simple dialogue system
    const dialogue = npc.userData.dialogues[npc.userData.currentDialogue || 0];
    addChatMessage(npc.userData.name, dialogue, '#ffff00');
    
    // Offer quest if available
    if (npc.userData.quests && npc.userData.quests.length > 0) {
        const availableQuest = npc.userData.quests.find(q => !game.playerData.activeQuests.find(aq => aq.id === q.id));
        if (availableQuest) {
            game.playerData.activeQuests.push({...availableQuest, status: 'active'});
            addChatMessage('System', `New quest accepted: ${availableQuest.title}`, '#00ff00');
            updateQuestDisplay();
        }
    }
}

// Make functions globally accessible
window.toggleInventory = toggleInventory;
window.toggleSettings = toggleSettings;
window.logout = logout;
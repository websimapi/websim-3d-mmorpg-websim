import * as THREE from 'three';
import { game } from './game.js';
import { attackEnemy } from './enemies.js';
import { useSkill, updateSkillBar } from './skills.js';
import { updateOtherPlayers } from './world.js';

let selectedClass = 'warrior';
let selectedSkinColor = '#fdbcb4';
let selectedHairColor = '#2c1608';

export function initializeCharacterCreation() {
    document.querySelectorAll('.class-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedClass = btn.dataset.class;
        });
    });

    document.querySelectorAll('#skinColorPicker .color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('#skinColorPicker .color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedSkinColor = option.dataset.color;
        });
    });

    document.querySelectorAll('#hairColorPicker .color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('#hairColorPicker .color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedHairColor = option.dataset.color;
        });
    });

    document.querySelector('.class-btn[data-class="warrior"]').classList.add('selected');
    document.querySelector('#skinColorPicker .color-option').classList.add('selected');
    document.querySelector('#hairColorPicker .color-option').classList.add('selected');

    return { selectedClass, selectedSkinColor, selectedHairColor };
}

export function initializeUI() {
    initializeControls();
    initializeChatSystem();
    initializeInventory();

    addChatMessage('System', 'Welcome to the world, ' + game.playerData.username + '!', '#ffff00');
}

function initializeControls() {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    document.addEventListener('click', onMouseClick);
    document.addEventListener('mousemove', onMouseMove);

    const chatInput = document.getElementById('chatInput');
    chatInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW': game.controls.forward = true; break;
        case 'KeyS': game.controls.backward = true; break;
        case 'KeyA': game.controls.left = true; break;
        case 'KeyD': game.controls.right = true; break;
        case 'Space': event.preventDefault(); game.controls.jump = true; break;
        case 'ShiftLeft': game.controls.sprint = true; break;
        case 'KeyI': toggleInventory(); break;
        case 'Escape': toggleSettings(); break;
        case 'KeyE': interactWithNearby(); break;
        case 'Digit1': useSkill(0); break;
        case 'Digit2': useSkill(1); break;
        case 'Digit3': useSkill(2); break;
        case 'Digit4': useSkill(3); break;
        case 'Digit5': useSkill(4); break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW': game.controls.forward = false; break;
        case 'KeyS': game.controls.backward = false; break;
        case 'KeyA': game.controls.left = false; break;
        case 'KeyD': game.controls.right = false; break;
        case 'Space': game.controls.jump = false; break;
        case 'ShiftLeft': game.controls.sprint = false; break;
    }
}

function onMouseClick(event) {
    if (event.target.id === 'gameCanvas') {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, game.camera);

        const enemies = game.world.enemies.filter(enemy => enemy.userData.health > 0);
        const intersects = raycaster.intersectObjects(enemies, true);

        if (intersects.length > 0) {
            const enemy = intersects[0].object.parent;
            if (enemy.userData.type === 'enemy') {
                attackEnemy(enemy);
            }
        }
    }
}

function onMouseMove(event) {
    // Could implement camera rotation here
}

function interactWithNearby() {
    const playerPos = game.player.position;

    for (const npc of game.world.npcs) {
        const distance = playerPos.distanceTo(npc.position);
        if (distance < 3) {
            interactWithNPC(npc);
            return;
        }
    }

    for (const object of game.world.objects) {
        if (object.userData.type === 'loot') {
            const distance = playerPos.distanceTo(object.position);
            if (distance < 2) {
                pickupLoot(object);
                return;
            }
        }
    }
}

function interactWithNPC(npc) {
    const dialogue = npc.userData.dialogue[npc.userData.dialogueIndex];
    addChatMessage(npc.userData.name, dialogue, '#ffff00');

    npc.userData.dialogueIndex = (npc.userData.dialogueIndex + 1) % npc.userData.dialogue.length;
}

function pickupLoot(lootObject) {
    const item = lootObject.userData.item;
    if (addItemToInventory(item)) {
        addChatMessage('System', `Picked up: ${item.name}`, '#00ff00');

        game.scene.remove(lootObject);
        const index = game.world.objects.indexOf(lootObject);
        if (index > -1) {
            game.world.objects.splice(index, 1);
        }
    } else {
        addChatMessage('System', 'Inventory full!', '#ff0000');
    }
}

function initializeInventory() {
    for (let i = 0; i < 20; i++) {
        game.playerData.inventory.push(null);
    }

    const inventoryGrid = document.getElementById('inventoryGrid');
    for (let i = 0; i < 20; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.dataset.slot = i;

        slot.addEventListener('click', () => useInventoryItem(i));

        inventoryGrid.appendChild(slot);
    }

    addItemToInventory({ type: 'potion', name: 'Health Potion', effect: 'heal', value: 50, icon: '', rarity: 'common' });
    addItemToInventory({ type: 'potion', name: 'Mana Potion', effect: 'mana', value: 30, icon: '', rarity: 'common' });
}

function addItemToInventory(item) {
    for (let i = 0; i < game.playerData.inventory.length; i++) {
        if (game.playerData.inventory[i] === null) {
            game.playerData.inventory[i] = item;
            updateInventoryDisplay();
            return true;
        }
    }
    return false;
}

function updateInventoryDisplay() {
    const slots = document.querySelectorAll('.inventory-slot');
    slots.forEach((slot, index) => {
        const item = game.playerData.inventory[index];
        if (item) {
            slot.textContent = item.icon || '';
            slot.classList.add('occupied');
            slot.title = `${item.name}\n${item.description || ''}`;
        } else {
            slot.textContent = '';
            slot.classList.remove('occupied');
            slot.title = '';
        }
    });
}

function useInventoryItem(slotIndex) {
    const item = game.playerData.inventory[slotIndex];
    if (!item) return;

    if (item.type === 'potion') {
        if (item.effect === 'heal') {
            const healAmount = Math.min(item.value, game.playerData.stats.maxHealth - game.playerData.stats.health);
            game.playerData.stats.health += healAmount;
            showFloatingText(game.player.position, `+${healAmount}`, '#00ff00');
        } else if (item.effect === 'mana') {
            const manaAmount = Math.min(item.value, game.playerData.stats.maxMana - game.playerData.stats.mana);
            game.playerData.stats.mana += manaAmount;
            showFloatingText(game.player.position, `+${manaAmount} MP`, '#0066ff');
        }

        game.playerData.inventory[slotIndex] = null;
        updateInventoryDisplay();

        addChatMessage('System', `Used ${item.name}`, '#ffff00');
    }
}

function toggleInventory() {
    const inventory = document.getElementById('inventory');
    game.ui.inventoryOpen = !game.ui.inventoryOpen;
    inventory.style.display = game.ui.inventoryOpen ? 'block' : 'none';

    if (game.ui.inventoryOpen) {
        updateInventoryDisplay();
    }
}

function toggleSettings() {
    const settings = document.getElementById('settingsMenu');
    game.ui.settingsOpen = !game.ui.settingsOpen;
    settings.style.display = game.ui.settingsOpen ? 'block' : 'none';
}

function logout() {
    location.reload();
}

function initializeChatSystem() {
    const chatPhrases = [
        "anyone want to party?", "selling rare sword", "where is the dragon boss?",
        "gg", "need help with quest", "LFG dungeon run", "WTS enchanted armor",
        "this zone is packed", "nice weather today", "level 5 LFG", "trading potions",
        "found secret area!", "lag is real", "awesome graphics", "love this game",
        "anyone seen the merchant?", "epic loot drop!", "pvp anyone?",
        "guild recruiting", "server restart soon?"
    ];

    setInterval(() => {
        game.world.otherPlayers.forEach(player => {
            if (Math.random() < 0.1) {
                const phrase = chatPhrases[Math.floor(Math.random() * chatPhrases.length)];
                addChatMessage(player.userData.name, phrase, '#ffffff');
            }
        });
    }, 5000);
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (message) {
        addChatMessage(game.playerData.username, message, '#00ffff');
        input.value = '';

        if (message.startsWith('/')) {
            processChatCommand(message);
        }
    }
}

function processChatCommand(command) {
    const args = command.split(' ');
    const cmd = args[0].toLowerCase();

    switch (cmd) {
        case '/help':
            addChatMessage('System', 'Available commands: /help, /party, /whisper [name]', '#ffff00');
            break;
        case '/party':
            addChatMessage('System', 'Looking for party...', '#ffff00');
            break;
        case '/whisper':
            if (args.length > 2) {
                const targetName = args[1];
                const message = args.slice(2).join(' ');
                addChatMessage('You whisper to ' + targetName, message, '#ff69b4');

                setTimeout(() => {
                    addChatMessage(targetName + ' whispers', 'Thanks for the message!', '#ff69b4');
                }, 1000);
            } else {
                addChatMessage('System', 'Usage: /whisper [name] [message]', '#ff0000');
            }
            break;
        default:
            addChatMessage('System', 'Unknown command. Type /help for available commands.', '#ff0000');
    }
}

export function addChatMessage(sender, message, color) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');

    const time = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });

    messageDiv.innerHTML = `<span style="color: #888">[${time}]</span> <span style="color: ${color}; font-weight: bold">${sender}:</span> <span style="color: #fff">${message}</span>`;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    while (chatMessages.children.length > 50) {
        chatMessages.removeChild(chatMessages.firstChild);
    }
}

export function showFloatingText(position, text, color) {
    const floatingText = document.createElement('div');
    floatingText.className = 'damage-number';
    floatingText.textContent = text;
    floatingText.style.color = color;
    floatingText.style.left = '50%';
    floatingText.style.top = '50%';

    document.getElementById('gameUI').appendChild(floatingText);

    let startTime = Date.now();
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / 1000;

        if (progress >= 1) {
            floatingText.remove();
            return;
        }

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

export function createSparkleEffect(position) {
    const particles = [];
    for (let i = 0; i < 10; i++) {
        const particle = {
            position: {
                x: position.x + (Math.random() - 0.5) * 2,
                y: position.y + Math.random() * 2,
                z: position.z + (Math.random() - 0.5) * 2
            },
            velocity: {
                x: (Math.random() - 0.5) * 0.1,
                y: Math.random() * 0.1 + 0.05,
                z: (Math.random() - 0.5) * 0.1
            },
            life: 1.0,
            maxLife: 1.0,
            color: '#ffd700'
        };
        particles.push(particle);
    }
    game.world.particles.push(...particles);
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

    document.getElementById('goldCounter').textContent = ` ${game.playerData.stats.gold} Gold`;

    updateSkillBar();
    updateTargetFrame();
    updateQuestLog();
    updateMinimap();
    updateFPS();
    checkNearbyInteractions();
    updateOtherPlayers();
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

function updateQuestLog() {
    const questList = document.getElementById('questList');
    questList.innerHTML = '';

    game.playerData.activeQuests.forEach(quest => {
        if (quest.status !== 'active') return;

        const questDiv = document.createElement('div');
        questDiv.className = 'quest-item';

        let objectivesHtml = '';
        quest.objectives.forEach(objective => {
            const progress = Math.min(objective.current, objective.required);
            const progressPercent = (progress / objective.required) * 100;

            objectivesHtml += `
                <div class="quest-objective">${objective.text}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div style="font-size: 10px; color: #aaa; margin-bottom: 5px;">${progress}/${objective.required}</div>
            `;
        });

        questDiv.innerHTML = `
            <div class="quest-title">${quest.title}</div>
            ${objectivesHtml}
        `;

        questList.appendChild(questDiv);
    });
}

function updateMinimap() {
    const canvas = document.getElementById('minimapCanvas');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, 146, 146);

    const scale = 0.3;
    const centerX = 73;
    const centerY = 73;

    ctx.fillStyle = '#00aaff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();

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

window.toggleInventory = toggleInventory;
window.toggleSettings = toggleSettings;
window.logout = logout;
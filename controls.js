import { game } from './game.js';
import { useSkill } from './skills.js';
import { toggleInventory, toggleSettings } from './ui.js';

export function initializeControls() {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    document.addEventListener('click', onMouseClick);
    document.addEventListener('mousemove', onMouseMove);
    
    const chatInput = document.getElementById('chatInput');
    chatInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            import('./chat.js').then(module => module.sendChatMessage());
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
            event.preventDefault();
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
            interactWithNearby();
            break;
        case 'Digit1':
            useSkill(0);
            break;
        case 'Digit2':
            useSkill(1);
            break;
        case 'Digit3':
            useSkill(2);
            break;
        case 'Digit4':
            useSkill(3);
            break;
        case 'Digit5':
            useSkill(4);
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
                import('./combat.js').then(module => module.attackEnemy(enemy));
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
            import('./npcs.js').then(module => module.interactWithNPC(npc));
            return;
        }
    }
    
    for (const object of game.world.objects) {
        if (object.userData.type === 'loot') {
            const distance = playerPos.distanceTo(object.position);
            if (distance < 2) {
                import('./loot.js').then(module => module.pickupLoot(object));
                return;
            }
        }
    }
}


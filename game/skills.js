import { game } from '../core/gameState.js';

export function initializeSkills() {
    game.playerData.skills = [
        { name: 'Fireball', manaCost: 20, cooldown: 5000, damage: 30, level: 3, lastUsed: 0 },
        { name: 'Heal', manaCost: 25, cooldown: 10000, healing: 40, level: 1, lastUsed: 0 },
        { name: 'Dash', staminaCost: 15, cooldown: 8000, level: 5, lastUsed: 0 },
        { name: 'Shield', manaCost: 30, cooldown: 15000, level: 7, lastUsed: 0 },
        { name: 'Area Attack', manaCost: 35, cooldown: 12000, damage: 25, level: 10, lastUsed: 0 }
    ];

    updateSkillBar();
}

export function useSkill(skillIndex) {
    const skill = game.playerData.skills[skillIndex];
    if (!skill || game.playerData.stats.level < skill.level) return;

    const now = Date.now();
    if (now - skill.lastUsed < skill.cooldown) return;

    if (skill.manaCost && game.playerData.stats.mana < skill.manaCost) return;
    if (skill.staminaCost && game.playerData.stats.stamina < skill.staminaCost) return;

    switch (skill.name) {
        case 'Fireball':
            castFireball();
            game.playerData.stats.mana -= skill.manaCost;
            break;
        case 'Heal':
            castHeal();
            game.playerData.stats.mana -= skill.manaCost;
            break;
        case 'Dash':
            castDash();
            game.playerData.stats.stamina -= skill.staminaCost;
            break;
        case 'Shield':
            castShield();
            game.playerData.stats.mana -= skill.manaCost;
            break;
        case 'Area Attack':
            castAreaAttack();
            game.playerData.stats.mana -= skill.manaCost;
            break;
    }

    skill.lastUsed = now;
    updateSkillCooldowns();
}

function castFireball() {
    // Create fireball projectile (simplified)
    console.log('Fireball cast!');
}

function castHeal() {
    game.playerData.stats.health = Math.min(
        game.playerData.stats.maxHealth,
        game.playerData.stats.health + 40
    );
    console.log('Heal cast!');
}

function castDash() {
    // Teleport player forward
    const direction = new THREE.Vector3(0, 0, -10);
    game.player.position.add(direction);
    console.log('Dash cast!');
}

function castShield() {
    // Apply defense buff (simplified)
    console.log('Shield cast!');
}

function castAreaAttack() {
    // Damage nearby enemies
    game.world.enemies.forEach(enemy => {
        const distance = enemy.position.distanceTo(game.player.position);
        if (distance <= 8) {
            enemy.userData.health -= 25;
            if (enemy.userData.health <= 0) {
                // Enemy dies
                game.scene.remove(enemy);
                const index = game.world.enemies.indexOf(enemy);
                game.world.enemies.splice(index, 1);

                // Give XP
                game.playerData.stats.xp += enemy.userData.xpReward;
                checkLevelUp();
            }
        }
    });
    console.log('Area Attack cast!');
}

function updateSkillBar() {
    const skillSlots = document.querySelectorAll('.skill-slot');
    skillSlots.forEach((slot, index) => {
        const skill = game.playerData.skills[index];
        if (skill) {
            slot.style.backgroundColor = game.playerData.stats.level >= skill.level ? 
                'rgba(255, 215, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
            slot.title = `${skill.name} (Level ${skill.level} required)`;
        }
    });
}

function updateSkillCooldowns() {
    const now = Date.now();
    game.playerData.skills.forEach((skill, index) => {
        const cooldownElement = document.querySelector(`.skill-slot[data-skill="${index}"] .skill-cooldown`);
        const remaining = Math.max(0, skill.cooldown - (now - skill.lastUsed));

        if (remaining > 0) {
            cooldownElement.style.display = 'flex';
            cooldownElement.textContent = Math.ceil(remaining / 1000);
        } else {
            cooldownElement.style.display = 'none';
        }
    });
}

function checkLevelUp() {
    if (game.playerData.stats.xp >= game.playerData.stats.xpRequired) {
        game.playerData.stats.level++;
        game.playerData.stats.xp -= game.playerData.stats.xpRequired;
        game.playerData.stats.xpRequired = Math.floor(game.playerData.stats.xpRequired * 1.5);

        // Increase stats
        game.playerData.stats.maxHealth = Math.floor(game.playerData.stats.maxHealth * 1.1);
        game.playerData.stats.maxMana = Math.floor(game.playerData.stats.maxMana * 1.1);
        game.playerData.stats.maxStamina = Math.floor(game.playerData.stats.maxStamina * 1.1);

        // Restore stats
        game.playerData.stats.health = game.playerData.stats.maxHealth;
        game.playerData.stats.mana = game.playerData.stats.maxMana;
        game.playerData.stats.stamina = game.playerData.stats.maxStamina;

        console.log(`Level up! Now level ${game.playerData.stats.level}`);
    }
}
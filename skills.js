import * as THREE from 'three';
import { game } from './game.js';
import { getTerrainHeight } from './world.js';
import { killEnemy } from './enemies.js';
import { showFloatingText, addChatMessage } from './ui.js';

export function initializeSkills() {
    game.playerData.skills = [
        {
            name: 'Fireball',
            description: 'Shoots a fireball at target location',
            manaCost: 20,
            cooldown: 5000,
            lastUsed: 0,
            damage: 30,
            requiredLevel: 3,
            icon: '🔥',
            type: 'projectile'
        },
        {
            name: 'Heal',
            description: 'Restores health',
            manaCost: 25,
            cooldown: 10000,
            lastUsed: 0,
            healing: 40,
            requiredLevel: 1,
            icon: '💚',
            type: 'self'
        },
        {
            name: 'Dash',
            description: 'Teleports forward',
            staminaCost: 15,
            cooldown: 8000,
            lastUsed: 0,
            distance: 10,
            requiredLevel: 5,
            icon: '💨',
            type: 'movement'
        },
        {
            name: 'Shield',
            description: 'Temporary defense boost',
            manaCost: 30,
            cooldown: 15000,
            lastUsed: 0,
            duration: 5000,
            defenseBoost: 20,
            requiredLevel: 7,
            icon: '🛡️',
            type: 'buff'
        },
        {
            name: 'Area Attack',
            description: 'Damages all nearby enemies',
            manaCost: 35,
            cooldown: 12000,
            lastUsed: 0,
            damage: 25,
            radius: 8,
            requiredLevel: 10,
            icon: '💥',
            type: 'area'
        }
    ];
}

export function useSkill(skillIndex) {
    const skill = game.playerData.skills[skillIndex];
    if (!skill) return;

    const currentTime = Date.now(); 

    if (game.playerData.stats.level < skill.requiredLevel) {
        addChatMessage('System', `Requires level ${skill.requiredLevel}!`, '#ff0000');
        return;
    }

    if (currentTime - skill.lastUsed < skill.cooldown) {
        const remaining = Math.ceil((skill.cooldown - (currentTime - skill.lastUsed)) / 1000);
        addChatMessage('System', `${skill.name} on cooldown: ${remaining}s`, '#ff0000');
        return;
    }

    if (skill.manaCost && game.playerData.stats.mana < skill.manaCost) {
        addChatMessage('System', 'Not enough mana!', '#ff0000');
        return;
    }

    if (skill.staminaCost && game.playerData.stats.stamina < skill.staminaCost) {
        addChatMessage('System', 'Not enough stamina!', '#ff0000');
        return;
    }

    skill.lastUsed = currentTime; 

    if (skill.manaCost) {
        game.playerData.stats.mana -= skill.manaCost;
    }
    if (skill.staminaCost) {
        game.playerData.stats.stamina -= skill.staminaCost;
    }

    executeSkillEffect(skill);
    startSkillCooldown(skillIndex, skill.cooldown); 

    addChatMessage('System', `Used ${skill.name}!`, '#00ffff');
}

function executeSkillEffect(skill) {
    switch (skill.type) {
        case 'self':
            if (skill.name === 'Heal') {
                const healAmount = Math.min(skill.healing, game.playerData.stats.maxHealth - game.playerData.stats.health);
                game.playerData.stats.health += healAmount;
                showFloatingText(game.player.position, `+${healAmount}`, '#00ff00');
                createHealingEffect(game.player.position);
            }
            break;

        case 'movement':
            if (skill.name === 'Dash') {
                const direction = new THREE.Vector3();
                if (game.controls.forward) direction.z -= 1;
                if (game.controls.backward) direction.z += 1;
                if (game.controls.left) direction.x -= 1;
                if (game.controls.right) direction.x += 1;
                
                if (direction.length() === 0) {
                    direction.z = -1;
                }
                
                direction.normalize(); 

                game.player.position.x += direction.x * skill.distance;
                game.player.position.z += direction.z * skill.distance;
                
                game.player.position.y = getTerrainHeight(game.player.position.x, game.player.position.z);
                
                createDashEffect(game.player.position);
            }
            break;

        case 'area':
            if (skill.name === 'Area Attack') {
                game.world.enemies.forEach(enemy => {
                    if (enemy.userData.health <= 0) return;
                    
                    const distance = game.player.position.distanceTo(enemy.position);
                    if (distance <= skill.radius) {
                        enemy.userData.health -= skill.damage;
                        showFloatingText(enemy.position, skill.damage.toString(), '#ff8800');
                        
                        if (enemy.userData.health <= 0) {
                            killEnemy(enemy);
                        }
                    }
                }); 

                createAreaAttackEffect(game.player.position, skill.radius);
            }
            break;
    }
}

function createHealingEffect(position) {
    const particles = [];
    for (let i = 0; i < 20; i++) {
        const particle = {
            position: {
                x: position.x + (Math.random() - 0.5) * 2,
                y: position.y + Math.random() * 3,
                z: position.z + (Math.random() - 0.5) * 2
            },
            velocity: { x: 0, y: 0.1, z: 0 },
            life: 1.5,
            maxLife: 1.5,
            color: '#00ff00'
        };
        particles.push(particle);
    }
    game.world.particles.push(...particles);
}

function createDashEffect(position) {
    const particles = [];
    for (let i = 0; i < 15; i++) {
        const particle = {
            position: {
                x: position.x + (Math.random() - 0.5) * 3,
                y: position.y + Math.random() * 2,
                z: position.z + (Math.random() - 0.5) * 3
            },
            velocity: {
                x: (Math.random() - 0.5) * 0.2,
                y: Math.random() * 0.1,
                z: (Math.random() - 0.5) * 0.2
            },
            life: 0.8,
            maxLife: 0.8,
            color: '#ffffff'
        };
        particles.push(particle);
    }
    game.world.particles.push(...particles);
}

function createAreaAttackEffect(position, radius) {
    const particles = [];
    for (let i = 0; i < 40; i++) {
        const angle = (i / 40) * Math.PI * 2;
        const distance = Math.random() * radius;
        const particle = {
            position: {
                x: position.x + Math.cos(angle) * distance,
                y: position.y + Math.random(),
                z: position.z + Math.sin(angle) * distance
            },
            velocity: {
                x: Math.cos(angle) * 0.1,
                y: 0.2,
                z: Math.sin(angle) * 0.1
            },
            life: 1.2,
            maxLife: 1.2,
            color: '#ff6600'
        };
        particles.push(particle);
    }
    game.world.particles.push(...particles);
}

function startSkillCooldown(skillIndex, duration) {
    const skillSlot = document.querySelector(`[data-skill="${skillIndex}"]`);
    if (!skillSlot) return; 

    const cooldownOverlay = skillSlot.querySelector('.skill-cooldown'); 

    cooldownOverlay.style.display = 'flex'; 

    const startTime = Date.now();
    const updateCooldown = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, duration - elapsed); 

        if (remaining <= 0) {
            cooldownOverlay.style.display = 'none';
            return;
        } 

        const seconds = Math.ceil(remaining / 1000);
        cooldownOverlay.textContent = seconds; 

        requestAnimationFrame(updateCooldown);
    }; 

    updateCooldown();
}

export function updateSkillBar() {
    const skillSlots = document.querySelectorAll('.skill-slot');
    skillSlots.forEach((slot, index) => {
        const skill = game.playerData.skills[index];
        if (skill && game.playerData.stats.level >= skill.requiredLevel) {
            slot.style.background = 'rgba(0, 100, 200, 0.7)';
            slot.textContent = skill.icon || (index + 1);
            slot.title = `${skill.name}\\n${skill.description}\\nMana: ${skill.manaCost || 0} | Cooldown: ${skill.cooldown / 1000}s`;
        } else {
            slot.style.background = 'rgba(0, 0, 0, 0.7)';
            slot.textContent = index + 1;
            slot.title = skill ? `Requires level ${skill.requiredLevel}` : 'No skill';
        }
    });
}
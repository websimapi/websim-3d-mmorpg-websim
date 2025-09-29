import { game } from './game.js';

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

export function createHealingEffect(position) {
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

export function createDashEffect(position) {
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

export function createAreaAttackEffect(position, radius) {
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

export function updateParticles() {
    const deltaTime = game.time.deltaTime;

    for (let i = game.world.particles.length - 1; i >= 0; i--) {
        const particle = game.world.particles[i];

        particle.position.x += particle.velocity.x * deltaTime;
        particle.position.y += particle.velocity.y * deltaTime;
        particle.position.z += particle.velocity.z * deltaTime;

        particle.life -= deltaTime;

        if (particle.life <= 0) {
            game.world.particles.splice(i, 1);
        }
    }
}
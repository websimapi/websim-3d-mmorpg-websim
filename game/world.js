import { game } from '../core/gameState.js';

export function generateWorld() {
    // Create terrain
    const terrainGeometry = new THREE.PlaneGeometry(500, 500, 100, 100);

    // Apply height displacement for rolling hills
    const vertices = terrainGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        vertices[i + 1] = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 10 + 
                         Math.sin(x * 0.02) * Math.cos(z * 0.02) * 5;
    }
    terrainGeometry.attributes.position.needsUpdate = true;
    terrainGeometry.computeVertexNormals();

    const terrainMaterial = new THREE.MeshLambertMaterial({ color: 0x3a5f0b });
    game.world.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    game.world.terrain.rotation.x = -Math.PI / 2;
    game.world.terrain.receiveShadow = true;
    game.scene.add(game.world.terrain);

    // Add trees
    for (let i = 0; i < 200; i++) {
        createTree();
    }

    // Add rocks
    for (let i = 0; i < 50; i++) {
        createRock();
    }

    // Create skybox
    const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        side: THREE.BackSide
    });
    const skybox = new THREE.Mesh(skyGeometry, skyMaterial);
    game.scene.add(skybox);
}

function createTree() {
    const group = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 4;
    trunk.castShadow = true;
    group.add(trunk);

    // Foliage
    const foliageGeometry = new THREE.SphereGeometry(4, 8, 8);
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 10;
    foliage.castShadow = true;
    group.add(foliage);

    // Random position
    group.position.x = (Math.random() - 0.5) * 400;
    group.position.z = (Math.random() - 0.5) * 400;

    game.scene.add(group);
    game.world.objects.push(group);
}

function createRock() {
    const geometry = new THREE.DodecahedronGeometry(Math.random() * 2 + 1);
    const material = new THREE.MeshLambertMaterial({ color: 0x696969 });
    const rock = new THREE.Mesh(geometry, material);

    rock.position.x = (Math.random() - 0.5) * 400;
    rock.position.z = (Math.random() - 0.5) * 400;
    rock.position.y = 1;
    rock.castShadow = true;
    rock.receiveShadow = true;

    game.scene.add(rock);
    game.world.objects.push(rock);
}
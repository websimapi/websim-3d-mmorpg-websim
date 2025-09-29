import { game } from './game.js';

export function generateWorld() {
    // Terrain
    const terrainGeometry = new THREE.PlaneGeometry(500, 500, 100, 100);

    // Apply height displacement (simple noise)
    const vertices = terrainGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        vertices[i + 1] = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 5 + 
                          Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
    }
    terrainGeometry.attributes.position.needsUpdate = true;
    terrainGeometry.computeVertexNormals();

    const terrainMaterial = new THREE.MeshLambertMaterial({ color: 0x3a5f0b });
    game.world.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    game.world.terrain.rotation.x = -Math.PI / 2;
    game.world.terrain.receiveShadow = true;
    game.scene.add(game.world.terrain);

    // Generate trees
    for (let i = 0; i < 200; i++) {
        createTree();
    }

    // Generate rocks
    for (let i = 0; i < 50; i++) {
        createRock();
    }

    // Create skybox
    const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    game.scene.add(sky);
}

export function getTerrainHeight(x, z) {
    return Math.sin(x * 0.02) * Math.cos(z * 0.02) * 5 + 
           Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
}

function createTree() {
    const treeGroup = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 6, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 3;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Foliage
    const foliageGeometry = new THREE.SphereGeometry(3, 8, 6);
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 7;
    foliage.castShadow = true;
    treeGroup.add(foliage);

    // Random position
    treeGroup.position.x = (Math.random() - 0.5) * 400;
    treeGroup.position.z = (Math.random() - 0.5) * 400;
    treeGroup.position.y = getTerrainHeight(treeGroup.position.x, treeGroup.position.z);

    game.scene.add(treeGroup);
    game.world.objects.push(treeGroup);
}

function createRock() {
    const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 2 + 1, 0);
    const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);

    rock.position.x = (Math.random() - 0.5) * 400;
    rock.position.z = (Math.random() - 0.5) * 400;
    rock.position.y = getTerrainHeight(rock.position.x, rock.position.z) + 1;

    rock.castShadow = true;
    rock.receiveShadow = true;

    game.scene.add(rock);
    game.world.objects.push(rock);
}
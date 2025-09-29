import { game } from './game.js';

export function updateCamera() {
    const targetPos = new THREE.Vector3()
        .copy(game.player.position)
        .add(new THREE.Vector3(
            game.cameraData.offset.x + game.cameraData.shake.x,
            game.cameraData.offset.y + game.cameraData.shake.y,
            game.cameraData.offset.z
        ));

    // Smooth camera following
    game.camera.position.lerp(targetPos, 0.1);
    game.camera.lookAt(game.player.position);

    // Update camera shake
    if (game.cameraData.shake.duration > 0) {
        game.cameraData.shake.duration -= game.time.deltaTime * 1000;
        game.cameraData.shake.x = (Math.random() - 0.5) * game.cameraData.shake.intensity;
        game.cameraData.shake.y = (Math.random() - 0.5) * game.cameraData.shake.intensity;
    } else {
        game.cameraData.shake.x = 0;
        game.cameraData.shake.y = 0;
        game.cameraData.shake.intensity = 0;
    }
}
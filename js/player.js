import * as THREE from "three";

export function createPlayer({
    scene,
    camera,
    world,
    gameState
}) {

    // =========================================================
    // PLAYER STATE
    // =========================================================

    const player = {

        health: 100,

        shield: 0,

        maxHealth: 100,

        maxShield: 100,

        speed: 18,

        sprintSpeed: 27,

        jumpForce: 11,

        gravity: 30,

        velocityY: 0,

        grounded: true,

        rotation: 0,

        dead: false,

        position: new THREE.Vector3(
            0,
            0,
            0
        )
    };


    // =========================================================
    // PLAYER VISUAL
    // =========================================================

    const group =
        new THREE.Group();

    group.position.copy(
        player.position
    );

    scene.add(
        group
    );


    // =========================================================
    // BODY
    // =========================================================

    const body =
        new THREE.Mesh(
            new THREE.CapsuleGeometry(
                1,
                2.8,
                8,
                16
            ),
            new THREE.MeshStandardMaterial({
                color: 0x2468c9,
                roughness: .75
            })
        );

    body.position.y =
        2.2;

    body.castShadow =
        true;

    body.receiveShadow =
        true;

    group.add(
        body
    );


    // =========================================================
    // HEAD
    // =========================================================

    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                1.05,
                20,
                20
            ),
            new THREE.MeshStandardMaterial({
                color: 0xf0b27a,
                roughness: .8
            })
        );

    head.position.y =
        4.6;

    head.castShadow =
        true;

    group.add(
        head
    );


    // =========================================================
    // VISOR
    // =========================================================

    const visor =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.4,
                .35,
                .18
            ),
            new THREE.MeshStandardMaterial({
                color: 0x101827,
                metalness: .3,
                roughness: .25
            })
        );

    visor.position.set(
        0,
        4.65,
        -.9
    );

    group.add(
        visor
    );


    // =========================================================
    // INPUT
    // =========================================================

    const keys = {

        forward: false,

        backward: false,

        left: false,

        right: false,

        sprint: false
    };


    let pitch = 0;

    let mouseLocked = false;

    const sensitivity = 0.0025;


    // =========================================================
    // KEYBOARD
    // =========================================================

    window.addEventListener(
        "keydown",
        event => {

            switch (event.code) {

                case "KeyW":
                    keys.forward = true;
                    break;

                case "KeyS":
                    keys.backward = true;
                    break;

                case "KeyA":
                    keys.left = true;
                    break;

                case "KeyD":
                    keys.right = true;
                    break;

                case "ShiftLeft":
                case "ShiftRight":
                    keys.sprint = true;
                    break;

                case "Space":
                    jump();
                    break;
            }
        }
    );


    window.addEventListener(
        "keyup",
        event => {

            switch (event.code) {

                case "KeyW":
                    keys.forward = false;
                    break;

                case "KeyS":
                    keys.backward = false;
                    break;

                case "KeyA":
                    keys.left = false;
                    break;

                case "KeyD":
                    keys.right = false;
                    break;

                case "ShiftLeft":
                case "ShiftRight":
                    keys.sprint = false;
                    break;
            }
        }
    );


    // =========================================================
    // POINTER LOCK
    // =========================================================

    document.addEventListener(
        "pointerlockchange",
        () => {

            mouseLocked =
                document.pointerLockElement ===
                rendererCanvas();
        }
    );


    window.addEventListener(
        "mousemove",
        event => {

            if (
                !mouseLocked
            ) {
                return;
            }


            player.rotation -=
                event.movementX *
                sensitivity;


            pitch -=
                event.movementY *
                sensitivity;


            pitch =
                THREE.MathUtils.clamp(
                    pitch,
                    -1.35,
                    1.35
                );
        }
    );


    function rendererCanvas() {

        return document.querySelector(
            "canvas"
        );
    }


    // =========================================================
    // GROUND HEIGHT
    // =========================================================

    function getGroundHeight() {

        if (
            world &&
            typeof world.getTerrainHeight ===
            "function"
        ) {

            return world.getTerrainHeight(
                player.position.x,
                player.position.z
            );
        }


        return 0;
    }


    // =========================================================
    // JUMP
    // =========================================================

    function jump() {

        if (
            !gameState.started ||
            player.dead
        ) {
            return;
        }


        if (
            !player.grounded
        ) {
            return;
        }


        player.velocityY =
            player.jumpForce;


        player.grounded =
            false;
    }


    // =========================================================
    // MOVEMENT
    // =========================================================

    function updateMovement(
        delta
    ) {

        const direction =
            new THREE.Vector3();


        if (
            keys.forward
        ) {
            direction.z -= 1;
        }


        if (
            keys.backward
        ) {
            direction.z += 1;
        }


        if (
            keys.left
        ) {
            direction.x -= 1;
        }


        if (
            keys.right
        ) {
            direction.x += 1;
        }


        if (
            direction.lengthSq() > 0
        ) {

            direction.normalize();
        }


        const speed =
            keys.sprint
                ? player.sprintSpeed
                : player.speed;


        // Convert local movement into
        // world-space movement.

        const sin =
            Math.sin(
                player.rotation
            );

        const cos =
            Math.cos(
                player.rotation
            );


        const moveX =
            direction.x * cos -
            direction.z * sin;


        const moveZ =
            direction.x * sin +
            direction.z * cos;


        player.position.x +=
            moveX *
            speed *
            delta;


        player.position.z +=
            moveZ *
            speed *
            delta;


        // =====================================================
        // WORLD BOUNDS
        // =====================================================

        if (
            world &&
            world.size
        ) {

            const limit =
                world.size / 2 - 10;


            player.position.x =
                THREE.MathUtils.clamp(
                    player.position.x,
                    -limit,
                    limit
                );


            player.position.z =
                THREE.MathUtils.clamp(
                    player.position.z,
                    -limit,
                    limit
                );
        }
    }


    // =========================================================
    // GRAVITY + TERRAIN
    // =========================================================

    function updateGravity(
        delta
    ) {

        const groundHeight =
            getGroundHeight();


        // Airborne.

        if (
            !player.grounded ||
            player.position.y >
            groundHeight
        ) {

            player.velocityY -=
                player.gravity *
                delta;


            player.position.y +=
                player.velocityY *
                delta;


            if (
                player.position.y <=
                groundHeight
            ) {

                player.position.y =
                    groundHeight;


                player.velocityY =
                    0;


                player.grounded =
                    true;
            }


            return;
        }


        // Standing on terrain.

        player.position.y =
            groundHeight;


        player.velocityY =
            0;


        player.grounded =
            true;
    }


    // =========================================================
    // CAMERA
    // =========================================================

    function updateCamera() {

        const eyeHeight =
            5.5;


        const target =
            new THREE.Vector3(
                player.position.x,
                player.position.y +
                eyeHeight,
                player.position.z
            );


        camera.position.lerp(
            target,
            .25
        );


        camera.rotation.order =
            "YXZ";


        camera.rotation.y =
            player.rotation;


        camera.rotation.x =
            pitch;
    }


    // =========================================================
    // VISUAL
    // =========================================================

    function updateVisual() {

        group.position.copy(
            player.position
        );


        group.rotation.y =
            player.rotation;
    }


    // =========================================================
    // DAMAGE
    // =========================================================

    function damage(
        amount
    ) {

        if (
            player.dead
        ) {
            return;
        }


        let remaining =
            Math.max(
                0,
                amount
            );


        // Shield absorbs damage first.

        if (
            player.shield > 0
        ) {

            const absorbed =
                Math.min(
                    player.shield,
                    remaining
                );


            player.shield -=
                absorbed;


            remaining -=
                absorbed;
        }


        // Remaining damage hits health.

        if (
            remaining > 0
        ) {

            player.health -=
                remaining;
        }


        player.health =
            Math.max(
                0,
                player.health
            );


        player.shield =
            Math.max(
                0,
                player.shield
            );


        if (
            player.health <= 0
        ) {

            die();
        }
    }


    // =========================================================
    // HEAL
    // =========================================================

    function heal(
        amount
    ) {

        if (
            player.dead
        ) {
            return;
        }


        player.health =
            Math.min(
                player.maxHealth,
                player.health +
                amount
            );
    }


    // =========================================================
    // SHIELD
    // =========================================================

    function addShield(
        amount
    ) {

        if (
            player.dead
        ) {
            return;
        }


        player.shield =
            Math.min(
                player.maxShield,
                player.shield +
                amount
            );
    }


    // =========================================================
    // DEATH
    // =========================================================

    function die() {

        if (
            player.dead
        ) {
            return;
        }


        player.dead =
            true;


        player.health =
            0;


        gameState.gameOver =
            true;
    }


    // =========================================================
    // START
    // =========================================================

    function start() {

        player.dead =
            false;


        player.health =
            player.maxHealth;


        player.shield =
            0;


        player.velocityY =
            0;


        player.grounded =
            true;


        player.position.set(
            0,
            0,
            0
        );


        // Immediately place player
        // on the island.

        player.position.y =
            getGroundHeight();


        player.rotation =
            0;


        pitch =
            0;


        group.visible =
            true;
    }


    // =========================================================
    // UPDATE
    // =========================================================

    function update(
        delta
    ) {

        if (
            !gameState.started ||
            player.dead
        ) {
            return;
        }


        updateMovement(
            delta
        );


        updateGravity(
            delta
        );


        updateVisual();


        updateCamera();
    }


    // =========================================================
    // PUBLIC API
    // =========================================================

    player.start =
        start;

    player.update =
        update;

    player.damage =
        damage;

    player.heal =
        heal;

    player.addShield =
        addShield;

    player.jump =
        jump;


    return player;
}
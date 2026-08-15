import * as THREE from "three";

export function createEnemies({
    scene,
    player,
    world,
    weapons,
    gameState
}) {

    // =========================================================
    // SETTINGS
    // =========================================================

    const MAX_ENEMIES = 20;

    const DETECTION_RANGE = 120;

    const SHOOT_RANGE = 75;

    const MOVE_SPEED = 7;

    const ATTACK_COOLDOWN = 1.1;


    // =========================================================
    // STATE
    // =========================================================

    const enemies = [];

    let started = false;


    // =========================================================
    // MATERIALS
    // =========================================================

    const bodyMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xc84b4b,

            roughness: .8
        });


    const skinMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xd99a70,

            roughness: .85
        });


    const visorMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x172333,

            metalness: .25,

            roughness: .25
        });


    // =========================================================
    // CREATE ENEMY
    // =========================================================

    function createEnemy(
        x,
        z
    ) {

        const group =
            new THREE.Group();


        const y =
            world.getTerrainHeight
                ? world.getTerrainHeight(
                    x,
                    z
                )
                : 0;


        group.position.set(
            x,
            y,
            z
        );


        // =====================================================
        // BODY
        // =====================================================

        const body =
            new THREE.Mesh(
                new THREE.CapsuleGeometry(
                    .85,
                    2.3,
                    8,
                    12
                ),
                bodyMaterial.clone()
            );


        body.position.y =
            2;


        body.castShadow =
            true;


        group.add(
            body
        );


        // =====================================================
        // HEAD
        // =====================================================

        const head =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    .8,
                    16,
                    16
                ),
                skinMaterial.clone()
            );


        head.position.y =
            4;


        head.castShadow =
            true;


        group.add(
            head
        );


        // =====================================================
        // VISOR
        // =====================================================

        const visor =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.05,
                    .25,
                    .15
                ),
                visorMaterial
            );


        visor.position.set(
            0,
            4.05,
            -.72
        );


        group.add(
            visor
        );


        // =====================================================
        // HEALTH
        // =====================================================

        const enemy = {

            object:
                group,

            health:
                100,

            maxHealth:
                100,

            shield:
                0,

            speed:
                MOVE_SPEED,

            attackCooldown:
                Math.random() *
                ATTACK_COOLDOWN,

            wanderTimer:
                Math.random() * 4,

            wanderDirection:
                new THREE.Vector3(
                    Math.random() - .5,
                    0,
                    Math.random() - .5
                ).normalize(),

            alive:
                true
        };


        // =====================================================
        // USER DATA
        // =====================================================

        group.userData.enemy =
            enemy;


        group.userData.health =
            enemy.health;


        group.userData.damage =
            amount => {

                damageEnemy(
                    enemy,
                    amount
                );
            };


        // Children can also be hit
        // by the raycaster.

        body.userData.enemy =
            true;

        body.userData.damage =
            amount => {

                damageEnemy(
                    enemy,
                    amount
                );
            };


        head.userData.enemy =
            true;

        head.userData.damage =
            amount => {

                damageEnemy(
                    enemy,
                    amount
                );
            };


        visor.userData.enemy =
            true;

        visor.userData.damage =
            amount => {

                damageEnemy(
                    enemy,
                    amount
                );
            };


        scene.add(
            group
        );


        enemies.push(
            enemy
        );


        return enemy;
    }


    // =========================================================
    // DAMAGE
    // =========================================================

    function damageEnemy(
        enemy,
        amount
    ) {

        if (
            !enemy.alive
        ) {
            return;
        }


        let remaining =
            Math.max(
                0,
                amount
            );


        if (
            enemy.shield > 0
        ) {

            const absorbed =
                Math.min(
                    enemy.shield,
                    remaining
                );


            enemy.shield -=
                absorbed;


            remaining -=
                absorbed;
        }


        enemy.health -=
            remaining;


        enemy.health =
            Math.max(
                0,
                enemy.health
            );


        enemy.object.userData.health =
            enemy.health;


        if (
            enemy.health <= 0
        ) {

            eliminateEnemy(
                enemy
            );
        }
    }


    // =========================================================
    // ELIMINATE
    // =========================================================

    function eliminateEnemy(
        enemy
    ) {

        if (
            !enemy.alive
        ) {
            return;
        }


        enemy.alive =
            false;


        if (
            enemy.object.parent
        ) {

            enemy.object.parent.remove(
                enemy.object
            );
        }
    }


    // =========================================================
    // FIND PLAYER DISTANCE
    // =========================================================

    function distanceToPlayer(
        enemy
    ) {

        return enemy.object
            .position
            .distanceTo(
                player.position
            );
    }


    // =========================================================
    // MOVE TOWARD PLAYER
    // =========================================================

    function chasePlayer(
        enemy,
        delta
    ) {

        const direction =
            new THREE.Vector3()
                .subVectors(
                    player.position,
                    enemy.object.position
                );


        direction.y =
            0;


        if (
            direction.lengthSq() <
            .001
        ) {
            return;
        }


        direction.normalize();


        enemy.object.position.x +=
            direction.x *
            enemy.speed *
            delta;


        enemy.object.position.z +=
            direction.z *
            enemy.speed *
            delta;


        enemy.object.rotation.y =
            Math.atan2(
                direction.x,
                direction.z
            );
    }


    // =========================================================
    // WANDER
    // =========================================================

    function wander(
        enemy,
        delta
    ) {

        enemy.wanderTimer -=
            delta;


        if (
            enemy.wanderTimer <=
            0
        ) {

            enemy.wanderTimer =
                2 +
                Math.random() *
                4;


            enemy.wanderDirection
                .set(
                    Math.random() - .5,
                    0,
                    Math.random() - .5
                )
                .normalize();
        }


        enemy.object.position.x +=
            enemy.wanderDirection.x *
            enemy.speed *
            .35 *
            delta;


        enemy.object.position.z +=
            enemy.wanderDirection.z *
            enemy.speed *
            .35 *
            delta;


        enemy.object.rotation.y =
            Math.atan2(
                enemy.wanderDirection.x,
                enemy.wanderDirection.z
            );
    }


    // =========================================================
    // TERRAIN FOLLOWING
    // =========================================================

    function updateTerrain(
        enemy
    ) {

        if (
            !world.getTerrainHeight
        ) {
            return;
        }


        const height =
            world.getTerrainHeight(
                enemy.object.position.x,
                enemy.object.position.z
            );


        enemy.object.position.y =
            height;
    }


    // =========================================================
    // ATTACK PLAYER
    // =========================================================

    function attackPlayer(
        enemy,
        delta
    ) {

        enemy.attackCooldown -=
            delta;


        if (
            enemy.attackCooldown >
            0
        ) {
            return;
        }


        enemy.attackCooldown =
            ATTACK_COOLDOWN;


        // Simple bot weapon damage.

        if (
            typeof player.damage ===
            "function"
        ) {

            player.damage(
                8
            );
        }
    }


    // =========================================================
    // UPDATE ENEMY
    // =========================================================

    function updateEnemy(
        enemy,
        delta
    ) {

        if (
            !enemy.alive
        ) {
            return;
        }


        const distance =
            distanceToPlayer(
                enemy
            );


        if (
            distance <=
            SHOOT_RANGE
        ) {

            // Face the player.

            const direction =
                new THREE.Vector3()
                    .subVectors(
                        player.position,
                        enemy.object.position
                    );


            direction.y =
                0;


            if (
                direction.lengthSq() >
                .001
            ) {

                direction.normalize();


                enemy.object.rotation.y =
                    Math.atan2(
                        direction.x,
                        direction.z
                    );
            }


            // Move closer if too far.

            if (
                distance >
                35
            ) {

                chasePlayer(
                    enemy,
                    delta
                );
            }


            attackPlayer(
                enemy,
                delta
            );

        } else if (
            distance <=
            DETECTION_RANGE
        ) {

            chasePlayer(
                enemy,
                delta
            );

        } else {

            wander(
                enemy,
                delta
            );
        }


        // Keep bots inside island.

        const limit =
            world.size / 2 -
            20;


        enemy.object.position.x =
            THREE.MathUtils.clamp(
                enemy.object.position.x,
                -limit,
                limit
            );


        enemy.object.position.z =
            THREE.MathUtils.clamp(
                enemy.object.position.z,
                -limit,
                limit
            );


        updateTerrain(
            enemy
        );
    }


    // =========================================================
    // SPAWN
    // =========================================================

    function spawnEnemies() {

        // Clear old enemies.

        for (
            const enemy
            of enemies
        ) {

            if (
                enemy.object.parent
            ) {

                enemy.object.parent.remove(
                    enemy.object
                );
            }
        }


        enemies.length =
            0;


        for (
            let i = 0;
            i < MAX_ENEMIES;
            i++
        ) {

            let x;
            let z;


            // Try several locations until
            // we find one reasonably far
            // from the player.

            for (
                let attempt = 0;
                attempt < 30;
                attempt++
            ) {

                x =
                    (
                        Math.random() -
                        .5
                    ) *
                    (
                        world.size -
                        200
                    );


                z =
                    (
                        Math.random() -
                        .5
                    ) *
                    (
                        world.size -
                        200
                    );


                const distance =
                    Math.sqrt(
                        x * x +
                        z * z
                    );


                if (
                    distance > 250
                ) {

                    break;
                }
            }


            createEnemy(
                x,
                z
            );
        }
    }


    // =========================================================
    // START
    // =========================================================

    function start() {

        started =
            true;


        spawnEnemies();
    }


    // =========================================================
    // UPDATE
    // =========================================================

    function update(
        delta
    ) {

        if (
            !started ||
            !gameState.started
        ) {
            return;
        }


        for (
            const enemy
            of enemies
        ) {

            updateEnemy(
                enemy,
                delta
            );
        }
    }


    // =========================================================
    // REMAINING ENEMIES
    // =========================================================

    function getRemaining() {

        let count =
            0;


        for (
            const enemy
            of enemies
        ) {

            if (
                enemy.alive
            ) {

                count++;
            }
        }


        return count;
    }


    // =========================================================
    // PUBLIC API
    // =========================================================

    return {

        enemies,

        start,

        update,

        getRemaining,

        damageEnemy,

        eliminateEnemy
    };
}
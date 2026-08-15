import * as THREE from "three";

export function createStorm({
    scene,
    player,
    world,
    gameState
}) {

    // =========================================================
    // SETTINGS
    // =========================================================

    const START_RADIUS = 1050;

    const FINAL_RADIUS = 40;

    const PHASE_DURATION = 35;

    const DAMAGE_PER_SECOND = 5;


    // =========================================================
    // STATE
    // =========================================================

    const state = {

        radius: START_RADIUS,

        startRadius: START_RADIUS,

        targetRadius: START_RADIUS,

        phase: 0,

        phaseTimer: PHASE_DURATION,

        shrinking: false,

        active: false
    };


    // =========================================================
    // STORM MATERIAL
    // =========================================================

    const stormMaterial =
        new THREE.MeshBasicMaterial({

            color: 0x8a45ff,

            transparent: true,

            opacity: .16,

            side: THREE.DoubleSide,

            depthWrite: false
        });


    // =========================================================
    // STORM RING
    // =========================================================

    const ringGeometry =
        new THREE.RingGeometry(
            START_RADIUS - 5,
            START_RADIUS,
            128
        );


    const ring =
        new THREE.Mesh(
            ringGeometry,
            stormMaterial
        );


    ring.rotation.x =
        -Math.PI / 2;


    ring.position.y =
        8;


    scene.add(
        ring
    );


    // =========================================================
    // INNER STORM WALL
    // =========================================================

    const wallMaterial =
        new THREE.MeshBasicMaterial({

            color: 0x7b35ff,

            transparent: true,

            opacity: .10,

            side: THREE.DoubleSide,

            depthWrite: false
        });


    const wallGeometry =
        new THREE.CylinderGeometry(
            START_RADIUS,
            START_RADIUS,
            180,
            128,
            1,
            true
        );


    const wall =
        new THREE.Mesh(
            wallGeometry,
            wallMaterial
        );


    wall.position.y =
        85;


    scene.add(
        wall
    );


    // =========================================================
    // STORM CENTER
    // =========================================================

    const center =
        new THREE.Vector3(
            0,
            0,
            0
        );


    // =========================================================
    // RANDOM NEXT CENTER
    // =========================================================

    function chooseNextZone() {

        const maximumShift =
            Math.max(
                0,
                state.radius -
                state.targetRadius
            ) * .45;


        const angle =
            Math.random() *
            Math.PI *
            2;


        const distance =
            Math.random() *
            maximumShift;


        const newX =
            center.x +
            Math.cos(angle) *
            distance;


        const newZ =
            center.z +
            Math.sin(angle) *
            distance;


        // Keep the new circle inside
        // the previous circle.

        const maxCenterDistance =
            Math.max(
                0,
                state.radius -
                state.targetRadius
            );


        const offset =
            new THREE.Vector2(
                newX -
                center.x,

                newZ -
                center.z
            );


        if (
            offset.length() >
            maxCenterDistance
        ) {

            offset.setLength(
                maxCenterDistance
            );
        }


        state.targetCenter =
            new THREE.Vector3(
                center.x +
                offset.x,

                0,

                center.z +
                offset.y
            );
    }


    // =========================================================
    // START PHASE
    // =========================================================

    function startNextPhase() {

        if (
            state.radius <=
            FINAL_RADIUS
        ) {

            state.shrinking =
                false;

            return;
        }


        state.phase++;


        state.startRadius =
            state.radius;


        state.targetRadius =
            Math.max(
                FINAL_RADIUS,
                state.radius *
                .72
            );


        chooseNextZone();


        state.shrinking =
            true;


        state.phaseTimer =
            PHASE_DURATION;
    }


    // =========================================================
    // DISTANCE FROM SAFE ZONE
    // =========================================================

    function getDistanceFromCenter() {

        const dx =
            player.position.x -
            center.x;


        const dz =
            player.position.z -
            center.z;


        return Math.sqrt(
            dx * dx +
            dz * dz
        );
    }


    // =========================================================
    // STORM DAMAGE
    // =========================================================

    let damageAccumulator =
        0;


    function updateDamage(
        delta
    ) {

        if (
            !player ||
            player.dead
        ) {
            return;
        }


        const distance =
            getDistanceFromCenter();


        if (
            distance >
            state.radius
        ) {

            damageAccumulator +=
                delta;


            if (
                damageAccumulator >=
                1
            ) {

                const ticks =
                    Math.floor(
                        damageAccumulator
                    );


                damageAccumulator -=
                    ticks;


                if (
                    typeof player.damage ===
                    "function"
                ) {

                    player.damage(
                        DAMAGE_PER_SECOND *
                        ticks
                    );
                }
            }

        } else {

            damageAccumulator =
                0;
        }
    }


    // =========================================================
    // UPDATE STORM VISUALS
    // =========================================================

    function updateVisuals() {

        ring.position.x =
            center.x;


        ring.position.z =
            center.z;


        wall.position.x =
            center.x;


        wall.position.z =
            center.z;


        // Rebuild the ring whenever
        // the radius changes.

        ring.geometry.dispose();


        ring.geometry =
            new THREE.RingGeometry(
                Math.max(
                    0,
                    state.radius - 5
                ),
                state.radius,
                128
            );


        wall.scale.x =
            state.radius /
            START_RADIUS;


        wall.scale.z =
            state.radius /
            START_RADIUS;
    }


    // =========================================================
    // UPDATE PHASE
    // =========================================================

    function updatePhase(
        delta
    ) {

        state.phaseTimer -=
            delta;


        if (
            state.shrinking
        ) {

            const progress =
                1 -
                (
                    state.phaseTimer /
                    PHASE_DURATION
                );


            const clamped =
                THREE.MathUtils.clamp(
                    progress,
                    0,
                    1
                );


            state.radius =
                THREE.MathUtils.lerp(
                    state.startRadius,
                    state.targetRadius,
                    clamped
                );


            if (
                state.targetCenter
            ) {

                center.lerp(
                    state.targetCenter,
                    clamped * .025
                );
            }


            if (
                state.phaseTimer <=
                0
            ) {

                state.radius =
                    state.targetRadius;


                if (
                    state.targetCenter
                ) {

                    center.copy(
                        state.targetCenter
                    );
                }


                state.shrinking =
                    false;


                state.phaseTimer =
                    PHASE_DURATION;
            }

        } else {

            if (
                state.phaseTimer <=
                0
            ) {

                startNextPhase();
            }
        }
    }


    // =========================================================
    // START
    // =========================================================

    function start() {

        state.radius =
            START_RADIUS;


        state.startRadius =
            START_RADIUS;


        state.targetRadius =
            START_RADIUS;


        state.phase =
            0;


        state.phaseTimer =
            PHASE_DURATION;


        state.shrinking =
            false;


        state.active =
            true;


        center.set(
            0,
            0,
            0
        );


        updateVisuals();
    }


    // =========================================================
    // UPDATE
    // =========================================================

    function update(
        delta
    ) {

        if (
            !state.active ||
            !gameState.started
        ) {
            return;
        }


        updatePhase(
            delta
        );


        updateDamage(
            delta
        );


        updateVisuals();
    }


    // =========================================================
    // TIME REMAINING
    // =========================================================

    function getTimeRemaining() {

        return Math.max(
            0,
            state.phaseTimer
        );
    }


    // =========================================================
    // GET STORM INFO
    // =========================================================

    function getRadius() {

        return state.radius;
    }


    function getPhase() {

        return state.phase;
    }


    function isOutside() {

        return (
            getDistanceFromCenter() >
            state.radius
        );
    }


    // =========================================================
    // PUBLIC API
    // =========================================================

    return {

        start,

        update,

        getTimeRemaining,

        getRadius,

        getPhase,

        isOutside,

        state
    };
}
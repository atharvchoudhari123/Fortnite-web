import * as THREE from "three";

export function createWeapons({
    scene,
    camera,
    player,
    world,
    gameState
}) {

    // =========================================================
    // WEAPONS
    // =========================================================

    const weaponDefinitions = {

        "ASSAULT RIFLE": {
            damage: 24,
            fireRate: 9,
            magazineSize: 30,
            reserveAmmo: 120,
            reloadTime: 1.8,
            spread: 0.018
        },

        "SHOTGUN": {
            damage: 12,
            pellets: 8,
            fireRate: 1.1,
            magazineSize: 6,
            reserveAmmo: 36,
            reloadTime: 2.2,
            spread: 0.11
        },

        "PICKAXE": {
            damage: 35,
            fireRate: 1.5,
            magazineSize: Infinity,
            reserveAmmo: Infinity,
            reloadTime: 0,
            spread: 0
        }
    };


    // =========================================================
    // STATE
    // =========================================================

    const state = {

        currentWeapon: "ASSAULT RIFLE",

        ammo: 30,

        reserveAmmo: 120,

        reloading: false,

        reloadTimer: 0,

        fireTimer: 0,

        equipped: false
    };


    // =========================================================
    // GET DEFINITION
    // =========================================================

    function getDefinition() {

        return weaponDefinitions[
            state.currentWeapon
        ];
    }


    // =========================================================
    // WEAPON VISUAL
    // =========================================================

    let weaponMesh = null;


    function createWeaponMesh() {

        if (
            weaponMesh
        ) {

            camera.remove(
                weaponMesh
            );
        }


        const group =
            new THREE.Group();


        const bodyMaterial =
            new THREE.MeshStandardMaterial({
                color:
                    state.currentWeapon ===
                    "SHOTGUN"
                        ? 0x5a3828
                        : 0x252525,

                roughness: .7
            });


        const body =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    .32,
                    .28,
                    1.8
                ),
                bodyMaterial
            );


        body.position.z =
            -.9;


        group.add(
            body
        );


        if (
            state.currentWeapon !==
            "PICKAXE"
        ) {

            const barrel =
                new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        .07,
                        .07,
                        .8,
                        10
                    ),
                    bodyMaterial
                );


            barrel.rotation.x =
                Math.PI / 2;


            barrel.position.z =
                -2.15;


            group.add(
                barrel
            );
        }


        if (
            state.currentWeapon ===
            "PICKAXE"
        ) {

            const handle =
                new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        .07,
                        .07,
                        2.5,
                        10
                    ),
                    new THREE.MeshStandardMaterial({
                        color: 0x6f4328
                    })
                );


            handle.rotation.z =
                Math.PI / 2;


            handle.position.z =
                -1;


            group.add(
                handle
            );


            const head =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        1.2,
                        .22,
                        .22
                    ),
                    new THREE.MeshStandardMaterial({
                        color: 0x9fa8b3,
                        metalness: .7,
                        roughness: .25
                    })
                );


            head.position.z =
                -2.2;


            group.add(
                head
            );
        }


        group.position.set(
            .65,
            -.55,
            -1.25
        );


        group.rotation.y =
            Math.PI;


        weaponMesh =
            group;


        camera.add(
            weaponMesh
        );
    }


    // =========================================================
    // EQUIP
    // =========================================================

    function equip(
        weaponName
    ) {

        if (
            !weaponDefinitions[
                weaponName
            ]
        ) {

            return;
        }


        state.currentWeapon =
            weaponName;


        const definition =
            getDefinition();


        // Keep ammo when switching back
        // to the same weapon. Otherwise
        // initialize from the definition.

        state.ammo =
            Math.min(
                state.ammo,
                definition.magazineSize
            );


        if (
            !Number.isFinite(
                state.ammo
            )
        ) {

            state.ammo =
                definition.magazineSize;
        }


        state.reserveAmmo =
            definition.reserveAmmo;


        state.reloading =
            false;


        state.reloadTimer =
            0;


        createWeaponMesh();
    }


    // =========================================================
    // PICKAXE
    // =========================================================

    function equipPickaxe() {

        equip(
            "PICKAXE"
        );
    }


    // =========================================================
    // SHOOT
    // =========================================================

    function shoot() {

        if (
            !gameState.started
        ) {
            return;
        }


        if (
            state.reloading
        ) {
            return;
        }


        const definition =
            getDefinition();


        if (
            state.currentWeapon !==
            "PICKAXE" &&
            state.ammo <= 0
        ) {

            reload();

            return;
        }


        if (
            state.fireTimer > 0
        ) {
            return;
        }


        state.fireTimer =
            1 /
            definition.fireRate;


        // Pickaxe attack.

        if (
            state.currentWeapon ===
            "PICKAXE"
        ) {

            performPickaxeAttack();

            return;
        }


        // Consume ammo.

        state.ammo--;


        const pellets =
            definition.pellets ||
            1;


        for (
            let i = 0;
            i < pellets;
            i++
        ) {

            fireRay(
                definition
            );
        }


        if (
            state.ammo <= 0 &&
            state.reserveAmmo > 0
        ) {

            reload();
        }
    }


    // =========================================================
    // RAYCAST
    // =========================================================

    const raycaster =
        new THREE.Raycaster();


    const center =
        new THREE.Vector2(
            0,
            0
        );


    function fireRay(
        definition
    ) {

        const spread =
            definition.spread ||
            0;


        const point =
            new THREE.Vector2(

                (
                    Math.random() -
                    .5
                ) *
                spread,

                (
                    Math.random() -
                    .5
                ) *
                spread
            );


        raycaster.setFromCamera(
            point,
            camera
        );


        const objects =
            scene.children;


        const hits =
            raycaster.intersectObjects(
                objects,
                true
            );


        for (
            const hit
            of hits
        ) {

            const object =
                hit.object;


            // Ignore the player's own
            // weapon and body.

            if (
                object ===
                weaponMesh ||
                object.parent ===
                weaponMesh
            ) {

                continue;
            }


            // Enemy hit.

            let current =
                object;


            while (
                current
            ) {

                if (
                    current.userData &&
                    current.userData.enemy
                ) {

                    if (
                        typeof current.userData.damage ===
                        "function"
                    ) {

                        current.userData.damage(
                            definition.damage
                        );
                    }


                    return;
                }


                current =
                    current.parent;
            }


            // Build piece hit.

            current =
                object;


            while (
                current
            ) {

                if (
                    current.userData &&
                    current.userData.isBuildPiece
                ) {

                    damageBuildPiece(
                        current,
                        definition.damage
                    );


                    return;
                }


                current =
                    current.parent;
            }


            // World object hit.

            if (
                object.userData &&
                typeof object.userData.damage ===
                "function"
            ) {

                object.userData.damage(
                    definition.damage
                );
            }


            return;
        }
    }


    // =========================================================
    // PICKAXE
    // =========================================================

    function performPickaxeAttack() {

        const range =
            7;


        const direction =
            camera.getWorldDirection(
                new THREE.Vector3()
            );


        const origin =
            camera.position.clone();


        const ray =
            new THREE.Raycaster(
                origin,
                direction.normalize(),
                0,
                range
            );


        const hits =
            ray.intersectObjects(
                scene.children,
                true
            );


        for (
            const hit
            of hits
        ) {

            let object =
                hit.object;


            while (
                object
            ) {

                if (
                    object.userData &&
                    (
                        object.userData.type ===
                        "tree" ||

                        object.userData.type ===
                        "rock" ||

                        object.userData.isBuildPiece
                    )
                ) {

                    damageWorldObject(
                        object,
                        35
                    );


                    return;
                }


                object =
                    object.parent;
            }
        }
    }


    // =========================================================
    // DAMAGE WORLD OBJECT
    // =========================================================

    function damageWorldObject(
        object,
        amount
    ) {

        if (
            !object.userData
        ) {
            return;
        }


        if (
            typeof object.userData.health !==
            "number"
        ) {
            return;
        }


        object.userData.health -=
            amount;


        if (
            object.userData.health <=
            0
        ) {

            const resource =
                object.userData.resource ||
                10;


            // Give the player building
            // materials.

            if (
                world &&
                typeof world.addMaterials ===
                "function"
            ) {

                world.addMaterials(
                    resource
                );
            }


            if (
                object.parent
            ) {

                object.parent.remove(
                    object
                );
            }
        }
    }


    // =========================================================
    // BUILD PIECE DAMAGE
    // =========================================================

    function damageBuildPiece(
        object,
        amount
    ) {

        if (
            typeof object.userData.health !==
            "number"
        ) {
            return;
        }


        object.userData.health -=
            amount;


        if (
            object.userData.health <=
            0
        ) {

            if (
                object.parent
            ) {

                object.parent.remove(
                    object
                );
            }
        }
    }


    // =========================================================
    // RELOAD
    // =========================================================

    function reload() {

        if (
            state.currentWeapon ===
            "PICKAXE"
        ) {
            return;
        }


        if (
            state.reloading
        ) {
            return;
        }


        const definition =
            getDefinition();


        if (
            state.ammo >=
            definition.magazineSize
        ) {
            return;
        }


        if (
            state.reserveAmmo <=
            0
        ) {
            return;
        }


        state.reloading =
            true;


        state.reloadTimer =
            definition.reloadTime;
    }


    // =========================================================
    // FINISH RELOAD
    // =========================================================

    function finishReload() {

        const definition =
            getDefinition();


        const needed =
            definition.magazineSize -
            state.ammo;


        const amount =
            Math.min(
                needed,
                state.reserveAmmo
            );


        state.ammo +=
            amount;


        state.reserveAmmo -=
            amount;


        state.reloading =
            false;


        state.reloadTimer =
            0;
    }


    // =========================================================
    // INPUT
    // =========================================================

    let mouseDown =
        false;


    window.addEventListener(
        "mousedown",
        event => {

            if (
                event.button === 0
            ) {

                mouseDown =
                    true;

                shoot();
            }
        }
    );


    window.addEventListener(
        "mouseup",
        event => {

            if (
                event.button === 0
            ) {

                mouseDown =
                    false;
            }
        }
    );


    window.addEventListener(
        "keydown",
        event => {

            if (
                event.code ===
                "KeyR"
            ) {

                // Don't reload while
                // building.

                reload();
            }
        }
    );


    // =========================================================
    // UPDATE
    // =========================================================

    function update(
        delta
    ) {

        if (
            state.fireTimer > 0
        ) {

            state.fireTimer -=
                delta;
        }


        if (
            state.reloading
        ) {

            state.reloadTimer -=
                delta;


            if (
                state.reloadTimer <=
                0
            ) {

                finishReload();
            }
        }


        // Automatic weapons continue
        // firing while mouse is held.

        if (
            mouseDown &&
            gameState.started &&
            !state.reloading
        ) {

            if (
                state.currentWeapon !==
                "PICKAXE"
            ) {

                shoot();
            }
        }
    }


    // =========================================================
    // START
    // =========================================================

    function start() {

        state.currentWeapon =
            "ASSAULT RIFLE";


        state.ammo =
            weaponDefinitions[
                "ASSAULT RIFLE"
            ].magazineSize;


        state.reserveAmmo =
            weaponDefinitions[
                "ASSAULT RIFLE"
            ].reserveAmmo;


        state.reloading =
            false;


        state.reloadTimer =
            0;


        state.fireTimer =
            0;


        createWeaponMesh();
    }


    // =========================================================
    // PUBLIC API
    // =========================================================

    return {

        state,

        start,

        update,

        shoot,

        reload,

        equip,

        equipPickaxe,

        get weaponName() {

            return state.currentWeapon;
        },

        get ammo() {

            return state.ammo;
        },

        get reserveAmmo() {

            return state.reserveAmmo;
        }
    };
}
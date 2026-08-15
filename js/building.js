import * as THREE from "three";

export function createBuildingSystem({
    scene,
    camera,
    player,
    world,
    gameState
}) {

    // =========================================================
    // BUILD SETTINGS
    // =========================================================

    const GRID = 4;

    const BUILD_DISTANCE = 25;

    const MAX_MATERIALS = 999;


    // =========================================================
    // STATE
    // =========================================================

    const state = {

        mode: "wall",

        rotation: 0,

        materials: 500,

        placing: false,

        preview: null,

        lastPlacement: 0,

        placementDelay: 120
    };


    // =========================================================
    // BUILD DEFINITIONS
    // =========================================================

    const definitions = {

        wall: {

            name: "WALL",

            cost: 10,

            width: 4,

            height: 4,

            depth: .25
        },


        floor: {

            name: "FLOOR",

            cost: 10,

            width: 4,

            height: .25,

            depth: 4
        },


        ramp: {

            name: "RAMP",

            cost: 10,

            width: 4,

            height: 2.5,

            depth: 4
        },


        roof: {

            name: "ROOF",

            cost: 10,

            width: 4,

            height: .25,

            depth: 4
        }
    };


    // =========================================================
    // MATERIALS
    // =========================================================

    const buildMaterial =
        new THREE.MeshStandardMaterial({

            color: 0x9b6339,

            roughness: .8,

            transparent: true,

            opacity: .65
        });


    const placedMaterial =
        new THREE.MeshStandardMaterial({

            color: 0x9b6339,

            roughness: .8
        });


    // =========================================================
    // PREVIEW
    // =========================================================

    function createPreview() {

        if (
            state.preview
        ) {

            scene.remove(
                state.preview
            );
        }


        const definition =
            definitions[
                state.mode
            ];


        const geometry =
            createGeometry(
                state.mode,
                definition
            );


        const preview =
            new THREE.Mesh(
                geometry,
                buildMaterial
            );


        preview.userData.preview =
            true;


        scene.add(
            preview
        );


        state.preview =
            preview;
    }


    // =========================================================
    // GEOMETRY
    // =========================================================

    function createGeometry(
        type,
        definition
    ) {

        if (
            type === "wall"
        ) {

            return new THREE.BoxGeometry(
                definition.width,
                definition.height,
                definition.depth
            );
        }


        if (
            type === "floor"
        ) {

            return new THREE.BoxGeometry(
                definition.width,
                definition.height,
                definition.depth
            );
        }


        if (
            type === "roof"
        ) {

            return new THREE.BoxGeometry(
                definition.width,
                definition.height,
                definition.depth
            );
        }


        if (
            type === "ramp"
        ) {

            const geometry =
                new THREE.BufferGeometry();


            const vertices =
                new Float32Array([

                    // Bottom

                    -2, 0, -2,
                     2, 0, -2,
                     2, 0,  2,
                    -2, 0,  2,

                    // Top

                    -2, 4,  2,
                     2, 4,  2
                ]);


            const indices = [

                0, 1, 2,

                0, 2, 3,

                0, 4, 5,

                0, 5, 1,

                1, 5, 2,

                2, 5, 4,

                2, 4, 3,

                3, 4, 0
            ];


            geometry.setAttribute(
                "position",
                new THREE.BufferAttribute(
                    vertices,
                    3
                )
            );


            geometry.setIndex(
                indices
            );


            geometry.computeVertexNormals();


            return geometry;
        }


        return new THREE.BoxGeometry(
            4,
            4,
            4
        );
    }


    // =========================================================
    // SELECT BUILD MODE
    // =========================================================

    function setMode(
        mode
    ) {

        if (
            !definitions[mode]
        ) {
            return;
        }


        state.mode =
            mode;


        createPreview();
    }


    // =========================================================
    // ROTATE
    // =========================================================

    function rotate() {

        state.rotation +=
            Math.PI / 2;


        if (
            state.rotation >=
            Math.PI * 2
        ) {

            state.rotation =
                0;
        }
    }


    // =========================================================
    // GRID SNAP
    // =========================================================

    function snap(
        value
    ) {

        return Math.round(
            value / GRID
        ) * GRID;
    }


    // =========================================================
    // BUILD POSITION
    // =========================================================

    function getBuildPosition() {

        const direction =
            camera.getWorldDirection(
                new THREE.Vector3()
            );


        const position =
            player.position.clone();


        position.y +=
            2;


        position.add(
            direction.multiplyScalar(
                BUILD_DISTANCE
            )
        );


        position.x =
            snap(
                position.x
            );


        position.y =
            snap(
                position.y
            );


        position.z =
            snap(
                position.z
            );


        return position;
    }


    // =========================================================
    // UPDATE PREVIEW
    // =========================================================

    function updatePreview() {

        if (
            !state.preview
        ) {
            return;
        }


        const position =
            getBuildPosition();


        state.preview.position.copy(
            position
        );


        state.preview.rotation.y =
            state.rotation;


        // Move wall/floor/roof toward
        // terrain height when appropriate.

        if (
            world &&
            typeof world.getTerrainHeight ===
            "function"
        ) {

            if (
                state.mode === "wall"
            ) {

                const ground =
                    world.getTerrainHeight(
                        position.x,
                        position.z
                    );


                state.preview.position.y =
                    ground + 2;
            }


            if (
                state.mode === "floor"
            ) {

                const ground =
                    world.getTerrainHeight(
                        position.x,
                        position.z
                    );


                state.preview.position.y =
                    ground + .2;
            }
        }
    }


    // =========================================================
    // CAN BUILD
    // =========================================================

    function canBuild() {

        const definition =
            definitions[
                state.mode
            ];


        if (
            state.materials <
            definition.cost
        ) {

            return false;
        }


        const position =
            getBuildPosition();


        if (
            world &&
            world.size
        ) {

            const limit =
                world.size / 2;


            if (
                Math.abs(
                    position.x
                ) >
                limit
            ) {

                return false;
            }


            if (
                Math.abs(
                    position.z
                ) >
                limit
            ) {

                return false;
            }
        }


        return true;
    }


    // =========================================================
    // PLACE BUILDING
    // =========================================================

    function place() {

        if (
            !gameState.started
        ) {
            return;
        }


        if (
            !canBuild()
        ) {
            return;
        }


        const now =
            performance.now();


        if (
            now -
            state.lastPlacement <
            state.placementDelay
        ) {

            return;
        }


        state.lastPlacement =
            now;


        const definition =
            definitions[
                state.mode
            ];


        const geometry =
            createGeometry(
                state.mode,
                definition
            );


        const piece =
            new THREE.Mesh(
                geometry,
                placedMaterial.clone()
            );


        const position =
            getBuildPosition();


        piece.position.copy(
            position
        );


        piece.rotation.y =
            state.rotation;


        // Terrain adjustment.

        if (
            world &&
            typeof world.getTerrainHeight ===
            "function"
        ) {

            const ground =
                world.getTerrainHeight(
                    position.x,
                    position.z
                );


            if (
                state.mode === "wall"
            ) {

                piece.position.y =
                    ground + 2;
            }


            if (
                state.mode === "floor"
            ) {

                piece.position.y =
                    ground + .2;
            }
        }


        piece.castShadow =
            true;


        piece.receiveShadow =
            true;


        piece.userData =
            {

                isBuildPiece: true,

                buildType:
                    state.mode,

                health: 150,

                maxHealth: 150,

                cost:
                    definition.cost
            };


        scene.add(
            piece
        );


        if (
            !world.buildings
        ) {

            world.buildings =
                [];
        }


        world.buildings.push(
            piece
        );


        if (
            !world.objects
        ) {

            world.objects =
                [];
        }


        world.objects.push(
            piece
        );


        state.materials -=
            definition.cost;
    }


    // =========================================================
    // INPUT
    // =========================================================

    window.addEventListener(
        "keydown",
        event => {

            if (
                !gameState.started
            ) {
                return;
            }


            switch (
                event.code
            ) {

                case "KeyQ":

                    setMode(
                        "wall"
                    );

                    break;


                case "KeyF":

                    setMode(
                        "floor"
                    );

                    break;


                case "KeyV":

                    setMode(
                        "ramp"
                    );

                    break;


                case "KeyB":

                    setMode(
                        "roof"
                    );

                    break;


                case "KeyR":

                    // R is also used by
                    // weapons for reload.
                    //
                    // Only rotate when
                    // building mode is
                    // active.

                    if (
                        state.placing
                    ) {

                        rotate();
                    }

                    break;
            }
        }
    );


    window.addEventListener(
        "mousedown",
        event => {

            if (
                !gameState.started
            ) {
                return;
            }


            if (
                event.button === 0 &&
                state.placing
            ) {

                place();
            }


            if (
                event.button === 2 &&
                state.placing
            ) {

                state.placing =
                    false;
            }
        }
    );


    // Prevent browser context menu.

    window.addEventListener(
        "contextmenu",
        event => {

            event.preventDefault();
        }
    );


    // =========================================================
    // BUILD MODE
    // =========================================================

    function enterBuildMode() {

        state.placing =
            true;


        if (
            !state.preview
        ) {

            createPreview();
        }


        state.preview.visible =
            true;
    }


    function exitBuildMode() {

        state.placing =
            false;


        if (
            state.preview
        ) {

            state.preview.visible =
                false;
        }
    }


    // =========================================================
    // UPDATE
    // =========================================================

    function update(
        delta
    ) {

        if (
            !gameState.started
        ) {
            return;
        }


        // Holding a build key is not
        // required; the system can be
        // entered automatically when
        // selecting a build piece.

        if (
            state.placing
        ) {

            updatePreview();
        }
    }


    // =========================================================
    // START
    // =========================================================

    function start() {

        state.materials =
            500;


        state.rotation =
            0;


        state.placing =
            false;


        createPreview();


        if (
            state.preview
        ) {

            state.preview.visible =
                false;
        }
    }


    // =========================================================
    // PUBLIC API
    // =========================================================

    return {

        state,

        definitions,

        start,

        update,

        place,

        rotate,

        setMode,

        enterBuildMode,

        exitBuildMode,

        get materials() {

            return state.materials;
        },

        get mode() {

            return state.mode;
        },

        get placing() {

            return state.placing;
        }
    };
}
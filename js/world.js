import * as THREE from "three";

export function createWorld({
    scene,
    gameState
}) {

    // =========================================================
    // WORLD SETTINGS
    // =========================================================

    const world = {

        size: 2400,

        objects: [],

        trees: [],

        rocks: [],

        buildings: [],

        loot: [],

        water: null,

        ground: null
    };


    // =========================================================
    // MATERIALS
    // =========================================================

    const grassMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x4f8a3a,
            roughness: 1
        });


    const dirtMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x8a633f,
            roughness: 1
        });


    const rockMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x777777,
            roughness: .95
        });


    const trunkMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x70452a,
            roughness: 1
        });


    const leafMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x246b35,
            roughness: 1
        });


    const waterMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x238fd1,

            transparent: true,

            opacity: .72,

            roughness: .2,

            metalness: .05
        });


    const buildingMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x8b5a32,

            roughness: .85
        });


    const roofMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x38495a,

            roughness: .9
        });


    // =========================================================
    // TERRAIN
    // =========================================================

    const terrainSegments =
        80;


    const terrainGeometry =
        new THREE.PlaneGeometry(
            world.size,
            world.size,
            terrainSegments,
            terrainSegments
        );


    const positions =
        terrainGeometry.attributes
            .position;


    // Generate rolling terrain.

    for (
        let i = 0;
        i < positions.count;
        i++
    ) {

        const x =
            positions.getX(i);


        const y =
            positions.getY(i);


        const distance =
            Math.sqrt(
                x * x +
                y * y
            );


        const wave1 =
            Math.sin(
                x * .012
            ) * 8;


        const wave2 =
            Math.cos(
                y * .015
            ) * 7;


        const wave3 =
            Math.sin(
                (x + y) * .009
            ) * 10;


        const hill =
            Math.max(
                0,
                1 -
                distance / 1100
            );


        const height =
            (
                wave1 +
                wave2 +
                wave3
            ) *
            hill;


        positions.setZ(
            i,
            height
        );
    }


    terrainGeometry.computeVertexNormals();


    const ground =
        new THREE.Mesh(
            terrainGeometry,
            grassMaterial
        );


    ground.rotation.x =
        -Math.PI / 2;


    ground.receiveShadow =
        true;


    ground.name =
        "IslandTerrain";


    scene.add(
        ground
    );


    world.ground =
        ground;


    // =========================================================
    // WATER
    // =========================================================

    const waterGeometry =
        new THREE.PlaneGeometry(
            3000,
            3000
        );


    const water =
        new THREE.Mesh(
            waterGeometry,
            waterMaterial
        );


    water.rotation.x =
        -Math.PI / 2;


    water.position.y =
        -4;


    water.name =
        "Ocean";


    scene.add(
        water
    );


    world.water =
        water;


    // =========================================================
    // TREES
    // =========================================================

    function createTree(
        x,
        z,
        scale = 1
    ) {

        const tree =
            new THREE.Group();


        tree.position.set(
            x,
            getTerrainHeight(
                x,
                z
            ),
            z
        );


        tree.scale.setScalar(
            scale
        );


        // Trunk

        const trunk =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    .45,
                    .7,
                    6,
                    8
                ),
                trunkMaterial
            );


        trunk.position.y =
            3;


        trunk.castShadow =
            true;


        tree.add(
            trunk
        );


        // Lower foliage

        const lowerLeaves =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    3.4,
                    6,
                    8
                ),
                leafMaterial
            );


        lowerLeaves.position.y =
            7;


        lowerLeaves.castShadow =
            true;


        tree.add(
            lowerLeaves
        );


        // Upper foliage

        const upperLeaves =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    2.6,
                    5,
                    8
                ),
                leafMaterial
            );


        upperLeaves.position.y =
            10;


        upperLeaves.castShadow =
            true;


        tree.add(
            upperLeaves
        );


        tree.userData =
            {
                type: "tree",

                health: 150,

                resource: 30
            };


        scene.add(
            tree
        );


        world.trees.push(
            tree
        );


        world.objects.push(
            tree
        );


        return tree;
    }


    // =========================================================
    // ROCKS
    // =========================================================

    function createRock(
        x,
        z,
        scale = 1
    ) {

        const rock =
            new THREE.Mesh(
                new THREE.DodecahedronGeometry(
                    2.5,
                    1
                ),
                rockMaterial
            );


        rock.position.set(
            x,
            getTerrainHeight(
                x,
                z
            ) + 1.3 * scale,
            z
        );


        rock.scale.set(
            scale,
            scale * .75,
            scale
        );


        rock.rotation.set(
            Math.random(),
            Math.random(),
            Math.random()
        );


        rock.castShadow =
            true;


        rock.receiveShadow =
            true;


        rock.userData =
            {
                type: "rock",

                health: 200,

                resource: 40
            };


        scene.add(
            rock
        );


        world.rocks.push(
            rock
        );


        world.objects.push(
            rock
        );


        return rock;
    }


    // =========================================================
    // SMALL BUILDING
    // =========================================================

    function createBuilding(
        x,
        z,
        rotation = 0
    ) {

        const building =
            new THREE.Group();


        building.position.set(
            x,
            getTerrainHeight(
                x,
                z
            ),
            z
        );


        building.rotation.y =
            rotation;


        // Floor

        const floor =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    16,
                    .5,
                    16
                ),
                dirtMaterial
            );


        floor.position.y =
            .25;


        floor.receiveShadow =
            true;


        building.add(
            floor
        );


        // Walls

        const wallPositions = [

            [0, 4, -7.75, 16, 8, .5],

            [0, 4, 7.75, 16, 8, .5],

            [-7.75, 4, 0, .5, 8, 16],

            [7.75, 4, 0, .5, 8, 16]
        ];


        for (
            const [
                wx,
                wy,
                wz,
                sx,
                sy,
                sz
            ]
            of wallPositions
        ) {

            const wall =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        sx,
                        sy,
                        sz
                    ),
                    buildingMaterial
                );


            wall.position.set(
                wx,
                wy,
                wz
            );


            wall.castShadow =
                true;


            wall.receiveShadow =
                true;


            building.add(
                wall
            );
        }


        // Roof

        const roof =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    18,
                    1,
                    18
                ),
                roofMaterial
            );


        roof.position.y =
            8.5;


        roof.castShadow =
            true;


        building.add(
            roof
        );


        building.userData =
            {
                type: "building",

                health: 500
            };


        scene.add(
            building
        );


        world.buildings.push(
            building
        );


        world.objects.push(
            building
        );


        return building;
    }


    // =========================================================
    // LOOT
    // =========================================================

    function createLoot(
        x,
        z,
        type
    ) {

        const colors = {

            weapon:
                0xff8a00,

            shield:
                0x248cff,

            heal:
                0x32d66f,

            ammo:
                0xffdd45
        };


        const material =
            new THREE.MeshStandardMaterial({
                color:
                    colors[type] ||
                    0xffffff,

                emissive:
                    colors[type] ||
                    0xffffff,

                emissiveIntensity:
                    .25
            });


        const item =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.5,
                    1.5,
                    1.5
                ),
                material
            );


        item.position.set(
            x,
            getTerrainHeight(
                x,
                z
            ) + 1.2,
            z
        );


        item.rotation.y =
            Math.PI / 4;


        item.userData =
            {
                type: "loot",

                lootType: type
            };


        scene.add(
            item
        );


        world.loot.push(
            item
        );


        return item;
    }


    // =========================================================
    // TERRAIN HEIGHT
    // =========================================================

    function getTerrainHeight(
        x,
        z
    ) {

        const distance =
            Math.sqrt(
                x * x +
                z * z
            );


        const hill =
            Math.max(
                0,
                1 -
                distance / 1100
            );


        return (
            Math.sin(
                x * .012
            ) * 8 +

            Math.cos(
                z * .015
            ) * 7 +

            Math.sin(
                (x + z) * .009
            ) * 10
        ) * hill;
    }


    // =========================================================
    // RANDOM WORLD GENERATION
    // =========================================================

    function generateForest() {

        for (
            let i = 0;
            i < 150;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;


            const distance =
                100 +
                Math.random() *
                900;


            const x =
                Math.cos(angle) *
                distance;


            const z =
                Math.sin(angle) *
                distance;


            const scale =
                .7 +
                Math.random() *
                .7;


            createTree(
                x,
                z,
                scale
            );
        }
    }


    function generateRocks() {

        for (
            let i = 0;
            i < 70;
            i++
        ) {

            const x =
                (
                    Math.random() -
                    .5
                ) *
                2000;


            const z =
                (
                    Math.random() -
                    .5
                ) *
                2000;


            createRock(
                x,
                z,
                .6 +
                Math.random() *
                1.4
            );
        }
    }


    function generateBuildings() {

        const locations = [

            [-350, -300],

            [250, -420],

            [550, 100],

            [-500, 350],

            [100, 450],

            [700, 500],

            [-750, -100]
        ];


        for (
            const [
                x,
                z
            ]
            of locations
        ) {

            createBuilding(
                x,
                z,
                Math.random() *
                Math.PI *
                2
            );


            createLoot(
                x,
                z,
                "weapon"
            );


            createLoot(
                x + 5,
                z + 3,
                "ammo"
            );
        }
    }


    function generateLoot() {

        const types = [

            "weapon",

            "shield",

            "heal",

            "ammo"
        ];


        for (
            let i = 0;
            i < 50;
            i++
        ) {

            const x =
                (
                    Math.random() -
                    .5
                ) *
                1800;


            const z =
                (
                    Math.random() -
                    .5
                ) *
                1800;


            const type =
                types[
                    Math.floor(
                        Math.random() *
                        types.length
                    )
                ];


            createLoot(
                x,
                z,
                type
            );
        }
    }


    // =========================================================
    // GENERATE
    // =========================================================

    generateForest();

    generateRocks();

    generateBuildings();

    generateLoot();


    // =========================================================
    // DECORATION
    // =========================================================

    function createCloud(
        x,
        y,
        z,
        scale
    ) {

        const cloud =
            new THREE.Group();


        cloud.position.set(
            x,
            y,
            z
        );


        cloud.scale.setScalar(
            scale
        );


        const cloudMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xffffff,

                transparent: true,

                opacity: .75
            });


        for (
            let i = 0;
            i < 5;
            i++
        ) {

            const puff =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        15 +
                        Math.random() *
                        10,
                        12,
                        12
                    ),
                    cloudMaterial
                );


            puff.position.x =
                (
                    i -
                    2
                ) *
                15;


            puff.position.y =
                Math.random() *
                8;


            cloud.add(
                puff
            );
        }


        scene.add(
            cloud
        );
    }


    for (
        let i = 0;
        i < 12;
        i++
    ) {

        createCloud(
            (
                Math.random() -
                .5
            ) * 2000,

            180 +
            Math.random() *
            80,

            (
                Math.random() -
                .5
            ) * 2000,

            .8 +
            Math.random()
        );
    }


    // =========================================================
    // UPDATE
    // =========================================================

    function update(
        delta
    ) {

        // Rotate loot.

        for (
            const item
            of world.loot
        ) {

            if (
                !item.parent
            ) {
                continue;
            }


            item.rotation.y +=
                delta * 1.5;


            item.position.y =
                getTerrainHeight(
                    item.position.x,
                    item.position.z
                ) +
                1.2 +
                Math.sin(
                    gameState.time * 3
                ) *
                .15;
        }
    }


    // =========================================================
    // PUBLIC API
    // =========================================================

    world.update =
        update;


    world.getTerrainHeight =
        getTerrainHeight;


    return world;
}
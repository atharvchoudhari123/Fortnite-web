import * as THREE from "three";

import { createWorld } from "./world.js";
import { createPlayer } from "./player.js";
import { createWeapons } from "./weapons.js";
import { createEnemies } from "./enemies.js";
import { createBuildingSystem } from "./building.js";
import { createStorm } from "./storm.js";
import { createInventory } from "./inventory.js";
import { createUI } from "./ui.js";


// =============================================================
// GAME STATE
// =============================================================

const gameState = {

    started: false,

    gameOver: false,

    victory: false,

    playersLeft: 21,

    time: 0
};


// =============================================================
// THREE.JS SCENE
// =============================================================

const scene =
    new THREE.Scene();


scene.background =
    new THREE.Color(
        0x82c8f5
    );


// =============================================================
// CAMERA
// =============================================================

const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth /
        window.innerHeight,
        .1,
        5000
    );


camera.position.set(
    0,
    5,
    10
);


// =============================================================
// RENDERER
// =============================================================

const renderer =
    new THREE.WebGLRenderer({

        antialias: true,

        powerPreference:
            "high-performance"
    });


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);


renderer.shadowMap.enabled =
    true;


renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


renderer.outputColorSpace =
    THREE.SRGBColorSpace;


renderer.toneMapping =
    THREE.ACESFilmicToneMapping;


renderer.toneMappingExposure =
    1.1;


document.body.appendChild(
    renderer.domElement
);


// =============================================================
// LIGHTING
// =============================================================

const hemisphereLight =
    new THREE.HemisphereLight(
        0xbfe8ff,
        0x35522d,
        2
    );


scene.add(
    hemisphereLight
);


const sun =
    new THREE.DirectionalLight(
        0xffffff,
        3
    );


sun.position.set(
    500,
    900,
    300
);


sun.castShadow =
    true;


sun.shadow.mapSize.width =
    2048;


sun.shadow.mapSize.height =
    2048;


sun.shadow.camera.left =
    -1000;


sun.shadow.camera.right =
    1000;


sun.shadow.camera.top =
    1000;


sun.shadow.camera.bottom =
    -1000;


sun.shadow.camera.near =
    1;


sun.shadow.camera.far =
    2500;


scene.add(
    sun
);


// =============================================================
// WORLD
// =============================================================

const world =
    createWorld({

        scene,

        gameState
    });


// =============================================================
// PLAYER
// =============================================================

const player =
    createPlayer({

        scene,

        camera,

        world,

        gameState
    });


// =============================================================
// WEAPONS
// =============================================================

const weapons =
    createWeapons({

        scene,

        camera,

        player,

        world,

        gameState
    });


// =============================================================
// ENEMIES
// =============================================================

const enemies =
    createEnemies({

        scene,

        player,

        world,

        weapons,

        gameState
    });


// =============================================================
// BUILDING
// =============================================================

const building =
    createBuildingSystem({

        scene,

        camera,

        player,

        world,

        gameState
    });


// =============================================================
// STORM
// =============================================================

const storm =
    createStorm({

        scene,

        player,

        world,

        gameState
    });


// =============================================================
// INVENTORY
// =============================================================

const inventory =
    createInventory({

        player,

        weapons,

        gameState
    });


// =============================================================
// UI
// =============================================================

const ui =
    createUI({

        gameState,

        player,

        weapons,

        inventory,

        building,

        storm
    });


// =============================================================
// GAME START
// =============================================================

function startGame() {

    if (
        gameState.started
    ) {
        return;
    }


    gameState.started =
        true;


    gameState.gameOver =
        false;


    gameState.victory =
        false;


    gameState.playersLeft =
        21;


    gameState.time =
        0;


    player.start();


    inventory.start();


    building.start();


    storm.start();


    enemies.start();


    ui.showStartMessage();


    // Pointer lock.

    try {

        renderer.domElement.requestPointerLock();

    } catch (
        error
    ) {

        console.warn(
            "Pointer lock unavailable."
        );
    }
}


// =============================================================
// GAME OVER
// =============================================================

function gameOver() {

    if (
        gameState.gameOver
    ) {
        return;
    }


    gameState.gameOver =
        true;


    gameState.started =
        false;


    ui.showMessage(
        "YOU PLACED #21",
        999
    );


    if (
        document.pointerLockElement
    ) {

        document.exitPointerLock();
    }
}


// =============================================================
// VICTORY
// =============================================================

function victory() {

    if (
        gameState.victory
    ) {
        return;
    }


    gameState.victory =
        true;


    gameState.started =
        false;


    ui.showMessage(
        "VICTORY!",
        999
    );


    if (
        document.pointerLockElement
    ) {

        document.exitPointerLock();
    }
}


// =============================================================
// UPDATE GAME STATE
// =============================================================

function updateGameState() {

    if (
        player.dead &&
        !gameState.gameOver
    ) {

        gameOver();

        return;
    }


    const remaining =
        enemies.getRemaining();


    gameState.playersLeft =
        remaining + 1;


    if (
        remaining <= 0 &&
        !player.dead
    ) {

        victory();
    }
}


// =============================================================
// MAIN GAME LOOP
// =============================================================

let previousTime =
    performance.now();


function gameLoop() {

    requestAnimationFrame(
        gameLoop
    );


    const now =
        performance.now();


    const delta =
        Math.min(
            (now -
                previousTime) /
                1000,
            .05
        );


    previousTime =
        now;


    gameState.time +=
        delta;


    // ---------------------------------------------------------
    // GAME SYSTEMS
    // ---------------------------------------------------------

    if (
        gameState.started
    ) {

        player.update(
            delta
        );


        weapons.update(
            delta
        );


        enemies.update(
            delta
        );


        building.update(
            delta
        );


        storm.update(
            delta
        );


        inventory.update(
            delta
        );


        updateGameState();
    }


    // UI can update even when the
    // game is paused/finished.

    ui.update();


    // ---------------------------------------------------------
    // RENDER
    // ---------------------------------------------------------

    renderer.render(
        scene,
        camera
    );
}


// =============================================================
// RESIZE
// =============================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );


        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );
    }
);


// =============================================================
// CLICK TO START
// =============================================================

renderer.domElement.addEventListener(
    "click",
    () => {

        if (
            !gameState.started &&
            !gameState.gameOver &&
            !gameState.victory
        ) {

            startGame();

            return;
        }


        // Re-lock pointer if the player
        // clicked the game after unlocking.

        if (
            gameState.started &&
            document.pointerLockElement !==
            renderer.domElement
        ) {

            try {

                renderer.domElement.requestPointerLock();

            } catch (
                error
            ) {}
        }
    }
);


// =============================================================
// INITIAL UI MESSAGE
// =============================================================

setTimeout(
    () => {

        ui.showMessage(
            "CLICK TO DROP IN",
            999999
        );

    },
    100
);


// =============================================================
// START LOOP
// =============================================================

gameLoop();
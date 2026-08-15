export function createUI({
    gameState,
    player,
    weapons,
    inventory,
    building,
    storm
}) {

    // =========================================================
    // UI STATE
    // =========================================================

    const state = {

        messageTimer: 0,

        messageText: "",

        initialized: false
    };


    // =========================================================
    // CREATE HUD
    // =========================================================

    function createHUD() {

        if (
            document.getElementById(
                "game-hud"
            )
        ) {
            return;
        }


        const hud =
            document.createElement(
                "div"
            );


        hud.id =
            "game-hud";


        hud.innerHTML = `

            <!-- CROSSHAIR -->

            <div id="crosshair">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>


            <!-- TOP LEFT -->

            <div id="top-left-hud">

                <div id="location-name">
                    BATTLE ISLAND
                </div>

                <div id="players-left">
                    👥 21
                </div>

            </div>


            <!-- TOP RIGHT -->

            <div id="minimap">

                <div id="map-grid"></div>

                <div id="player-marker">
                    ▲
                </div>

                <div id="storm-marker"></div>

            </div>


            <!-- STORM -->

            <div id="storm-hud">

                <div class="storm-title">
                    STORM
                </div>

                <div id="storm-timer">
                    00:00
                </div>

            </div>


            <!-- CENTER MESSAGE -->

            <div id="center-message">

                <div id="message-title"></div>

                <div id="message-subtitle"></div>

            </div>


            <!-- BOTTOM LEFT -->

            <div id="player-hud">

                <div id="health-row">

                    <div class="hud-label">
                        HP
                    </div>

                    <div class="bar">

                        <div
                            id="health-bar"
                            class="bar-fill health"
                        ></div>

                    </div>

                    <div id="health-text">
                        100
                    </div>

                </div>


                <div id="shield-row">

                    <div class="hud-label">
                        SHIELD
                    </div>

                    <div class="bar">

                        <div
                            id="shield-bar"
                            class="bar-fill shield"
                        ></div>

                    </div>

                    <div id="shield-text">
                        0
                    </div>

                </div>

            </div>


            <!-- MATERIALS -->

            <div id="materials-hud">

                <div class="materials-icon">
                    🪵
                </div>

                <div id="materials-count">
                    500
                </div>

            </div>


            <!-- BOTTOM RIGHT -->

            <div id="weapon-hud">

                <div id="weapon-name">
                    ASSAULT RIFLE
                </div>

                <div id="ammo">

                    <span id="ammo-current">
                        30
                    </span>

                    <span class="ammo-divider">
                        /
                    </span>

                    <span id="ammo-reserve">
                        120
                    </span>

                </div>

                <div id="reload-text">
                    RELOADING
                </div>

            </div>


            <!-- INVENTORY -->

            <div id="inventory-bar">

                <div
                    class="inventory-slot selected"
                    data-slot="1"
                >
                    <div class="slot-number">
                        1
                    </div>

                    <div
                        class="slot-name"
                        id="slot-1"
                    >
                        AR
                    </div>
                </div>


                <div
                    class="inventory-slot"
                    data-slot="2"
                >
                    <div class="slot-number">
                        2
                    </div>

                    <div
                        class="slot-name"
                        id="slot-2"
                    >
                        SHOTGUN
                    </div>
                </div>


                <div
                    class="inventory-slot"
                    data-slot="3"
                >
                    <div class="slot-number">
                        3
                    </div>

                    <div
                        class="slot-name"
                        id="slot-3"
                    >
                        HEAL
                    </div>
                </div>


                <div
                    class="inventory-slot"
                    data-slot="4"
                >
                    <div class="slot-number">
                        4
                    </div>

                    <div
                        class="slot-name"
                        id="slot-4"
                    >
                        SHIELD
                    </div>
                </div>


                <div
                    class="inventory-slot"
                    data-slot="5"
                >
                    <div class="slot-number">
                        5
                    </div>

                    <div
                        class="slot-name"
                        id="slot-5"
                    >
                        PICKAXE
                    </div>
                </div>

            </div>


            <!-- BUILD HUD -->

            <div id="build-hud">

                <div class="build-title">
                    BUILD
                </div>

                <div class="build-piece">
                    Q — WALL
                </div>

                <div class="build-piece">
                    F — FLOOR
                </div>

                <div class="build-piece">
                    V — RAMP
                </div>

                <div class="build-piece">
                    B — ROOF
                </div>

                <div id="build-materials">
                    500
                </div>

            </div>


            <!-- CONTROLS -->

            <div id="controls-hint">

                WASD MOVE
                &nbsp; • &nbsp;
                SHIFT SPRINT
                &nbsp; • &nbsp;
                SPACE JUMP
                &nbsp; • &nbsp;
                LMB FIRE

            </div>

        `;


        document.body.appendChild(
            hud
        );


        state.initialized =
            true;
    }


    // =========================================================
    // ELEMENT HELPER
    // =========================================================

    function element(
        id
    ) {

        return document.getElementById(
            id
        );
    }


    // =========================================================
    // HEALTH
    // =========================================================

    function updateHealth() {

        const health =
            Math.max(
                0,
                player.health
            );


        const shield =
            Math.max(
                0,
                player.shield
            );


        const healthBar =
            element(
                "health-bar"
            );


        const shieldBar =
            element(
                "shield-bar"
            );


        if (
            healthBar
        ) {

            healthBar.style.width =
                `${health}%`;
        }


        if (
            shieldBar
        ) {

            shieldBar.style.width =
                `${shield}%`;
        }


        const healthText =
            element(
                "health-text"
            );


        const shieldText =
            element(
                "shield-text"
            );


        if (
            healthText
        ) {

            healthText.textContent =
                Math.ceil(
                    health
                );
        }


        if (
            shieldText
        ) {

            shieldText.textContent =
                Math.ceil(
                    shield
                );
        }
    }


    // =========================================================
    // PLAYERS LEFT
    // =========================================================

    function updatePlayers() {

        const display =
            element(
                "players-left"
            );


        if (
            display
        ) {

            display.textContent =
                `👥 ${gameState.playersLeft}`;
        }
    }


    // =========================================================
    // WEAPON
    // =========================================================

    function updateWeapon() {

        const name =
            element(
                "weapon-name"
            );


        const current =
            element(
                "ammo-current"
            );


        const reserve =
            element(
                "ammo-reserve"
            );


        if (
            name
        ) {

            name.textContent =
                weapons.weaponName;
        }


        if (
            current
        ) {

            current.textContent =
                weapons.ammo;
        }


        if (
            reserve
        ) {

            reserve.textContent =
                weapons.reserveAmmo;
        }


        const reloadText =
            element(
                "reload-text"
            );


        if (
            reloadText
        ) {

            reloadText.style.display =
                weapons.state.reloading
                    ? "block"
                    : "none";
        }
    }


    // =========================================================
    // MATERIALS
    // =========================================================

    function updateMaterials() {

        const count =
            building.materials;


        const materials =
            element(
                "materials-count"
            );


        const buildMaterials =
            element(
                "build-materials"
            );


        if (
            materials
        ) {

            materials.textContent =
                count;
        }


        if (
            buildMaterials
        ) {

            buildMaterials.textContent =
                `${count} MATERIALS`;
        }
    }


    // =========================================================
    // STORM
    // =========================================================

    function updateStorm() {

        if (
            !storm
        ) {
            return;
        }


        const timer =
            element(
                "storm-timer"
            );


        if (
            !timer
        ) {
            return;
        }


        let seconds = 0;


        if (
            typeof storm.getTimeRemaining ===
            "function"
        ) {

            seconds =
                Math.max(
                    0,
                    storm.getTimeRemaining()
                );
        }


        const minutes =
            Math.floor(
                seconds / 60
            );


        const remainingSeconds =
            Math.floor(
                seconds % 60
            );


        timer.textContent =
            `${String(minutes).padStart(2, "0")}:` +
            `${String(remainingSeconds).padStart(2, "0")}`;
    }


    // =========================================================
    // INVENTORY
    // =========================================================

    function updateInventory() {

        if (
            !inventory
        ) {
            return;
        }


        let selected =
            1;


        if (
            typeof inventory.getSelectedSlot ===
            "function"
        ) {

            selected =
                inventory.getSelectedSlot();
        }


        const slots =
            document.querySelectorAll(
                ".inventory-slot"
            );


        slots.forEach(
            slot => {

                const slotNumber =
                    Number(
                        slot.dataset.slot
                    );


                slot.classList.toggle(
                    "selected",
                    slotNumber ===
                    selected
                );
            }
        );
    }


    // =========================================================
    // BUILD MODE
    // =========================================================

    function updateBuilding() {

        const buildHud =
            element(
                "build-hud"
            );


        if (
            !buildHud
        ) {
            return;
        }


        buildHud.classList.toggle(
            "active",
            Boolean(
                building &&
                building.placing
            )
        );
    }


    // =========================================================
    // MESSAGE
    // =========================================================

    function showMessage(
        title,
        duration = 3
    ) {

        state.messageText =
            title;


        state.messageTimer =
            duration;


        const message =
            element(
                "center-message"
            );


        const messageTitle =
            element(
                "message-title"
            );


        if (
            message
        ) {

            message.classList.add(
                "visible"
            );
        }


        if (
            messageTitle
        ) {

            messageTitle.textContent =
                title;
        }
    }


    // =========================================================
    // START MESSAGE
    // =========================================================

    function showStartMessage() {

        showMessage(
            "DROP IN!",
            3
        );
    }


    // =========================================================
    // UPDATE MESSAGE
    // =========================================================

    function updateMessage(
        delta
    ) {

        if (
            state.messageTimer <=
            0
        ) {
            return;
        }


        state.messageTimer -=
            delta;


        if (
            state.messageTimer <=
            0
        ) {

            const message =
                element(
                    "center-message"
                );


            if (
                message
            ) {

                message.classList.remove(
                    "visible"
                );
            }
        }
    }


    // =========================================================
    // INVENTORY KEYBOARD
    // =========================================================

    function setupInventoryKeys() {

        window.addEventListener(
            "keydown",
            event => {

                const number =
                    Number(
                        event.key
                    );


                if (
                    number < 1 ||
                    number > 5
                ) {
                    return;
                }


                if (
                    inventory &&
                    typeof inventory.select ===
                    "function"
                ) {

                    inventory.select(
                        number
                    );
                }
            }
        );
    }


    // =========================================================
    // BUILD BUTTONS
    // =========================================================

    function setupBuildingKeys() {

        window.addEventListener(
            "keydown",
            event => {

                if (
                    !building
                ) {
                    return;
                }


                switch (
                    event.code
                ) {

                    case "KeyQ":

                    case "KeyF":

                    case "KeyV":

                    case "KeyB":

                        if (
                            typeof building.enterBuildMode ===
                            "function"
                        ) {

                            building.enterBuildMode();
                        }

                        break;
                }
            }
        );
    }


    // =========================================================
    // CREATE UI
    // =========================================================

    createHUD();

    setupInventoryKeys();

    setupBuildingKeys();


    // =========================================================
    // UPDATE
    // =========================================================

    let previousTime =
        performance.now();


    function update() {

        if (
            !state.initialized
        ) {
            return;
        }


        const now =
            performance.now();


        const delta =
            Math.min(
                (now -
                    previousTime) /
                    1000,
                .1
            );


        previousTime =
            now;


        updateHealth();

        updatePlayers();

        updateWeapon();

        updateMaterials();

        updateStorm();

        updateInventory();

        updateBuilding();

        updateMessage(
            delta
        );
    }


    // =========================================================
    // PUBLIC API
    // =========================================================

    return {

        update,

        showMessage,

        showStartMessage
    };
}
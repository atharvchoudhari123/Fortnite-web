import * as THREE from "three";

export function createInventory({
    player,
    weapons,
    gameState
}) {

    // =========================================================
    // INVENTORY SETTINGS
    // =========================================================

    const SLOT_COUNT = 5;


    // =========================================================
    // INVENTORY STATE
    // =========================================================

    const state = {

        selectedSlot: 1,

        slots: [

            {
                id: 1,

                type: "weapon",

                name: "ASSAULT RIFLE",

                amount: 1
            },

            {
                id: 2,

                type: "weapon",

                name: "SHOTGUN",

                amount: 1
            },

            {
                id: 3,

                type: "heal",

                name: "MED KIT",

                amount: 3
            },

            {
                id: 4,

                type: "shield",

                name: "SHIELD POTION",

                amount: 2
            },

            {
                id: 5,

                type: "pickaxe",

                name: "PICKAXE",

                amount: 1
            }
        ]
    };


    // =========================================================
    // SELECT SLOT
    // =========================================================

    function select(
        slotNumber
    ) {

        if (
            slotNumber < 1 ||
            slotNumber > SLOT_COUNT
        ) {
            return;
        }


        state.selectedSlot =
            slotNumber;


        const slot =
            state.slots[
                slotNumber - 1
            ];


        if (
            !slot
        ) {
            return;
        }


        // Automatically equip weapons.

        if (
            slot.type ===
            "weapon"
        ) {

            equipWeapon(
                slot
            );
        }
    }


    // =========================================================
    // EQUIP WEAPON
    // =========================================================

    function equipWeapon(
        slot
    ) {

        if (
            !weapons
        ) {
            return;
        }


        if (
            typeof weapons.equip ===
            "function"
        ) {

            weapons.equip(
                slot.name
            );

            return;
        }


        // Compatibility with simpler
        // weapon systems.

        if (
            typeof weapons.setWeapon ===
            "function"
        ) {

            weapons.setWeapon(
                slot.name
            );
        }
    }


    // =========================================================
    // USE SELECTED ITEM
    // =========================================================

    function useSelected() {

        if (
            !gameState.started
        ) {
            return;
        }


        const slot =
            state.slots[
                state.selectedSlot - 1
            ];


        if (
            !slot
        ) {
            return;
        }


        switch (
            slot.type
        ) {

            case "weapon":

                equipWeapon(
                    slot
                );

                break;


            case "heal":

                useHeal(
                    slot
                );

                break;


            case "shield":

                useShield(
                    slot
                );

                break;


            case "pickaxe":

                equipPickaxe();

                break;
        }
    }


    // =========================================================
    // HEAL
    // =========================================================

    function useHeal(
        slot
    ) {

        if (
            slot.amount <= 0
        ) {
            return;
        }


        if (
            player.health >=
            player.maxHealth
        ) {
            return;
        }


        if (
            typeof player.heal !==
            "function"
        ) {
            return;
        }


        player.heal(
            25
        );


        slot.amount--;


        cleanupEmptySlot(
            slot
        );
    }


    // =========================================================
    // SHIELD
    // =========================================================

    function useShield(
        slot
    ) {

        if (
            slot.amount <= 0
        ) {
            return;
        }


        if (
            player.shield >=
            player.maxShield
        ) {
            return;
        }


        if (
            typeof player.addShield !==
            "function"
        ) {
            return;
        }


        player.addShield(
            25
        );


        slot.amount--;


        cleanupEmptySlot(
            slot
        );
    }


    // =========================================================
    // PICKAXE
    // =========================================================

    function equipPickaxe() {

        if (
            weapons &&
            typeof weapons.equipPickaxe ===
            "function"
        ) {

            weapons.equipPickaxe();
        }
    }


    // =========================================================
    // EMPTY SLOT
    // =========================================================

    function cleanupEmptySlot(
        slot
    ) {

        if (
            slot.amount <= 0
        ) {

            slot.amount =
                0;
        }
    }


    // =========================================================
    // ADD ITEM
    // =========================================================

    function addItem(
        type,
        name,
        amount = 1
    ) {

        // First try to stack with
        // an existing item.

        for (
            const slot
            of state.slots
        ) {

            if (
                slot.type === type &&
                slot.name === name
            ) {

                slot.amount +=
                    amount;

                return true;
            }
        }


        // Otherwise find an empty slot.

        for (
            const slot
            of state.slots
        ) {

            if (
                slot.amount <= 0
            ) {

                slot.type =
                    type;

                slot.name =
                    name;

                slot.amount =
                    amount;

                return true;
            }
        }


        return false;
    }


    // =========================================================
    // REMOVE ITEM
    // =========================================================

    function removeItem(
        slotNumber,
        amount = 1
    ) {

        const slot =
            state.slots[
                slotNumber - 1
            ];


        if (
            !slot
        ) {
            return false;
        }


        if (
            slot.amount <
            amount
        ) {
            return false;
        }


        slot.amount -=
            amount;


        return true;
    }


    // =========================================================
    // GET SELECTED SLOT
    // =========================================================

    function getSelectedSlot() {

        return state.selectedSlot;
    }


    // =========================================================
    // GET SELECTED ITEM
    // =========================================================

    function getSelectedItem() {

        return state.slots[
            state.selectedSlot - 1
        ];
    }


    // =========================================================
    // GET SLOTS
    // =========================================================

    function getSlots() {

        return state.slots;
    }


    // =========================================================
    // KEYBOARD
    // =========================================================

    function setupKeyboard() {

        window.addEventListener(
            "keydown",
            event => {

                if (
                    !gameState.started
                ) {
                    return;
                }


                const number =
                    Number(
                        event.key
                    );


                if (
                    number >= 1 &&
                    number <= SLOT_COUNT
                ) {

                    select(
                        number
                    );

                    return;
                }


                if (
                    event.code ===
                    "KeyE"
                ) {

                    useSelected();
                }
            }
        );
    }


    // =========================================================
    // START
    // =========================================================

    function start() {

        state.selectedSlot =
            1;


        setupKeyboard();


        const firstSlot =
            state.slots[0];


        if (
            firstSlot &&
            firstSlot.type ===
            "weapon"
        ) {

            equipWeapon(
                firstSlot
            );
        }
    }


    // =========================================================
    // UPDATE
    // =========================================================

    function update(
        delta
    ) {

        // Inventory currently has no
        // continuous simulation work.
        //
        // This function exists so main.js
        // can update the system uniformly.
    }


    // =========================================================
    // PUBLIC API
    // =========================================================

    return {

        state,

        slots:
            state.slots,

        start,

        update,

        select,

        useSelected,

        addItem,

        removeItem,

        getSelectedSlot,

        getSelectedItem,

        getSlots
    };
}
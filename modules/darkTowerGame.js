class DarkTowerGame {
    constructor() {
        this.media = {};
        this.playerNames = [];
        this.players = [];
        this.currentPlayer = null;
        this.lock = [];
    }

    loadScreen() {}
    error() {}

    setupGame() {
        this.players = this.playerNames.map(name => ({
            name,
            inventory: new Map([
                ["gold", 30],
                ["food", 25],
                ["warriors", 10],
                ["beast", false],
                ["scout", false],
                ["healer", false],
                ["sword", false],
                ["wizard", false],
                ["brassKey", false],
                ["silverKey", false],
                ["goldKey", false]
            ]),
            chance_move: new Map([
                ["safe", 1],
                ["battle", 2],
                ["dragon", 0],
                ["plague", 0],
                ["cursed", 0],
                ["lost", 0.5]
            ]),
            chance_tomb: new Map([
                ["empty", 0.5],
                ["battle", 2],
                ["treasure", 0]
            ]),
            chance_treasure: new Map([
                ["gold", 1],
                ["key", 0],
                ["sword", 0],
                ["wizard", 0],
                ["pegasus", 0]
            ]),
            frontier: 0,
            turnState: []
        }));
        this.currentPlayer = 0;
    }
    resetGame() {
        this.playerNames = [];
        this.players = [];
        this.currentPlayer = null;
    }

    turn(player) {
        if (!player.turnState.at(-1)) player.turnState = ["start"];
        return DarkTowerStates[player.turnState.at(-1)]?.(player, this);
    }
    nextPlayer() {
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    }
};

class DarkTowerStates {
    static start(player) {
        return {
            name: "start",
            keys: "000010111111",
            state: {
                bazaar: "bazaar",
                tomb: "tomb",
                move: "move",
                sanctuary: "sanctuary",
                darkTower: "darkTower",
                frontier: "frontier",
                inventory: "inventory_warriors"
            }
        };
    }

    static bazaar(player) {
        return {
            name: "bazaar"
        };
    }

    static tomb(player) {
        return {
            name: "tomb"
        };
    }

    static move(player) {
        return {
            name: "move"
        };
    }

    static sanctuary(player) {
        return {
            name: "sanctuary"
        };
    }

    static darkTower(player, dt) {
        if (player.frontier !== 4 || !["brassKey", "silverKey", "goldKey"].every(key => player.inventory.get(key))) {
            return {
                name: "darkTower",
                keys: "000001000000",
                img: dt.media.image.keymissing,
                audio: dt.media.audio.player_hit,
                state: {
                    clear: "start"
                }
            };
        }
        dt.keyGuess = ["brassKey", "silverKey", "goldKey"].sort(() => Math.random() - 0.5);
        if (!dt.lock.length) dt.lock = dt.keyGuess.toSorted(() => Math.random() - 0.5);
        let state;
        if (dt.keyGuess[0] === dt.lock[0]) state = {
            yes: "keyGuessed",
            no: "pickKey1"
        };
        else state = {
            yes: "wrongKey",
            no: "pickKey1"
        };
        return {
            name: "darkTower",
            keys: "000000000000",
            audio: dt.media.audio.darktower,
            audioThen: {
                keys: "101000000000",
                img: dt.media.image[dt.keyGuess[0].toLowerCase()]
            },
            state
        };
    }

    static keyGuessed(player, dt) {
        let state;
        if (dt.keyGuess[1] === dt.lock[1]) state = {
            yes: "darkTower_battle",
            no: "pickKey2"
        };
        else state = {
            yes: "wrongKey",
            no: "pickKey2"
        };
        return {
            name: "keyGuessed",
            keys: "101000000000",
            audio: dt.media.audio.click,
            img: dt.media.image[dt.keyGuess[1].toLowerCase()],
            state
        };
    }

    static pickKey1(player, dt) {
        dt.keyGuess = [...dt.keyGuess.slice(1), dt.keyGuess[0]];
        let state;
        if (dt.keyGuess[0] === dt.lock[0]) state = {
            yes: "keyGuessed",
            no: "pickKey1"
        };
        else state = {
            yes: "wrongKey",
            no: "pickKey1"
        };
        return {
            name: "pickKey1",
            keys: "101000000000",
            audio: dt.media.audio.click,
            img: dt.media.image[dt.keyGuess[0].toLowerCase()],
            state
        };
    }

    static pickKey2(player, dt) {
        dt.keyGuess = [dt.keyGuess[0], dt.keyGuess[2], dt.keyGuess[1]];
        let state;
        if (dt.keyGuess[1] === dt.lock[1]) state = {
            yes: "darkTower_battle",
            no: "pickKey2"
        };
        else state = {
            yes: "wrongKey",
            no: "pickKey2"
        };
        return {
            name: "pickKey2",
            keys: "101000000000",
            audio: dt.media.audio.click,
            img: dt.media.image[dt.keyGuess[1].toLowerCase()],
            state
        };
    }

    static wrongKey(player, dt) {
        dt.keyGuess = null;
        return {
            keys: "000000000000",
            audio: dt.media.audio.player_hit,
            audioThen: {
                keys: "001000000000"
            },
            state: {
                no: "endTurn"
            }
        };
    }

    static darkTower_battle(player, dt) {
        return {
            output: "dark tower battle"
        };
    }

    static frontier(player, dt) {
        const ret = {
            name: "frontier",
            audio: dt.media.audio.frontier
        };
        const success = Object.assign({
            keys: "000000000000",
            audioThen: {
                keys: "001000000000"
            },
            state: {
                no: "endTurn"
            }
        }, ret);
        const noKey = Object.assign({
            keys: "000000000000",
            audioThen: {
                audio: dt.media.audio.player_hit,
                img: dt.media.image.keymissing,
                keys: "000001000000"
            },
            state: {
                clear: "start"
            }
        }, ret);
        const keyNeeded = ["", "brassKey", "silverKey", "goldKey"];
        const key = keyNeeded[player.frontier];console.log(key, key.length, !key.length);
        if (!key.length || player.inventory.get(key)) {
            player.frontier++;
            return success;
        }
        return noKey;
    }

    static inventory_warriors(player, dt) {
        return {
            name: "inventory_warriors",
            keys: "100001000000",
            output: player.inventory.get("warriors"),
            img: dt.media.image.warriors,
            state: {
                yes: "inventory_gold",
                clear: "start"
            }
        };
    }

    static inventory_gold(player, dt) {
        return {
            name: "inventory_gold",
            keys: "110001000000",
            output: player.inventory.get("gold"),
            img: dt.media.image.gold,
            state: {
                yes: "inventory_food",
                repeat: "inventory_warriors",
                clear: "start"
            }
        };
    }

    static inventory_food(player, dt) {
        let keys = "110001000000";
        let state = {
            repeat: "inventory_warriors",
            clear: "start"
        };
        let yes = [
            "beast",
            "scout",
            "healer",
            "sword",
            "wizard",
            "brassKey",
            "silverKey",
            "goldKey"
        ].find(item => Boolean(player.inventory.get(item)));
        if (yes) {
            state.yes = `inventory_${yes}`;
        }
        else {
            keys = "010001000000";
        }
        return {
            name: "inventory_food",
            keys,
            output: player.inventory.get("food"),
            img: dt.media.image.food,
            state
        };
    }

    static inventory_beast(player, dt) {
        let keys = "110001000000";
        let state = {
            repeat: "inventory_warriors",
            clear: "start"
        };
        let yes = [
            "scout",
            "healer",
            "sword",
            "wizard",
            "brassKey",
            "silverKey",
            "goldKey"
        ].find(item => Boolean(player.inventory.get(item)));
        if (yes) {
            state.yes = `inventory_${yes}`;
        }
        else {
            keys = "010001000000";
        }
        return {
            name: "inventory_beast",
            keys,
            output: "01",
            img: dt.media.image.beast,
            state
        };
    }

    static inventory_scout(player, dt) {
        let keys = "110001000000";
        let state = {
            repeat: "inventory_warriors",
            clear: "start"
        };
        let yes = [
            "healer",
            "sword",
            "wizard",
            "brassKey",
            "silverKey",
            "goldKey"
        ].find(item => Boolean(player.inventory.get(item)));
        if (yes) {
            state.yes = `inventory_${yes}`;
        }
        else {
            keys = "010001000000";
        }
        return {
            name: "inventory_scout",
            keys,
            output: "01",
            img: dt.media.image.scout,
            state
        };
    }

    static inventory_healer(player, dt) {
        let keys = "110001000000";
        let state = {
            repeat: "inventory_warriors",
            clear: "start"
        };
        let yes = [
            "sword",
            "wizard",
            "brassKey",
            "silverKey",
            "goldKey"
        ].find(item => Boolean(player.inventory.get(item)));
        if (yes) {
            state.yes = `inventory_${yes}`;
        }
        else {
            keys = "010001000000";
        }
        return {
            name: "inventory_healer",
            keys,
            output: "01",
            img: dt.media.image.healer,
            state
        };
    }

    static inventory_sword(player, dt) {
        let keys = "110001000000";
        let state = {
            repeat: "inventory_warriors",
            clear: "start"
        };
        let yes = [
            "wizard",
            "brassKey",
            "silverKey",
            "goldKey"
        ].find(item => Boolean(player.inventory.get(item)));
        if (yes) {
            state.yes = `inventory_${yes}`;
        }
        else {
            keys = "010001000000";
        }
        return {
            name: "inventory_sword",
            keys,
            output: "01",
            img: dt.media.image.sword,
            state
        };
    }

    static inventory_wizard(player, dt) {
        let keys = "110001000000";
        let state = {
            repeat: "inventory_warriors",
            clear: "start"
        };
        let yes = [
            "brassKey",
            "silverKey",
            "goldKey"
        ].find(item => Boolean(player.inventory.get(item)));
        if (yes) {
            state.yes = `inventory_${yes}`;
        }
        else {
            keys = "010001000000";
        }
        return {
            name: "inventory_wizard",
            keys,
            output: "01",
            img: dt.media.image.wizard,
            state
        };
    }

    static inventory_brassKey(player, dt) {
        let keys = "110001000000";
        let state = {
            repeat: "inventory_warriors",
            clear: "start"
        };
        let yes = [
            "silverKey",
            "goldKey"
        ].find(item => Boolean(player.inventory.get(item)));
        if (yes) {
            state.yes = `inventory_${yes}`;
        }
        else {
            keys = "010001000000";
        }
        return {
            name: "inventory_brassKey",
            keys,
            output: "01",
            img: dt.media.image.brasskey,
            state
        };
    }

    static inventory_silverKey(player, dt) {
        let keys = "110001000000";
        let state = {
            repeat: "inventory_warriors",
            clear: "start"
        };
        let yes = [
            "goldKey"
        ].find(item => Boolean(player.inventory.get(item)));
        if (yes) {
            state.yes = `inventory_${yes}`;
        }
        else {
            keys = "010001000000";
        }
        return {
            name: "inventory_silverKey",
            keys,
            output: "01",
            img: dt.media.image.silverkey,
            state
        };
    }

    static inventory_goldKey(player, dt) {
        let keys = "010001000000";
        let state = {
            repeat: "inventory_warriors",
            clear: "start"
        };
        return {
            name: "inventory_silverKey",
            keys,
            output: "01",
            img: dt.media.image.goldkey,
            state
        };
    }
}

const darkTowerGame = new DarkTowerGame();
export default darkTowerGame;
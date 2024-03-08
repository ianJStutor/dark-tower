class DarkTowerGame {
    constructor() {
        this.media = {};
        this.playerNames = [];
        this.players = [];
        this.currentPlayer = null;
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
            move: new Map([
                ["safe", 1],
                ["battle", 2],
                ["dragon", 0],
                ["plague", 0],
                ["cursed", 0],
                ["lost", 0.5]
            ]),
            tomb: new Map([
                ["empty", 0.5],
                ["battle", 2],
                ["treasure", 0]
            ]),
            treasure: new Map([
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
};

class DarkTowerStates {
    static start(player) {
        return {
            keys: "000010111111",
            output: null,
            img: null,
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
}

const darkTowerGame = new DarkTowerGame();
export default darkTowerGame;
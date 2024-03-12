import DarkTowerPlayer from "./darkTowerPlayer.js";
import DarkTowerStates from "./darkTowerStates.js";

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
        this.players = this.playerNames.map(name => new DarkTowerPlayer(name));
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

const darkTowerGame = new DarkTowerGame();
export default darkTowerGame;
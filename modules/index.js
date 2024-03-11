import loadMedia from "./media.js";
import darkTowerGame from "./darkTowerGame.js";

darkTowerGame.loadScreen = (id) => {
    document.body.className = "";
    const main = document.querySelector("main");
    const template = document.getElementById(id).content.cloneNode(true);
    main.replaceChildren(template);
};

darkTowerGame.error = (message) => {
    darkTowerGame.media.audio.player_hit.play();
    const dialog = document.querySelector("dialog");
    dialog.querySelector("h2").textContent = message;
    dialog.showModal();
    dialog.addEventListener("click", () => {
        dialog.close();
        darkTowerGame.media.audio.end_turn.play();
    }, { once: true });
};

darkTowerGame.media = await loadMedia([
    { type: "audio", name: "battle", path: "./media/audio/battle.wav" },
    { type: "audio", name: "bazaar_closed", path: "./media/audio/bazaar-closed.wav" },
    { type: "audio", name: "bazaar", path: "./media/audio/bazaar.wav" },
    { type: "audio", name: "beep", path: "./media/audio/beep.wav" },
    { type: "audio", name: "click", path: "./media/audio/click.wav" },
    { type: "audio", name: "cursed", path: "./media/audio/plague.wav" },
    { type: "audio", name: "darktower", path: "./media/audio/darktower.wav" },
    { type: "audio", name: "dragon_kill", path: "./media/audio/dragon-kill.wav" },
    { type: "audio", name: "dragon", path: "./media/audio/dragon.wav" },
    { type: "audio", name: "end_turn", path: "./media/audio/end-turn.wav" },
    { type: "audio", name: "enemy_hit", path: "./media/audio/enemy-hit.wav" },
    { type: "audio", name: "frontier", path: "./media/audio/frontier.wav" },
    { type: "audio", name: "intro", path: "./media/audio/intro.wav" },
    { type: "audio", name: "lost", path: "./media/audio/lost.wav" },
    { type: "audio", name: "pegasus", path: "./media/audio/pegasus.wav" },
    { type: "audio", name: "plague", path: "./media/audio/plague.wav" },
    { type: "audio", name: "player_hit", path: "./media/audio/player-hit.wav" },
    { type: "audio", name: "sanctuary", path: "./media/audio/sanctuary.wav" },
    { type: "audio", name: "starving", path: "./media/audio/starving.wav" },
    { type: "audio", name: "tomb_battle", path: "./media/audio/tomb-battle.wav" },
    { type: "audio", name: "tomb_nothing", path: "./media/audio/tomb-nothing.wav" },
    { type: "audio", name: "whirrbeep", path: "./media/audio/whirrbeep.wav" },
    { type: "audio", name: "wizard", path: "./media/audio/pegasus.wav" },
    { type: "image", name: "bazaar", path: "./media/img/bazaar.jpg" },
    { type: "image", name: "beast", path: "./media/img/beast.jpg" },
    { type: "image", name: "brasskey", path: "./media/img/brasskey.jpg" },
    { type: "image", name: "brigands", path: "./media/img/brigands.jpg" },
    { type: "image", name: "cursed", path: "./media/img/cursed.jpg" },
    { type: "image", name: "dragon", path: "./media/img/dragon.jpg" },
    { type: "image", name: "food", path: "./media/img/food.jpg" },
    { type: "image", name: "gold", path: "./media/img/gold.jpg" },
    { type: "image", name: "goldkey", path: "./media/img/goldkey.jpg" },
    { type: "image", name: "healer", path: "./media/img/healer.jpg" },
    { type: "image", name: "keymissing", path: "./media/img/keymissing.jpg" },
    { type: "image", name: "lost", path: "./media/img/lost.jpg" },
    { type: "image", name: "pegasus", path: "./media/img/pegasus.jpg" },
    { type: "image", name: "plague", path: "./media/img/plague.jpg" },
    { type: "image", name: "scout", path: "./media/img/scout.jpg" },
    { type: "image", name: "silverkey", path: "./media/img/silverkey.jpg" },
    { type: "image", name: "sword", path: "./media/img/sword.jpg" },
    { type: "image", name: "victory", path: "./media/img/victory.jpg" },
    { type: "image", name: "warrior", path: "./media/img/warrior.jpg" },
    { type: "image", name: "warriors", path: "./media/img/warriors.jpg" },
    { type: "image", name: "wizard", path: "./media/img/wizard.jpg" },
], () => {
    darkTowerGame.loadScreen("splash");
}, darkTowerGame.error);

window.dt = darkTowerGame;
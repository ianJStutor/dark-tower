import DarkTowerSettings from "./darkTowerSettings.js";

export default class DarkTowerStates {

    static start(player, dt) {
        const { status } = player.eat();
        switch (status) {
            case "ok": return DarkTowerStates.menu(player, dt);
            case "warning": return DarkTowerStates.foodWarning(player, dt);
            case "death": return DarkTowerStates.starve_food(player, dt);
        }
    }

    static foodWarning(player, dt) {
        const output = player.food.toString().padStart(2, "0");
        const img = dt.media.image.food;
        return {
            name: "foodWarning",
            output,
            img,
            keys: "000000000000",
            audio: dt.media.audio.starving,
            audioThen: {
                keys: "000001000000",
                output,
                img,
                state: {
                    clear: "menu"
                }
            }
        };
    }

    static starve_food(player, dt) {
        const output = player.food.toString().padStart(2, "0");
        const img = dt.media.image.food;
        return {
            name: "starve_food",
            output,
            img,
            audio: dt.media.audio.plague,
            keys: "000000000000",
            audioThen: {
                output,
                img,
                keys: "000001000001",
                state: {
                    inventory: "starve_warriors",
                    clear: "menu"
                }
            }
        };
    }

    static starve_warriors(player, dt) {
        return {
            name: "starve_warriors",
            output: player.warriors.toString().padStart(2, "0"),
            img: dt.media.image.warriors,
            keys: "010001000001",
            state: {
                inventory: "starve_gold",
                repeat: "starve_food",
                clear: "menu"
            }
        };
    }

    static starve_gold(player, dt) {
        return {
            name: "starve_gold",
            output: player.gold.toString().padStart(2, "0"),
            img: dt.media.image.gold,
            keys: "010001000000",
            state: {
                repeat: "starve_food",
                clear: "menu"
            }
        };
    }

    static menu(player) {
        return {
            name: "menu",
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

    static bazaar(player, dt) {
        player.bazaar;
        const warriors_price = DarkTowerSettings.price.get("warriors");
        const food_price = DarkTowerSettings.price.get("food");
        dt.bazaar = {
            warriors: Math.floor(Math.random() * (warriors_price.max - warriors_price.min +1)) + warriors_price.min,
            food: Math.floor(Math.random() * (food_price.max - food_price.min +1)) + food_price.min
        };
        const extras = ["beast", "scout", "healer"].filter(i => !player[i]);
        const rand = Math.floor(Math.random() * (extras.length + 1));
        if (rand < extras.length) {
            const item = extras[rand];
            const item_price = DarkTowerSettings.price.get(item);
            dt.bazaar[item] = Math.floor(Math.random() * (item_price.max - item_price.min +1)) + item_price.min;
        }
        return {
            name: "bazaar",
            keys: "000000000000",
            audio: dt.media.audio.bazaar,
            audioThen: {
                redirect: "bazaar_warriors"
            }
        };
    }

    static bazaar_warriors(player, dt) {
        dt.bazaar_item = "warriors";
        dt.bazaar_qty = 0;
        return {
            output: dt.bazaar.warriors.toString().padStart(2, "0"),
            img: dt.media.image.warrior,
            keys: "100110000000",
            state: {
                yes: "bazaar_buy",
                haggle: "bazaar_haggle",
                bazaar: "bazaar_food"
            }
        };
    }

    static bazaar_food(player, dt) {
        dt.bazaar_item = "food";
        dt.bazaar_qty = 0;
        let bazaar;
        if (dt.bazaar.beast) bazaar = "bazaar_beast";
        else if (dt.bazaar.scout) bazaar = "bazaar_scout";
        else if (dt.bazaar.healer) bazaar = "bazaar_healer";
        else bazaar = "bazaar_warriors";
        return {
            output: dt.bazaar.food.toString().padStart(2, "0"),
            img: dt.media.image.food,
            keys: "110110000000",
            state: {
                yes: "bazaar_buy",
                repeat: "bazaar_warriors",
                haggle: "bazaar_haggle",
                bazaar
            }
        };
    }

    static bazaar_beast(player, dt) {
        dt.bazaar_item = "beast";
        dt.bazaar_qty = 1;
        let bazaar;
        if (dt.bazaar.scout) bazaar = "bazaar_scout";
        else if (dt.bazaar.healer) bazaar = "bazaar_healer";
        else bazaar = "bazaar_warriors";
        return {
            output: dt.bazaar.beast.toString().padStart(2, "0"),
            img: dt.media.image.beast,
            keys: "110110000000",
            state: {
                yes: "bazaar_sale",
                repeat: "bazaar_warriors",
                haggle: "bazaar_haggle",
                bazaar
            }
        };
    }

    static bazaar_scout(player, dt) {
        dt.bazaar_item = "scout";
        dt.bazaar_qty = 1;
        let bazaar;
        if (dt.bazaar.healer) bazaar = "bazaar_healer";
        else bazaar = "bazaar_warriors";
        return {
            output: dt.bazaar.scout.toString().padStart(2, "0"),
            img: dt.media.image.scout,
            keys: "110110000000",
            state: {
                yes: "bazaar_sale",
                repeat: "bazaar_warriors",
                haggle: "bazaar_haggle",
                bazaar
            }
        };
    }

    static bazaar_healer(player, dt) {
        dt.bazaar_item = "healer";
        dt.bazaar_qty = 1;
        return {
            output: dt.bazaar.healer.toString().padStart(2, "0"),
            img: dt.media.image.healer,
            keys: "110110000000",
            state: {
                yes: "bazaar_sale",
                repeat: "bazaar_warriors",
                haggle: "bazaar_haggle",
                bazaar: "bazaar_warriors"
            }
        };
    }

    static bazaar_buy(player, dt) {
        const item = dt.bazaar_item;
        let img;
        if (item === "warriors") img = dt.media.image.warrior;
        else img = dt.media.image[item];
        return {
            output: (++dt.bazaar_qty).toString().padStart(2, "0"),
            img,
            keys: "101000000000",
            state: {
                yes: "bazaar_buy",
                no: "bazaar_sale"
            }
        };
    }

    static bazaar_sale(player, dt) {
        const item = dt.bazaar_item;
        let gold = player.gold;
        gold -= dt.bazaar[item] * dt.bazaar_qty;
        if (gold < 0) return DarkTowerStates.bazaar_closed(player, dt);
        player.gold = gold;
        if (["beast", "scout", "healer"].includes(item)) player[item] = true;
        else player[item] = player[item] + dt.bazaar_qty;
        return {
            name: "bazaar_sale",
            output: player.gold.toString().padStart(2, "0"),
            img: dt.media.image.gold,
            audio: dt.media.audio.beep,
            keys: "001000000000",
            state: {
                no: "endTurn"
            }
        };
    }

    static bazaar_haggle(player, dt) {
        const item = dt.bazaar_item;
        const price = DarkTowerSettings.price.get(item);
        const chance = (dt.bazaar[item] - price.min) / (price.max - price.min);
        if (Math.random() < chance) {
            dt.bazaar[item]--;
            return DarkTowerStates[`bazaar_${item}`](player, dt);
        }
        else return DarkTowerStates.bazaar_closed(player, dt);
    }

    static bazaar_closed(player, dt) {
        return {
            img: dt.media.image.bazaar,
            audio: dt.media.audio.bazaar_closed,
            keys: "000000000000",
            audioThen: {
                img: dt.media.image.bazaar,
                keys: "001000000000",
                state: {
                    no: "endTurn"
                }
            }
        };
    }

    static tomb(player, dt) {
        player.location = "tomb";
        return DarkTowerStates[`tomb_${player.tomb}`](player, dt);
    }

    static tomb_empty(player, dt) {
        return {
            name: "tomb_empty",
            keys: "000000000000",
            audio: dt.media.audio.tomb_nothing,
            audioThen: {
                keys: "001000000000",
                state: {
                    no: "endTurn"
                }
            }
        };
    }

    static tomb_empty_treasure(player, dt) {
        return {
            name: "tomb_empty_treasure",
            keys: "000000000000",
            audio: dt.media.audio.tomb_nothing,
            audioThen: {
                redirect: "move_treasure"
            }
        };
    }

    static tomb_battle(player, dt) {
        const { min, max } = DarkTowerSettings.brigands.get("tomb");
        dt.brigands = Math.ceil((Math.random() * (max - min +1) + min) * player.difficulty);
        return DarkTowerStates.battle(player, dt);
    }

    static move(player, dt) {
        return DarkTowerStates[`move_${player.move}`](player, dt);
    }

    static move_safe(player, dt) {
        return {
            name: "move_safe",
            audio: dt.media.audio.beep,
            keys: "001000000000",
            state: {
                no: "endTurn"
            }
        };
    }

    static move_lost(player, dt) {
        return {
            name: "move_lost",
            img: dt.media.image.lost,
            keys: "000000000000",
            audio: dt.media.audio.lost,
            audioThen: {
                img: dt.media.image.lost,
                keys: "001000000000",
                state: {
                    no: "endTurn"
                }
            }
        };
    }

    static move_lost_scout(player, dt) {
        return {
            name: "move_lost_scout",
            img: dt.media.image.lost,
            keys: "000000000000",
            delay: 1500,
            delayThen: {
                output: "00",
                img: dt.media.image.scout,
                keys: "001000000000",
                state: {
                    no: "endTurn"
                }
            }
        };
    }

    static move_battle(player, dt) {
        const { min, max } = DarkTowerSettings.brigands.get("move");
        dt.brigands = Math.ceil((Math.random() * (max - min +1) + min) * player.difficulty);
        return DarkTowerStates.battle(player, dt);
    }

    static move_dragon_sword(player, dt) {
        return {
            name: "move_dragon_sword",
            keys: "000000000000",
            img: dt.media.image.dragon,
            audio: dt.media.audio.dragon_kill,
            delay: 1500,
            delayThen: {
                img: dt.media.image.sword,
                keys: "100000000000",
                state: {
                    yes: "dragon_treasure"
                }
            }
        };
    }

    static move_dragon(player, dt) {
        return {
            name: "move_dragon",
            keys: "000000000000",
            img: dt.media.image.dragon,
            audio: dt.media.audio.dragon,
            audioThen: {
                img: dt.media.image.dragon,
                keys: "100000000000",
                state: {
                    yes: "move_dragon_warriors"
                }
            }
        };
    }

    static move_dragon_warriors(player, dt) {
        return {
            name: "move_dragon_warriors",
            output: player.warriors.toString().padStart(2, "0"),
            img: dt.media.image.warriors,
            keys: "000000000001",
            state: {
                inventory: "move_dragon_gold"
            }
        };
    }

    static move_dragon_gold(player, dt) {
        return {
            name: "move_dragon_gold",
            output: player.gold.toString().padStart(2, "0"),
            img: dt.media.image.gold,
            keys: "011000000000",
            state: {
                repeat: "move_dragon_warriors",
                no: "endTurn"
            }
        };
    }

    static move_plague(player, dt) {
        return {
            name: "move_plague",
            keys: "000000000000",
            img: dt.media.image.plague,
            audio: dt.media.audio.plague,
            audioThen: {
                img: dt.media.image.plague,
                keys: "100000000000",
                state: {
                    yes: "move_plague_warriors"
                }
            }
        };
    }

    static move_plague_healer(player, dt) {
        return {
            name: "move_plague_healer",
            keys: "000000000000",
            img: dt.media.image.plague,
            delay: 1500,
            delayThen: {
                img: dt.media.image.healer,
                keys: "100000000000",
                state: {
                    yes: "move_plague_warriors"
                }
            }
        };
    }

    static move_plague_warriors(player, dt) {
        return {
            name: "move_plague_warriors",
            output: player.warriors.toString().padStart(2, "0"),
            img: dt.media.image.warriors,
            keys: "000000000001",
            state: {
                inventory: "move_plague_gold"
            }
        };
    }

    static move_plague_gold(player, dt) {
        return {
            name: "move_plague_gold",
            output: player.gold.toString().padStart(2, "0"),
            img: dt.media.image.gold,
            keys: "011000000000",
            state: {
                repeat: "move_plague_warriors",
                no: "endTurn"
            }
        };
    }

    static move_cursed(player, dt) {
        return {
            name: "move_cursed",
            keys: "000000000000",
            img: dt.media.image.cursed,
            audio: dt.media.audio.cursed,
            audioThen: {
                img: dt.media.image.cursed,
                keys: "100000000000",
                state: {
                    yes: "move_cursed_warriors"
                }
            }
        };
    }

    static move_cursed_wizard(player, dt) {
        return {
            name: "move_cursed_wizard",
            keys: "000000000000",
            img: dt.media.image.cursed,
            delay: 1500,
            delayThen: {
                img: dt.media.image.wizard,
                keys: "001000000000",
                state: {
                    no: "endTurn"
                }
            }
        };
    }

    static move_cursed_warriors(player, dt) {
        return {
            name: "move_cursed_warriors",
            output: player.warriors.toString().padStart(2, "0"),
            img: dt.media.image.warriors,
            keys: "000000000001",
            state: {
                inventory: "move_cursed_gold"
            }
        };
    }

    static move_cursed_gold(player, dt) {
        return {
            name: "move_cursed_gold",
            output: player.gold.toString().padStart(2, "0"),
            img: dt.media.image.gold,
            keys: "011000000000",
            state: {
                repeat: "move_cursed_warriors",
                no: "endTurn"
            }
        };
    }

    static sanctuary(player, dt) {
        player.sanctuary;
        return {
            name: "sanctuary",
            audio: dt.media.audio.sanctuary,
            keys: "000000000000",
            audioThen: {
                redirect: "sanctuary_warriors"
            }
        };
    }

    static sanctuary_warriors(player, dt) {
        return {
            name: "sanctuary_warriors",            
            output: player.warriors.toString().padStart(2, "0"),
            img: dt.media.image.warriors,
            keys: "000000000001",
            state: {
                inventory: "sanctuary_food"
            }
        };
    }

    static sanctuary_food(player, dt) {
        return {
            name: "sanctuary_food",
            output: player.food.toString().padStart(2, "0"),
            img: dt.media.image.food,
            keys: "010000000001",
            state: {
                inventory: "sanctuary_gold",
                repeat: "sanctuary_warriors"
            }
        };
    }

    static sanctuary_gold(player, dt) {
        return {
            name: "sanctuary_gold",
            output: player.gold.toString().padStart(2, "0"),
            img: dt.media.image.gold,
            keys: "011000000000",
            state: {
                repeat: "sanctuary_warriors",
                no: "endTurn"
            }
        };
    }

    static darkTower(player, dt) {
        if (player.darkTower === "noKey") return DarkTowerStates.darkTower_noKey(player, dt);
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
                state,
                img: dt.media.image[dt.keyGuess[0].toLowerCase()]
            }
        };
    }

    static darkTower_noKey(player, dt) {
        return {
            name: "darkTower_noKey",
            keys: "000000000000",
            img: dt.media.image.keymissing,
            audio: dt.media.audio.player_hit,
            audioThen: {
                img: dt.media.image.keymissing,
                keys: "000001000000",
                state: {
                    clear: "menu"
                }
            }
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
                keys: "001000000000",
                state: {
                    no: "endTurn"
                }
            }
        };
    }

    static darkTower_battle(player, dt) {
        const { min, max } = DarkTowerSettings.brigands.get("darkTower");
        dt.brigands = Math.ceil((Math.random() * (max - min +1) + min) * player.difficulty);
        return DarkTowerStates.battle(player, dt);
    }

    static darkTower_victory(player, dt) {
        return {
            name: "darkTower_victory",
            img: dt.media.image.victory,
            keys: "000000000000",
            audio: dt.media.audio.intro,
            audioThen: {
                img: dt.media.image.victory,
                keys: "001000000000",
                state: {
                    no: "endGame"
                }
            }
        };
    }

    static frontier(player, dt) {
        if (player.frontier === "noKey") return DarkTowerStates.frontier_noKey(player, dt);
        return {
            name: "frontier",
            audio: dt.media.audio.frontier,
            keys: "000000000000",
            audioThen: {
                keys: "001000000000",
                state: {
                    no: "endTurn"
                }
            }
        };
    }

    static frontier_noKey(player, dt) {
        return {
            name: "frontier_noKey",
            audio: dt.media.audio.frontier,
            keys: "000000000000",
            audioThen: {
                audio: dt.media.audio.player_hit,
                img: dt.media.image.keymissing,
                audioThen: {
                    img: dt.media.image.keymissing,
                    keys: "000001000000",
                    state: {
                        clear: "menu"
                    }
                }
            }
        };
    }

    static inventory_warriors(player, dt) {
        return {
            name: "inventory_warriors",
            keys: "000001000001",
            output: player.warriors.toString().padStart(2, "0"),
            img: dt.media.image.warriors,
            state: {
                inventory: "inventory_gold",
                clear: "menu"
            }
        };
    }

    static inventory_gold(player, dt) {
        return {
            name: "inventory_gold",
            keys: "010001000001",
            output: player.gold.toString().padStart(2, "0"),
            img: dt.media.image.gold,
            state: {
                inventory: "inventory_food",
                repeat: "inventory_warriors",
                clear: "menu"
            }
        };
    }

    static inventory_food(player, dt) {
        let keys = "010001000001";
        let state = {
            repeat: "inventory_warriors",
            clear: "menu"
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
        ].find(item => Boolean(player[item]));
        if (yes) {
            state.inventory = `inventory_${yes}`;
        }
        else {
            keys = "010001000000";
        }
        return {
            name: "inventory_food",
            keys,
            output: player.food.toString().padStart(2, "0"),
            img: dt.media.image.food,
            state
        };
    }

    static inventory_beast(player, dt) {
        let keys = "010001000001";
        let state = {
            repeat: "inventory_warriors",
            clear: "menu"
        };
        let yes = [
            "scout",
            "healer",
            "sword",
            "wizard",
            "brassKey",
            "silverKey",
            "goldKey"
        ].find(item => Boolean(player[item]));
        if (yes) {
            state.inventory = `inventory_${yes}`;
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
        let keys = "010001000001";
        let state = {
            repeat: "inventory_warriors",
            clear: "menu"
        };
        let yes = [
            "healer",
            "sword",
            "wizard",
            "brassKey",
            "silverKey",
            "goldKey"
        ].find(item => Boolean(player[item]));
        if (yes) {
            state.inventory = `inventory_${yes}`;
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
        let keys = "010001000001";
        let state = {
            repeat: "inventory_warriors",
            clear: "menu"
        };
        let yes = [
            "sword",
            "wizard",
            "brassKey",
            "silverKey",
            "goldKey"
        ].find(item => Boolean(player[item]));
        if (yes) {
            state.inventory = `inventory_${yes}`;
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
        let keys = "010001000001";
        let state = {
            repeat: "inventory_warriors",
            clear: "menu"
        };
        let yes = [
            "wizard",
            "brassKey",
            "silverKey",
            "goldKey"
        ].find(item => Boolean(player[item]));
        if (yes) {
            state.inventory = `inventory_${yes}`;
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
        let keys = "010001000001";
        let state = {
            repeat: "inventory_warriors",
            clear: "menu"
        };
        let yes = [
            "brassKey",
            "silverKey",
            "goldKey"
        ].find(item => Boolean(player[item]));
        if (yes) {
            state.inventory = `inventory_${yes}`;
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
        let keys = "010001000001";
        let state = {
            repeat: "inventory_warriors",
            clear: "menu"
        };
        let yes = [
            "silverKey",
            "goldKey"
        ].find(item => Boolean(player[item]));
        if (yes) {
            state.inventory = `inventory_${yes}`;
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
        let keys = "010001000001";
        let state = {
            repeat: "inventory_warriors",
            clear: "menu"
        };
        let yes = [
            "goldKey"
        ].find(item => Boolean(player[item]));
        if (yes) {
            state.inventory = `inventory_${yes}`;
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
            clear: "menu"
        };
        return {
            name: "inventory_silverKey",
            keys,
            output: "01",
            img: dt.media.image.goldkey,
            state
        };
    }

    static battle(player, dt) {
        if (player.location === "tomb") {
            return {
                name: "battle",
                audio: dt.media.audio.tomb_battle,
                keys: "000000000000",
                audioThen: {
                    redirect: "battle_brigands"
                }
            };
        }
        return {
            name: "battle",
            keys: "000000000000",
            audio: dt.media.audio.enemy_hit,
            audioThen: {
                audio: dt.media.audio.enemy_hit,
                audioThen: {
                    redirect: "battle_brigands"
                }
            }
        };
    }

    static battle_brigands(player, dt) {
        return {
            name: "battle_brigands",
            output: dt.brigands.toString().padStart(2, "0"),
            img: dt.media.image.brigands,
            keys: "001000000000",
            state: {
                no: "battle_escape"
            },
            audio: dt.media.audio.click,
            delay: 1500,
            delayThen: {
                redirect: "battle_warriors"
            }
        };
    }

    static battle_warriors(player, dt) {
        if (dt.brigands <= 0) {
            if (player.location === "darkTower") {
                return DarkTowerStates.darkTower_victory(player, dt);
            }
            if (player.location === "tomb") {
                return DarkTowerStates.tomb_treasure(player, dt);
            }
            return DarkTowerStates.move_treasure(player, dt);
        }
        return {
            name: "battle_warriors",
            output: player.warriors.toString().padStart(2, "0"),
            img: dt.media.image.warriors,
            keys: "001000000000",
            state: {
                no: "battle_escape"
            },
            audio: dt.media.audio.click,
            delay: 1500,
            delayThen: {
                redirect: "battle_result"
            }
        };
    }

    static battle_result(player, dt) {
        let warriors = player.warriors;
        const winChance = warriors / (warriors + dt.brigands);
        let audio;
        if (Math.random() < winChance) {
            audio = dt.media.audio.enemy_hit;
            dt.brigands = Math.floor(dt.brigands/2);
        }
        else {
            player.warriors = --warriors;
            if (warriors <= 0) return DarkTowerStates.battle_escape(player, dt);
            audio = dt.media.audio.player_hit;
        }
        return {
            name: "battle_result",
            keys: "001000000000",
            state: {
                no: "battle_escape"
            },
            audio,
            audioThen: {
                redirect: "battle_brigands"
            }
        };
    }

    static battle_escape(player, dt) {
        return {
            name: "battle_escape",
            output: player.warriors.toString().padStart(2, "0"),
            img: dt.media.image.warriors,
            keys: "000000000000",
            audio: dt.media.audio.plague,
            audioThen: {
                output: player.warriors.toString().padStart(2, "0"),
                img: dt.media.image.warriors,
                keys: "001000000000",
                state: {
                    no: "endTurn"
                }
            }
        };
    }

    static tomb_treasure(player, dt) {
        //gold
        const { min, max } = DarkTowerSettings.gold.get("tomb");
        const gold = Math.ceil(Math.random() * (max - min +1)) + min;
        player.gold = player.gold + gold;
        //lagniappe
        const lagniappe = player.treasure;
        if (!lagniappe || lagniappe === "nothing") return {
            name: "tomb_treasure",
            audio: dt.media.audio.beep,
            output: player.gold.toString().padStart(2, "0"),
            img: dt.media.image.gold,
            keys: "001000000000",
            state: {
                no: "endTurn"
            }
        };
        return {
            name: "tomb_lagniappe",
            audio: dt.media.audio.beep,
            output: player.gold.toString().padStart(2, "0"),
            img: dt.media.image.gold,
            keys: "000000000001",
            state: {
                inventory: `treasure_${lagniappe}`
            }
        };
    }

    static treasure_key(player, dt) {
        if (!player.silverKey) return {
            name: "treasure_brassKey",
            output: "01",
            img: dt.media.image.brasskey,
            keys: "001000000000",
            state: {
                no: "endTurn"
            }
        };
        if (!player.goldKey) return {
            name: "treasure_silverKey",
            output: "01",
            img: dt.media.image.silverkey,
            keys: "001000000000",
            state: {
                no: "endTurn"
            }
        };
        return {
            name: "treasure_goldKey",
            output: "01",
            img: dt.media.image.goldkey,
            keys: "001000000000",
            state: {
                no: "endTurn"
            }
        };
    }

    static treasure_sword(player, dt) {
        return {
            name: "treasure_sword",
            output: "01",
            img: dt.media.image.sword,
            keys: "001000000000",
            state: {
                no: "endTurn"
            }
        };
    }

    static treasure_wizard(player, dt) {
        return {
            name: "treasure_wizard",
            output: "01",
            img: dt.media.image.wizard,
            keys: "001000000000",
            state: {
                no: "endTurn"
            }
        };
    }

    static treasure_pegasus(player, dt) {
        return {
            name: "treasure_pegasus",
            keys: "000000000000",
            output: "01",
            img: dt.media.image.pegasus,
            audio: dt.media.audio.pegasus,
            audioThen: {
                keys: "001000000000",
                state: {
                    no: "endTurn"
                }
            }
        };
    }

    static move_treasure(player, dt) {
        const { min, max } = DarkTowerSettings.gold.get("move");
        const gold = Math.ceil(Math.random() * (max - min +1)) + min;
        player.gold = player.gold + gold;
        return {
            name: "move_treasure",
            output: player.gold.toString().padStart(2, "0"),
            img: dt.media.image.gold,
            audio: dt.media.audio.beep,
            keys: "001000000000",
            state: {
                no: "endTurn"
            }
        };
    }

    static dragon_treasure(player, dt) {
        //gold
        const { min, max } = DarkTowerSettings.gold.get("dragon");
        const gold = Math.ceil(Math.random() * (max - min +1)) + min;
        player.gold = player.gold + gold;
        //lagniappe
        const lagniappe = player.treasure;
        if (!lagniappe || lagniappe === "nothing") return {
            name: "dragon_treasure",
            audio: dt.media.audio.beep,
            output: player.gold.toString().padStart(2, "0"),
            img: dt.media.image.gold,
            keys: "001000000000",
            state: {
                no: "endTurn"
            }
        };
        return {
            name: "dragon_lagniappe",
            audio: dt.media.audio.beep,
            output: player.gold.toString().padStart(2, "0"),
            img: dt.media.image.gold,
            keys: "000000000001",
            state: {
                inventory: `treasure_${lagniappe}`
            }
        };
    }
}
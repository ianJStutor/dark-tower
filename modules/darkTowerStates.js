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
        player.location = "bazaar";
        const warriors_price = DarkTowerSettings.price.get("warriors");
        const food_price = DarkTowerSettings.price.get("food");
        dt.bazaar = {
            warriors: Math.floor(Math.random() * (warriors_price.max - warriors_price.min +1)) + warriors_price.min,
            food: Math.floor(Math.random() * (food_price.max - food_price.min +1)) + food_price.min
        };
        const extras = ["beast", "scout", "healer"].filter(i => !player.inventory.get(i));
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
        let gold = player.inventory.get("gold");
        gold -= dt.bazaar[item] * dt.bazaar_qty;
        if (gold < 0) return DarkTowerStates.bazaar_closed(player, dt);
        player.inventory.set("gold", gold);
        if (["beast", "scout", "healer"].includes(item)) player.inventory.set(item, true);
        else {
            let old_qty = player.inventory.get(item);
            player.inventory.set(item, old_qty + dt.bazaar_qty);
        }
        return {
            name: "bazaar_sale",
            output: player.inventory.get("gold").toString().padStart(2, "0"),
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
        const chances = {};
        const sum = [...player.chance_tomb.values()].reduce((a,b) => a+b, 0);
        player.chance_tomb.forEach((v,k) => {
            chances[k] = v/sum;
        });
        let rand = Math.random();
        let event;
        for (let key in chances) {
            if (rand < chances[key]) {
                event = key;
                break;
            }
            rand -= chances[key];
        }
        switch (event) {
            case "empty":
                player.chance_tomb.set("empty", 0);
                player.chance_tomb.set("battle", player.chance_tomb.get("battle")+1);
                player.chance_tomb.set("treasure", player.chance_tomb.get("treasure")+0.25);
                return DarkTowerStates.tomb_empty(player, dt);
            case "treasure":
                player.chance_tomb.set("empty", player.chance_tomb.get("empty")+0.5);
                player.chance_tomb.set("battle", player.chance_tomb.get("battle")+1);
                player.chance_tomb.set("treasure", 0);
                return DarkTowerStates.tomb_empty_treasure(player, dt);
            case "battle":
                player.chance_tomb.set("empty", player.chance_tomb.get("empty")+0.5);
                player.chance_tomb.set("battle", 1);
                player.chance_tomb.set("treasure", player.chance_tomb.get("treasure")+0.25);
                return DarkTowerStates.tomb_battle(player, dt);
        }
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
        dt.brigands = Math.ceil(Math.random() * (max - min +1)) + min;
        return DarkTowerStates.battle(player, dt);
    }

    static move(player, dt) {
        player.location = "move";
        const chances = {};
        const sum = [...player.chance_move.values()].reduce((a,b) => a+b, 0);
        player.chance_move.forEach((v,k) => {
            chances[k] = v/sum;
        });
        let rand = Math.random();
        let event;
        for (let key in chances) {
            if (rand < chances[key]) {
                event = key;
                break;
            }
            rand -= chances[key];
        }
        switch (event) {
            case "safe":
                player.chance_move.set("safe", 0.5);
                player.chance_move.set("battle", player.chance_move.get("battle")+0.25);
                player.chance_move.set("lost", player.chance_move.get("lost")+0.1);
                player.chance_move.set("dragon", player.chance_move.get("dragon")+0.05);
                player.chance_move.set("plague", player.chance_move.get("plague")+0.05);
                player.chance_move.set("cursed", player.chance_move.get("cursed")+0.01);
                return DarkTowerStates.move_safe(player, dt);
            case "lost":
                player.chance_move.set("safe", player.chance_move.get("safe")+0.25);
                player.chance_move.set("battle", player.chance_move.get("battle")+0.25);
                player.chance_move.set("lost", 0);
                player.chance_move.set("dragon", player.chance_move.get("dragon")+0.05);
                player.chance_move.set("plague", player.chance_move.get("plague")+0.05);
                player.chance_move.set("cursed", player.chance_move.get("cursed")+0.01);
                return DarkTowerStates.move_lost(player, dt);
            case "battle":
                player.chance_move.set("safe", player.chance_move.get("safe")+0.25);
                player.chance_move.set("battle", 0.75);
                player.chance_move.set("lost", player.chance_move.get("lost")+0.1);
                player.chance_move.set("dragon", player.chance_move.get("dragon")+0.05);
                player.chance_move.set("plague", player.chance_move.get("plague")+0.05);
                player.chance_move.set("cursed", player.chance_move.get("cursed")+0.01);
                return DarkTowerStates.move_battle(player, dt);
            case "dragon":
                player.chance_move.set("safe", player.chance_move.get("safe")+0.25);
                player.chance_move.set("battle", player.chance_move.get("battle")+0.25);
                player.chance_move.set("lost", player.chance_move.get("lost")+0.1);
                player.chance_move.set("dragon", 0);
                player.chance_move.set("plague", player.chance_move.get("plague")+0.05);
                player.chance_move.set("cursed", player.chance_move.get("cursed")+0.01);
                return DarkTowerStates.move_dragon(player, dt);
            case "plague":
                player.chance_move.set("safe", player.chance_move.get("safe")+0.25);
                player.chance_move.set("battle", player.chance_move.get("battle")+0.25);
                player.chance_move.set("lost", player.chance_move.get("lost")+0.1);
                player.chance_move.set("dragon", player.chance_move.get("dragon")+0.05);
                player.chance_move.set("plague", 0);
                player.chance_move.set("cursed", player.chance_move.get("cursed")+0.01);
                return DarkTowerStates.move_plague(player, dt);
            case "cursed":
                player.chance_move.set("safe", player.chance_move.get("safe")+0.25);
                player.chance_move.set("battle", player.chance_move.get("battle")+0.25);
                player.chance_move.set("lost", player.chance_move.get("lost")+0.1);
                player.chance_move.set("dragon", player.chance_move.get("dragon")+0.05);
                player.chance_move.set("plague", player.chance_move.get("plague")+0.05);
                player.chance_move.set("cursed", 0);
                return DarkTowerStates.move_cursed(player, dt);
        }
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
        if (player.inventory.get("scout")) {
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

    static move_battle(player, dt) {
        const { min, max } = DarkTowerSettings.brigands.get("move");
        dt.brigands = Math.ceil(Math.random() * (max - min +1)) + min;
        return DarkTowerStates.battle(player, dt);
    }

    static move_dragon(player, dt) {
        if (player.inventory.get("sword")) {
            player.inventory.set("sword", false);
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
        player.inventory.set("warriors", Math.ceil(player.inventory.get("warriors")/2));
        const carry = Math.min(99, player.inventory.get("warriors")*6 + (player.inventory.get("beast")?50:0));
        player.inventory.set("gold", Math.min(carry, Math.floor(player.inventory.get("gold")/2)));
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
            output: player.inventory.get("warriors").toString().padStart(2, "0"),
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
            output: player.inventory.get("gold").toString().padStart(2, "0"),
            img: dt.media.image.gold,
            keys: "011000000000",
            state: {
                repeat: "move_dragon_warriors",
                no: "endTurn"
            }
        };
    }

    static move_plague(player, dt) {
        if (player.inventory.get("healer")) {
            const newWarriors = Math.floor(Math.random() * 5) + 2;
            player.inventory.set("warriors", player.inventory.get("warriors") + newWarriors);
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
        player.inventory.set("warriors", Math.ceil(player.inventory.get("warriors")/2));
        const carry = Math.min(99, player.inventory.get("warriors")*6 + (player.inventory.get("beast")?50:0));
        player.inventory.set("gold", Math.min(carry, player.inventory.get("gold")));
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

    static move_plague_warriors(player, dt) {
        return {
            name: "move_plague_warriors",
            output: player.inventory.get("warriors").toString().padStart(2, "0"),
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
            output: player.inventory.get("gold").toString().padStart(2, "0"),
            img: dt.media.image.gold,
            keys: "011000000000",
            state: {
                repeat: "move_plague_warriors",
                no: "endTurn"
            }
        };
    }

    static move_cursed(player, dt) {
        if (player.inventory.get("wizard")) {
            player.inventory.set("wizard", false);
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
        player.inventory.set("warriors", Math.ceil(player.inventory.get("warriors")/2));
        const carry = Math.min(99, player.inventory.get("warriors")*6 + (player.inventory.get("beast")?50:0));
        player.inventory.set("gold", Math.min(carry, Math.floor(player.inventory.get("gold")/2)));
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

    static move_cursed_warriors(player, dt) {
        return {
            name: "move_cursed_warriors",
            output: player.inventory.get("warriors").toString().padStart(2, "0"),
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
            output: player.inventory.get("gold").toString().padStart(2, "0"),
            img: dt.media.image.gold,
            keys: "011000000000",
            state: {
                repeat: "move_cursed_warriors",
                no: "endTurn"
            }
        };
    }

    static sanctuary(player, dt) {
        if (player.frontier === 4 && ["brassKey", "silverKey", "goldKey"].every(key => player.inventory.get(key)) && player.location !== "sanctuary") {
            //home citadel, all keys
            let warriors = player.inventory.get("warriors");
            if (warriors >= 5 && warriors <= 24) {
                player.inventory.set("warriors", warriors * 2);
            }
        }
        player.location = "sanctuary";
        let [ warriors, food, gold ] = ["warriors", "food", "gold"].map(i => player.inventory.get(i));
        if (warriors <= 4) {
            warriors += Math.floor(Math.random() * 6) + 1;
            player.inventory.set("warriors", warriors);
        }
        if (food <= 5) {
            food += Math.floor(Math.random() * 6) + 4;
            player.inventory.set("food", food);
        }
        if (gold <= 7) {
            gold += Math.floor(Math.random() * 10) + 5;
            const carry = player.inventory.get("warriors")*6 + (player.inventory.get("beast")?50:0);
            player.inventory.set("gold", Math.min(carry, gold));
        }
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
            output: player.inventory.get("warriors").toString().padStart(2, "0"),
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
            output: player.inventory.get("food").toString().padStart(2, "0"),
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
            output: player.inventory.get("gold").toString().padStart(2, "0"),
            img: dt.media.image.gold,
            keys: "011000000000",
            state: {
                repeat: "sanctuary_warriors",
                no: "endTurn"
            }
        };
    }

    static darkTower(player, dt) {
        if (player.frontier !== 4 || !["brassKey", "silverKey", "goldKey"].every(key => player.inventory.get(key))) {
            return {
                name: "darkTower",
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
        player.location = "darkTower";
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
        dt.brigands = Math.ceil(Math.random() * (max - min +1)) + min;
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
        const ret = {
            name: "frontier",
            audio: dt.media.audio.frontier
        };
        const success = Object.assign({
            keys: "000000000000",
            audioThen: {
                keys: "001000000000",
                state: {
                    no: "endTurn"
                }
            }
        }, ret);
        const noKey = Object.assign({
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
        }, ret);
        const keyNeeded = ["", "brassKey", "silverKey", "goldKey"];
        const key = keyNeeded[player.frontier];
        if (key === "" || player.inventory.get(key)) {
            player.location = "frontier";
            player.frontier++;
            if (player.frontier < 4) player.chance_treasure.set("key", 2);
            return success;
        }
        return noKey;
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
        ].find(item => Boolean(player.inventory.get(item)));
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
            output: player.inventory.get("warriors").toString().padStart(2, "0"),
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
        const warriors = player.inventory.get("warriors");
        const winChance = warriors / (warriors + dt.brigands);
        let audio;
        if (Math.random() < winChance) {
            audio = dt.media.audio.enemy_hit;
            dt.brigands = Math.floor(dt.brigands/2);
        }
        else {
            player.inventory.set("warriors", warriors-1);
            const carry = player.inventory.get("warriors")*6 + (player.inventory.get("beast")?50:0);
            player.inventory.set("gold", Math.min(carry, player.inventory.get("gold")));
            if (player.inventory.get("warriors") <= 0) {
                player.inventory.set("warriors", 1);
                return DarkTowerStates.battle_escape(player, dt);
            }
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
            output: player.inventory.get("warriors").toString().padStart(2, "0"),
            img: dt.media.image.warriors,
            keys: "000000000000",
            audio: dt.media.audio.plague,
            audioThen: {
                output: player.inventory.get("warriors").toString().padStart(2, "0"),
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
        const newGold = Math.min(
            Math.min(player.inventory.get("warriors")*6 + (player.inventory.get("beast")?50:0), 99),
            player.inventory.get("gold") + gold
        );
        player.inventory.set("gold", newGold);
        //lagniappe
        let lagniappe;
        const chances = {};
        const sum = [...player.chance_treasure.values()].reduce((a,b) => a+b, 0);
        if (sum > 0) {
            player.chance_treasure.forEach((v,k) => {
                chances[k] = v/sum;
            });
            let rand = Math.random();
            for (let key in chances) {
                if (rand < chances[key]) {
                    lagniappe = key;
                    break;
                }
                rand -= chances[key];
            }
        }
        //increment chances
        if (
            player.frontier === 1 && !player.inventory.get("brassKey") ||
            player.frontier === 2 && !player.inventory.get("silverKey") ||
            player.frontier === 3 && !player.inventory.get("goldKey")
        ) player.chance_treasure.set("key", player.chance_treasure.get("key")+1);
        if (!player.inventory.get("sword")) player.chance_treasure.set("sword", player.chance_treasure.get("sword")+0.25);
        if (!player.inventory.get("pegasus")) player.chance_treasure.set("pegasus", player.chance_treasure.get("pegasus")+0.25);
        if (!player.inventory.get("wizard")) player.chance_treasure.set("wizard", player.chance_treasure.get("wizard")+0.25);
        if (lagniappe === "nothing") player.chance_treasure.set("nothing", 0);
        else player.chance_treasure.set("nothing", player.chance_treasure.get("nothing")+0.5);
        //return
        if (!lagniappe || lagniappe === "nothing") return {
            name: "tomb_treasure",
            audio: dt.media.audio.beep,
            output: player.inventory.get("gold").toString().padStart(2, "0"),
            img: dt.media.image.gold,
            keys: "001000000000",
            state: {
                no: "endTurn"
            }
        };
        return {
            name: "tomb_lagniappe",
            audio: dt.media.audio.beep,
            output: player.inventory.get("gold").toString().padStart(2, "0"),
            img: dt.media.image.gold,
            keys: "000000000001",
            state: {
                inventory: `tomb_treasure_${lagniappe}`
            }
        };
    }

    static tomb_treasure_key(player, dt) {
        player.chance_treasure.set("key", 0);
        if (player.frontier === 1) {
            player.inventory.set("brassKey", true);
            return {
                name: "treasure_brassKey",
                output: "01",
                img: dt.media.image.brasskey,
                keys: "001000000000",
                state: {
                    no: "endTurn"
                }
            };
        }
        if (player.frontier === 2) {
            player.inventory.set("silverKey", true);
            return {
                name: "treasure_silverKey",
                output: "01",
                img: dt.media.image.silverkey,
                keys: "001000000000",
                state: {
                    no: "endTurn"
                }
            };
        }
        if (player.frontier === 3) {
            player.inventory.set("goldKey", true);
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
    }

    static tomb_treasure_sword(player, dt) {
        player.inventory.set("sword", true);
        player.chance_treasure.set("sword", 0);
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

    static tomb_treasure_wizard(player, dt) {
        player.inventory.set("wizard", true);
        player.chance_treasure.set("wizard", 0);
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

    static tomb_treasure_pegasus(player, dt) {
        player.inventory.set("pegasus", true);
        player.chance_treasure.set("pegasus", 0);
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
        const newGold = Math.min(
            Math.min(player.inventory.get("warriors")*6 + (player.inventory.get("beast")?50:0), 99),
            player.inventory.get("gold") + gold
        );
        player.inventory.set("gold", newGold);
        return {
            name: "move_treasure",
            output: player.inventory.get("gold").toString().padStart(2, "0"),
            img: dt.media.image.gold,
            audio: dt.media.audio.beep,
            keys: "001000000000",
            state: {
                no: "endTurn"
            }
        };
    }

    static dragon_treasure(player, dt) {}
}
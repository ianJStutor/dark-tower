import DarkTowerSettings from "./darkTowerSettings.js";

export default class DarkTowerPlayer {
    #frontier = 0;
    constructor(name) {
        this.name = name;
        this.inventory = new Map([
            ["gold", DarkTowerSettings.start.get("gold")],
            ["food", DarkTowerSettings.start.get("food")],
            ["warriors", DarkTowerSettings.start.get("warriors")],
            ["beast", false],
            ["scout", false],
            ["healer", false],
            ["sword", false],
            ["wizard", false],
            ["brassKey", false],
            ["silverKey", false],
            ["goldKey", false]
        ]);
        this.chance_move = new Map([
            ["safe", 1],
            ["battle", 2],
            ["dragon", 0],
            ["plague", 0],
            ["cursed", 0],
            ["lost", 0.5]
        ]);
        this.chance_tomb = new Map([
            ["empty", 0.5],
            ["battle", 2],
            ["empty_treasure", 0]
        ]);
        this.chance_treasure = new Map([
            ["nothing", 1],
            ["key", 0],
            ["sword", 0],
            ["wizard", 0],
            ["pegasus", 0]
        ]);
        this.turnState = [];
        this.location = "move";
    }
    event(which) {
        const ret = {};
        const map = this[`chance_${which}`];
        if (map) {
            const sum = [...map.values()].reduce((a,b) => a+b, 0);
            map.forEach((v,k) => ret[k] = v/sum);
        }
        let rand = Math.random();
        let event;
        for (let key in ret) {
            if (rand < ret[key]) {
                event = key;
                break;
            }
            rand -= ret[key];
        }
        return event;
    }
    reset() {
        this.battleStopped = false;
    }
    stopBattle() {
        this.battleStopped = true;
    }
    eat() {
        let status = "ok";
        let { warriors, food } = this;        
        food -= this.foodNeeds;
        if (food < 0) {
            status = "death";
            food = 0;
            this.warriors = Math.ceil(warriors * DarkTowerSettings.multiplier.get("starve"));
        }
        else if (!this.canEat) {
            status = "warning";
        }
        this.food = food;
        return { status };
    }
    get canEat() {
        return this.food >= this.foodNeeds * 4;
    }
    get foodNeeds() {
        let toEat;
        const { warriors } = this;
        DarkTowerSettings.eat.forEach((v,k) => {
            if (warriors >= k[0] && warriors <= k[1]) toEat = v;
        });
        return toEat;
    }

    get carry() {
        return Math.min(
            DarkTowerSettings.carryMax.get("gold"), 
            this.inventory.get("warriors") * 6 + (this.inventory.get("beast")?50:0)
        );
    }

    get difficulty() {
        let index;
        if (this.goldKey) index = "goldKey";
        else if (this.silverKey) index = "silverKey";
        else if (this.brassKey) index = "brassKey";
        else index = "noKey";
        return DarkTowerSettings.difficulty.get(index);
    }

    get move() {
        this.location = "move";
        let event = this.event("move");
        this.chance_move.forEach((v,k) => {
            if (k === event) switch (k) {
                case "safe": this.chance_move.set("safe", 0.5); break;
                case "battle": this.chance_move.set("battle", 0.75); break;
                case "lost": this.chance_move.set("lost", 0.01); break;
                case "dragon":
                case "plague":
                case "cursed": this.chance_move.set(k, 0); break;
            }
            else switch (k) {
                case "safe":
                case "battle": this.chance_move.set(k, this.chance_move.get(k) + 0.25); break;
                case "lost": this.chance_move.set(k, this.chance_move.get(k) + 0.1); break;
                case "plague": this.chance_move.set(k, this.chance_move.get(k) + 0.05); break; 
                case "dragon": 
                    if (this.chance_move.get(k) > 0) { //once per region
                        this.chance_move.set(k, this.chance_move.get(k) + 0.05);
                        break;
                    }
                case "cursed": 
                    if (this.chance_move.get(k) > 0) { //once per region
                        this.chance_move.set(k, this.chance_move.get(k) + 0.01);
                        break;
                    }
            }
        });
        switch (event) {
            case "lost": if (this.scout) event += "_scout"; break;
            case "plague": if (this.healer) {
                    event += "_healer";
                    this.warriors = this.warriors + Math.floor(Math.random() * 5) + 2;
                }
                else {
                    this.warriors = Math.ceil(this.warriors/2);
                }    
                break;
            case "dragon": if (this.sword) {
                    this.inventory.set("sword", false);
                    event += "_sword";
                }
                else {
                    this.gold = Math.floor(this.gold/2);
                    this.warriors = Math.ceil(this.warriors/2);
                }
                break;
            case "cursed": if (this.wizard) {
                    this.inventory.set("wizard", false);
                    event += "_wizard";
                }
                else {
                    this.gold = Math.floor(this.gold/2);
                    this.warriors = Math.ceil(this.warriors/2);
                }
                break;
        }
        return event;
    }
    get tomb() {
        this.location = "tomb";
        const event = this.event("tomb");
        this.chance_tomb.forEach((v,k) => {
            if (k === event) this.chance_tomb.set(k, 0.1);
            else switch (k) {
                case "empty": this.chance_tomb.set(k, v + 0.5); break;
                case "empty_treasure": this.chance_tomb.set(k, v + 0.25); break;
                case "battle": this.chance_tomb.set(k, v + 1); break;
            }
        });
        return event;
    }
    get treasure() {
        const nothing_chance = this.chance_treasure.get("nothing");
        if (this.location !== "tomb") this.chance_treasure.set("nothing", 0); //dragon has loot!
        const event = this.event("treasure");
        this.chance_treasure.forEach((v,k) => {
            if (k === event) switch(k) {
                case "nothing": this.chance_treasure.set(k, 0.25); break;
                case "key":
                case "sword":
                case "wizard":
                case "pegasus": this.chance_treasure.set(k, 0); break;
            }
            else switch(k) {
                case "nothing": this.chance_treasure.set(k, this.chance_treasure.get(k) + 0.5); break;
                case "key": if (this.chance_treasure.get(k) > 0) {
                        this.chance_treasure.set(k, this.chance_treasure.get(k) + 1);
                        break;
                    }
                case "sword":
                case "wizard":
                case "pegasus": if (this.chance_treasure.get(k) > 0) {
                        this.chance_treasure.set(k, this.chance_treasure.get(k) + 0.25);
                        break;
                    }
            }
        });
        switch (event) {
            case "key":
                switch (this.#frontier) {
                    case 1: this.brassKey = true; break;
                    case 2: this.silverKey = true; break;
                    case 3: this.goldKey = true; break;
                }
            case "sword":
            case "wizard":
            case "pegasus": this[event] = true;
        }
        if (this.location !== "tomb") this.chance_treasure.set("nothing", nothing_chance);
        return event;
    }
    get bazaar() {
        this.location = "bazaar";
    }
    get sanctuary() {
        if (this.#frontier === 4 && this.brassKey && this.silverKey && this.goldKey && !this.location === "sanctuary") {
            //home citadel, all keys
            const warriors = this.warriors;
            if (warriors >= 5 && warriors <= 24) this.warriors = warriors * 2;
        }
        this.location = "sanctuary";
        if (this.warriors <= 4) this.warriors = this.warriors + Math.floor(Math.random() * 6) + 1;
        if (this.food <= 5) this.food = this.food + Math.floor(Math.random() * 6) + 4;
        if (this.gold <= 7) this.gold = this.gold + Math.floor(Math.random() * 10) + 5;
    }
    get frontier() { 
        switch (this.#frontier) {
            case 1: if (!this.brassKey) return "noKey"; break;
            case 2: if (!this.silverKey) return "noKey"; break;
            case 3: if (!this.goldKey) return "noKey"; break;
            case 4: return "noKey";
        };
        this.location = "frontier";
        this.#frontier++;
        if (this.#frontier < 4) this.chance_treasure.set("key", 2);
        ["sword", "wizard", "pegasus"].forEach(i => {
            if (!this[i]) {
                this.chance_treasure.set(i, this.chance_treasure.get(i) + 0.25);
            }
        });
        this.chance_move.set("dragon", this.chance_move.get("dragon") + 0.05);
        this.chance_move.set("plague", this.chance_move.get("plague") + 0.1);
        this.chance_move.set("cursed", this.chance_move.get("cursed") + 0.01);
        this.chance_move.set("lost", this.chance_move.get("lost") + 0.2);
    }
    get darkTower() {
        if (!this.brassKey || !this.silverKey || !this.goldKey) return "noKey";
        this.location = "darkTower";
    }

    get warriors() { return this.inventory.get("warriors"); }
    set warriors(w) {
        this.inventory.set("warriors", Math.min(
            DarkTowerSettings.carryMax.get("warriors"),
            Math.max(1, w)
        ));
        this.gold = Math.min(this.carry, this.gold);
    }

    get gold() { return this.inventory.get("gold"); }
    set gold(g) { this.inventory.set("gold", Math.max(0, Math.min(this.carry, Math.max(0, g)))); }

    get food() { return this.inventory.get("food"); }
    set food(f) { this.inventory.set("food", Math.min(
        DarkTowerSettings.carryMax.get("food"),
        Math.max(0, f)
    )); }

    get beast() { return this.inventory.get("beast"); }
    set beast(b) { this.inventory.set("beast", b); }

    get scout() { return this.inventory.get("scout"); }
    set scout(b) { this.inventory.set("scout", b); }

    get healer() { return this.inventory.get("healer"); }
    set healer(b) { this.inventory.set("healer", b); }

    get sword() { return this.inventory.get("sword"); }
    set sword(b) { this.inventory.set("sword", b); }

    get wizard() { return this.inventory.get("wizard"); }
    set wizard(b) { this.inventory.set("wizard", b); }

    get brassKey() { return this.inventory.get("brassKey"); }
    set brassKey(b) { this.inventory.set("brassKey", b); }

    get silverKey() { return this.inventory.get("silverKey"); }
    set silverKey(b) { this.inventory.set("silverKey", b); }

    get goldKey() { return this.inventory.get("goldKey"); }
    set goldKey(b) { this.inventory.set("goldKey", b); }
}
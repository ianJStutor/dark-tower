import DarkTowerSettings from "./darkTowerSettings.js";

export default class DarkTowerPlayer {
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
            ["treasure", 0]
        ]);
        this.chance_treasure = new Map([
            ["nothing", 1],
            ["key", 0],
            ["sword", 0],
            ["wizard", 0],
            ["pegasus", 0]
        ]);
        this.frontier = 0;
        this.turnState = [];
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

    get warriors() { return this.inventory.get("warriors"); }
    set warriors(w) {
        this.inventory.set("warriors", Math.min(
            DarkTowerSettings.carryMax.get("warriors"),
            Math.max(1, w)
        ));
        const { carry, gold } = this;
        this.inventory.set("gold", Math.min(carry, gold));
    }

    get gold() { return this.inventory.get("gold"); }
    set gold(g) { this.inventory.set("gold", Math.min(this.carry, Math.max(0, g))); }

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
export default class DarkTowerSettings {

    static start = new Map([
        ["warriors", 10],
        ["food", 26], //includes the first one "eaten" at start of game
        ["gold", 30]
    ]);

    static carryMax = new Map([
        ["warriors", 99],
        ["food", 99],
        ["gold", 99]
    ]);

    static eat = new Map([
        [[1,15], 1],
        [[16,30], 2],
        [[31,45], 3],
        [[46,60], 4],
        [[61,75], 5],
        [[76,90], 6],
        [[91,99], 7]
    ]);

    static price = new Map([
        ["warriors", { min: 4, max: 10 }],
        ["food", { min: 1, max: 1 }],
        ["beast", { min: 15, max: 20 }],
        ["scout", { min: 15, max: 20 }],
        ["healer", { min: 15, max: 20 }]
    ]);

    static brigands = new Map([
        ["move", { min: 5, max: 15}],
        ["tomb", { min: 15, max: 30}],
        ["darkTower", { min: 30, max: 50}]
    ]);

    static gold = new Map([
        ["move", { min: 15, max: 30 }],
        ["tomb", { min: 25, max: 40 }],
        ["dragon", { min: 30, max: 50 }]
    ]);

    static multiplier = new Map([
        ["starve", 0.85],
        ["plague", 0.75],
        ["dragon", 0.5],
        ["cursed", 0.5]
    ]);
}

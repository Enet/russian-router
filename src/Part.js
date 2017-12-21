export default class Part {
    constructor (rawValue) {
        this._value = ((rawValue || '') + '') || null;
    }

    isEmpty () {
        return this._value === null;
    }

    isCaseSensitive () {
        return true;
    }

    toString () {
        const rawValue = (this._value || '') + '';
        return rawValue;
    }

    toLowerCase (condition) {
        if (!condition) {
            return this;
        }
        if (this.isEmpty()) {
            return this;
        }
        const PartConstructor = this.constructor;
        return new PartConstructor(this._value.toLowerCase());
    }

    static isEqual (part1, part2) {
        part1 = part1.toString().toLowerCase();
        part2 = part2.toString().toLowerCase();
        return part1 === part2;
    }
}

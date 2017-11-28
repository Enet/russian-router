export default class Part {
    constructor (rawValue) {
        this._value = ((rawValue || '') + '') || null;
    }

    isEmpty () {
        return this._value === null;
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
}

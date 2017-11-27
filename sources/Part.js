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
        if (!condition || !this._value) {
            return this;
        }
        const Constructor = this.constructor;
        return new Constructor(this._value.toLowerCase());
    }
}

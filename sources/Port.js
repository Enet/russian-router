import Part from './Part.js';

export default class Port extends Part {
    constructor (rawPort) {
        super(rawPort);
        this._value = +rawPort || null;
    }

    toLowerCase () {
        return this;
    }
}

import Part from './Part.js';

export default class QueryComponent extends Part {
    constructor (rawValue) {
        rawValue = decodeURIComponent(rawValue);
        super(rawValue);
        this._value = isEmpty(rawValue) ? null : this._value || '';
    }

    toString () {
        return encodeURIComponent(super.toString());
    }
}

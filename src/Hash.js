import {
    isEmpty
} from './utils.js';
import Part from './Part.js';

export default class Hash extends Part {
    constructor (rawValue) {
        super(decodeURIComponent(rawValue));
        this._isEmpty = isEmpty(rawValue);
    }

    isEmpty () {
        return this._isEmpty;
    }

    toString () {
        return encodeURIComponent(super.toString());
    }

    toLowerCase (condition) {
        if (this._value === null) {
            return this;
        }
        return super.toLowerCase(condition);
    }
}

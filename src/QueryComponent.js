import {
    isEmpty
} from './utils.js';
import Part from './Part.js';

export default class QueryComponent extends Part {
    constructor (rawValue) {
        super(rawValue);
        this._isEmpty = isEmpty(rawValue);
    }

    isEmpty () {
        return this._isEmpty;
    }

    toLowerCase (condition) {
        if (this._value === null) {
            return this;
        }
        return super.toLowerCase(condition);
    }
}

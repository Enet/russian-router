import {
    isEmpty
} from './utils.js';
import Part from './Part.js';

export default class PathComponent extends Part {
    constructor (rawValue) {
        super(rawValue);
        this._value = isEmpty(rawValue) ? null : this._value || '';
    }

    toString () {
        if (this.isEmpty()) {
            return null;
        }
        return super.toString();
    }
}

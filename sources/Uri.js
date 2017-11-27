import {
    splitUri,
    getRegExp,
    forEachPartName,
    getPartClass
} from './utils.js';
import Protocol from './Protocol.js';
import Domain from './Domain.js';
import Port from './Port.js';
import Path from './Path.js';
import Query from './Query.js';
import Hash from './Hash.js';

export default class Uri {
    constructor (rawUri) {
        const splittedUri = splitUri(rawUri, this.getRegExp(), this.getName());
        const parsedUri = {};
        forEachPartName((partName) => {
            const Constructor = getPartClass(partName);
            parsedUri[partName] = new Constructor(splittedUri[partName]);
        });
        this._value = {
            rawUri,
            splittedUri,
            parsedUri
        };
    }

    getRawUri () {
        return this._value.rawUri;
    }

    getSplittedUri (partName) {
        if (partName) {
            return this._value.splittedUri[partName];
        }
        return this._value.splittedUri;
    }

    getParsedUri (partName) {
        if (partName) {
            return this._value.parsedUri[partName];
        }
        return this._value.parsedUri;
    }

    getName () {
        return 'URI';
    }

    getRegExp () {
        return getRegExp('uri');
    }
}

import {
    splitUri,
    forEachPartName,
    getRegExp,
    getPartConstructor
} from './utils.js';
import RouterError from './RouterError.js';

export default class Uri {
    constructor (rawUri) {
        let splittedUri;
        try {
            splittedUri = splitUri(rawUri, this._getRegExp());
        } catch(error) {
            this._handleError(error);
        }

        const parsedUri = {};
        forEachPartName((partName) => {
            const PartConstructor = getPartConstructor(partName);
            parsedUri[partName] = new PartConstructor(splittedUri[partName]);
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

    _getRegExp () {
        return getRegExp('uri');
    }

    _handleError (error) {
        throw new RouterError(RouterError[error.code], {
            entity: 'URI'
        });
    }
}

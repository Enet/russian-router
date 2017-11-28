import RouterError from './RouterError.js';

const defaultOptions = {
    caseSensitive: false,
    trailingSlashSensitive: false,
    dataConsistency: true
};

export default class Options {
    constructor (rawOptions, fallbackOptions, errorData) {
        fallbackOptions = fallbackOptions || defaultOptions;
        rawOptions = rawOptions || {};
        if (typeof rawOptions !== 'object') {
            this._handleTypeError(errorData);
        }

        for (let d in defaultOptions) {
            this[d] = Options.calculateBooleanOption(rawOptions, fallbackOptions, d);
        }
    }

    _checkRawOptions (rawOptions) {
    }

    _handleTypeError (errorData) {
        throw new RouterError(RouterError.INVALID_INPUT_TYPE, Object.assign({
            entity: 'options',
            type: 'plain object'
        }, errorData));
    }

    static calculateBooleanOption (rawOptions, fallbackOptions, optionName) {
        if (!rawOptions.hasOwnProperty(optionName)) {
            rawOptions = fallbackOptions;
        }
        return !!rawOptions[optionName];
    }
}

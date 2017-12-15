import RouterError from './RouterError.js';

const baseDefaultOptions = {
    caseSensitive: false,
    trailingSlashSensitive: false,
    dataConsistency: true
};

export default class Options {
    constructor (rawOptions, errorData) {
        rawOptions = rawOptions || {};
        if (typeof rawOptions !== 'object') {
            this._handleTypeError(errorData);
        }

        for (let b in baseDefaultOptions) {
            Options.setBooleanOption(this, b, rawOptions, this._getDefaultOptions(), true);
        }
    }

    _getDefaultOptions () {
        return baseDefaultOptions;
    }

    _handleTypeError (errorData) {
        throw new RouterError(RouterError.INVALID_INPUT_TYPE, Object.assign({
            entity: 'options',
            type: 'plain object'
        }, errorData));
    }

    static setBooleanOption (object, optionName, rawOptions, fallbackOptions) {
        if (!rawOptions.hasOwnProperty(optionName)) {
            rawOptions = fallbackOptions;
        }
        if (rawOptions.hasOwnProperty(optionName)) {
            object[optionName] = !!rawOptions[optionName];
        }
    }
}

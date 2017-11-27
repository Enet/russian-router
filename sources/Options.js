export default class Options {
    constructor (rawOptions, defaultOptions) {
        rawOptions = rawOptions || {};
        if (typeof rawOptions !== 'object') {
            throw 'Options should be presented by plain object!';
        }
    }

    static calculateBooleanOption (rawOptions, defaultOptions, optionName) {
        if (!rawOptions.hasOwnProperty(optionName)) {
            rawOptions = defaultOptions;
        }
        return !!rawOptions[optionName];
    }
}

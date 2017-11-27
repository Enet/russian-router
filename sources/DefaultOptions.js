import Options from './Options.js';

export default class DefaultOptions extends Options {
    constructor (rawOptions, defaultOptions) {
        defaultOptions = defaultOptions || {dataConsistency: true};
        super(rawOptions, defaultOptions);

        this.caseSensitive = DefaultOptions.calculateBooleanOption(rawOptions, defaultOptions, 'caseSensitive');
        this.trailingSlashSensitive = DefaultOptions.calculateBooleanOption(rawOptions, defaultOptions, 'trailingSlashSensitive');
        this.dataConsistency = DefaultOptions.calculateBooleanOption(rawOptions, defaultOptions, 'dataConsistency');
    }
}

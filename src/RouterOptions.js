import Options from './Options.js';

export default class RouterOptions extends Options {
    constructor (rawOptions) {
        super(rawOptions);

        let processMatchObjects;
        if (typeof rawOptions.processMatchObjects === 'function') {
            processMatchObjects = rawOptions.processMatchObjects;
        } else if (!rawOptions.hasOwnProperty('processMatchObjects') || rawOptions.processMatchObjects) {
            processMatchObjects = RouterOptions.sortMatchObjects;
        } else {
            processMatchObjects = (matchObjects) => matchObjects;
        }

        this.processMatchObjects = processMatchObjects;
        RouterOptions.setBooleanOption(this, 'onlyRoute', rawOptions, {onlyRoute: false});
    }

    static sortMatchObjects (matchObjects) {
        return matchObjects.sort((matchObject1, matchObject2) => {
            return matchObject2.options.priority - matchObject1.options.priority;
        });
    }
}

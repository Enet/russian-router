import Options from './Options.js';
import RouterError from './RouterError.js';

export default class RouterOptions extends Options {
    constructor (rawOptions, contextOptions) {
        super(rawOptions);

        let processMatchObjects;
        if (typeof rawOptions.processMatchObjects === 'function') {
            processMatchObjects = rawOptions.processMatchObjects;
        } else if (!rawOptions.hasOwnProperty('processMatchObjects') || rawOptions.processMatchObjects) {
            processMatchObjects = RouterOptions.sortMatchObjects;
        } else {
            processMatchObjects = (matchObjects) => matchObjects;
        }

        contextOptions = contextOptions || {};
        let getDefaultPart = contextOptions.getDefaultPart;
        if (typeof getDefaultPart !== 'function') {
            throw new RouterError(RouterError.INVALID_DEFAULT_GETTER);
        }

        this.processMatchObjects = processMatchObjects;
        this.getDefaultPart = getDefaultPart;
        this.onlyRoute = RouterOptions.calculateBooleanOption(rawOptions, {onlyRoute: false}, 'onlyRoute');
    }

    static sortMatchObjects (matchObjects) {
        return matchObjects.sort((matchObject1, matchObject2) => {
            return matchObject2.options.priority - matchObject1.options.priority;
        });
    }
}

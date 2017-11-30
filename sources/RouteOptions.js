import Options from './Options.js';
import RouterError from './RouterError.js';

const defaultOptions = {
    canBeMatched: true,
    canBeGenerated: true
};

export default class RouteOptions extends Options {
    constructor (rawOptions, fallbackOptions, routeName) {
        super(rawOptions, fallbackOptions, routeName);

        this.canBeMatched = RouteOptions.calculateBooleanOption(rawOptions, defaultOptions, 'canBeMatched');
        this.canBeGenerated = RouteOptions.calculateBooleanOption(rawOptions, defaultOptions, 'canBeGenerated');
        this.routeName = routeName;
        this.priority = +rawOptions.priority || 0;
    }

    _handleTypeError (routeName) {
        super._handleTypeError({
            entity: 'route\'s options',
            routeName
        });
    }
}

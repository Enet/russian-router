import Options from './Options.js';
import RouterError from './RouterError.js';

export default class RouteOptions extends Options {
    constructor (rawOptions, fallbackOptions, routeName) {
        super(rawOptions, fallbackOptions, routeName);
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

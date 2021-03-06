import Options from './Options.js';

const routeDefaultOptions = {
    canBeMatched: true,
    canBeGenerated: true
};

export default class RouteOptions extends Options {
    constructor (rawOptions, routeName) {
        super(rawOptions, {
            entity: 'route\'s options',
            routeName
        });

        RouteOptions.setBooleanOption(this, 'canBeMatched', rawOptions, routeDefaultOptions);
        RouteOptions.setBooleanOption(this, 'canBeGenerated', rawOptions, routeDefaultOptions);
        this.routeName = routeName;
        this.priority = +rawOptions.priority || 0;
    }

    _getDefaultOptions () {
        return routeDefaultOptions;
    }
}

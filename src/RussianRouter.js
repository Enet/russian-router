import {
    getDefaultPart
} from './utils.js';
import RouterOptions from './RouterOptions.js';
import Route from './Route.js';
import UserUri from './UserUri.js';
import RouterError from './RouterError.js';

export default class RussianRouter {
    constructor (rawRoutes={}, rawOptions={}) {
        this._parsedOptions = this._parseOptions(rawOptions);
        this._parsedRoutes = this._parseRoutes(rawRoutes);
    }

    destructor () {

    }

    generateUri (routeName, userParams={}, parsedRoutes=this._parsedRoutes) {
        const parsedRoute = parsedRoutes[routeName];
        if (!parsedRoute || !parsedRoute.canBeGenerated()) {
            throw new RouterError(RouterError.INVALID_ROUTE_NAME, {
                desiredRouteName: routeName
            });
        }
        return parsedRoute.generateUri(userParams);
    }

    matchUri (rawUri, parsedRoutes=this._parsedRoutes) {
        const parsedOptions = this._parsedOptions;
        const matchObjects = [];
        const userUri = new UserUri(rawUri, this.getDefaultPart);
        for (let p in parsedRoutes) {
            const parsedRoute = parsedRoutes[p];
            if (!parsedRoute.canBeMatched()) {
                continue;
            }
            const matchObject = parsedRoute.matchUri(userUri);
            if (matchObject) {
                matchObjects.push(matchObject);
                if (parsedOptions.onlyRoute) {
                    break;
                }
            }
        }
        return parsedOptions.processMatchObjects(matchObjects);
    }

    getDefaultPart () {
        return getDefaultPart.call(this, ...arguments);
    }

    getParsedRoutes () {
        return this._parsedRoutes;
    }

    getParsedOptions () {
        return this._parsedOptions;
    }

    _parseOptions (rawOptions) {
        const {getDefaultPart} = this;
        const contextOptions = {getDefaultPart};
        return new RouterOptions(rawOptions, contextOptions);
    }

    _parseRoutes (rawRoutes) {
        const parsedRoutes = {};
        const fallbackOptions = this._parsedOptions;
        for (let routeName in rawRoutes) {
            parsedRoutes[routeName] = new Route(routeName, rawRoutes[routeName], fallbackOptions);
        }
        return parsedRoutes;
    }
}
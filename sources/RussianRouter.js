import RouterOptions from './RouterOptions.js';
import Route from './Route.js';
import UserUri from './UserUri.js';

export default class RussianRouter {
    constructor (rawRoutes={}, rawOptions={}) {
        this._parsedOptions = this._parseOptions(rawOptions);
        this._parsedRoutes = this._parseRoutes(rawRoutes);
    }

    destructor () {

    }

    generateUri (routeName, userParams={}, parsedRoutes=this._parsedRoutes) {
        const parsedRoute = parsedRoutes[routeName];
        if (!parsedRoute) {
            throw 'Invalid route name is specified for URI generation!';
        }
        return parsedRoute.generateUri(userParams);
    }

    matchUri (rawUri, parsedRoutes=this._parsedRoutes) {
        const parsedOptions = this._parsedOptions;
        const matchObjects = [];
        const userUri = new UserUri(rawUri);
        for (let p in parsedRoutes) {
            const parsedRoute = parsedRoutes[p];
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

    _parseOptions (rawOptions) {
        return new RouterOptions(rawOptions);
    }

    _parseRoutes (rawRoutes) {
        const parsedRoutes = {};
        const defaultOptions = this._parsedOptions;
        for (let routeName in rawRoutes) {
            parsedRoutes[routeName] = new Route(routeName, rawRoutes[routeName], defaultOptions);
        }
        return parsedRoutes;
    }
}

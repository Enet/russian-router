import {
    getDefaultPart
} from './utils.js';
import RouterOptions from './RouterOptions.js';
import Route from './Route.js';
import UserUri from './UserUri.js';
import RouterError from './RouterError.js';

export default class RussianRouter {
    constructor (rawRoutes={}, rawOptions={}) {
        if (typeof this.getDefaultPart !== 'function') {
            throw new RouterError(RouterError.INVALID_DEFAULT_GETTER);
        }

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
        const contextOptions = {router: this};
        return parsedRoute.generateUri(userParams, contextOptions);
    }

    matchUri (rawUri, parsedRoutes=this._parsedRoutes) {
        const parsedOptions = this._parsedOptions;
        const matchObjects = [];
        const userUri = new UserUri(rawUri, {router: this});
        for (let p in parsedRoutes) {
            const contextOptions = {router: this};
            const parsedRoute = parsedRoutes[p];
            if (!parsedRoute.canBeMatched()) {
                continue;
            }
            const matchObject = parsedRoute.matchUri(userUri, contextOptions);
            if (matchObject) {
                matchObjects.push(matchObject);
                if (parsedOptions.onlyRoute) {
                    break;
                }
            }
        }
        return parsedOptions.processMatchObjects(matchObjects);
    }

    resolveUri (rawUri) {
        return rawUri;
    }

    getDefaultPart () {
        const workAroundSolutionForBabelBug = getDefaultPart;
        return workAroundSolutionForBabelBug.call(this, ...arguments);
    }

    getParsedRoutes () {
        return this._parsedRoutes;
    }

    getParsedOptions () {
        return this._parsedOptions;
    }

    _parseOptions (rawOptions) {
        return new RouterOptions(rawOptions);
    }

    _parseRoutes (rawRoutes) {
        const parsedRoutes = {};
        for (let routeName in rawRoutes) {
            parsedRoutes[routeName] = new Route(routeName, rawRoutes[routeName]);
        }
        return parsedRoutes;
    }
}

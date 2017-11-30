import {
    joinUri,
    forEachPartName,
    chooseTemplate
} from './utils.js';
import RouteOptions from './RouteOptions.js';
import RouteParams from './RouteParams.js';
import TemplateUri from './TemplateUri.js';
import UserUri from './UserUri.js';
import RouterError from './RouterError.js';

export default class Route {
    constructor (routeName, rawRoute, fallbackOptions={}) {
        const rawRouteParams = rawRoute.params || {};
        const rawRouteOptions = rawRoute.options || {};
        const rawRouteUri = rawRoute.uri || '';

        if (typeof rawRouteParams !== 'object') {
            throw new RouterError(RouterError.INVALID_INPUT_TYPE, {
                entity: 'route\'s params',
                type: 'object',
                routeName
            });
        }
        if (typeof rawRouteOptions !== 'object') {
            throw new RouterError(RouterError.INVALID_INPUT_TYPE, {
                entity: 'route\'s options',
                type: 'object',
                routeName
            });
        }
        if (typeof rawRouteUri !== 'string') {
            throw new RouterError(RouterError.INVALID_INPUT_TYPE, {
                entity: 'route\'s URI template',
                type: 'string',
                routeName
            });
        }

        this.name = routeName;
        const templateUri = new TemplateUri(rawRouteUri);
        const parsedOptions = new RouteOptions(rawRouteOptions, fallbackOptions, routeName);
        const parsedParams = new RouteParams(rawRouteParams);
        const parsedTemplate = {};
        forEachPartName((partName) => {
            const Template = chooseTemplate(templateUri, partName);
            parsedTemplate[partName] = new Template(partName, templateUri, parsedOptions, parsedParams);
        });

        this._templateUri = templateUri;
        this._parsedOptions = parsedOptions;
        this._parsedParams = parsedParams;
        this._parsedTemplate = parsedTemplate;
    }

    matchUri (userUri) {
        const parsedTemplate = this._parsedTemplate;
        const matchObject = {};
        const params = {};
        for (let p in parsedTemplate) {
            const matchFragment = parsedTemplate[p].matchParsedValue(userUri);
            if (!matchFragment) {
                return null;
            }
            matchObject[p] = matchFragment.value;
            Object.assign(params, matchFragment.params);
        }
        matchObject.name = this.name;
        matchObject.params = params;
        matchObject.options = Object.assign({}, this._parsedOptions);
        delete matchObject.options.routeName;
        delete matchObject.options.getDefaultPart;
        return matchObject;
    }

    generateUri (userParams) {
        const parsedTemplate = this._parsedTemplate;
        const parsedUri = {};
        for (let p in parsedTemplate) {
            parsedUri[p] = parsedTemplate[p].generateParsedValue(userParams, parsedUri);
        }

        const routeName = this.name;
        const parsedOptions = this._parsedOptions;
        const {getDefaultPart} = parsedOptions;
        let rawUri;
        try {
            rawUri = joinUri(parsedUri, getDefaultPart);
        } catch (error) {
            throw new RouterError(RouterError[error.code], {routeName});
        }

        if (parsedOptions.dataConsistency && !this.matchUri(new UserUri(rawUri, getDefaultPart))) {
            throw new RouterError(RouterError.INCONSISTENT_DATA, {routeName});
        }

        return rawUri;
    }

    canBeMatched () {
        const parsedOptions = this._parsedOptions;
        return parsedOptions.canBeMatched;
    }

    canBeGenerated () {
        const parsedOptions = this._parsedOptions;
        return parsedOptions.canBeGenerated;
    }
}

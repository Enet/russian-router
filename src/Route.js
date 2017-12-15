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

const metaDataProperties = ['payload', 'key', 'data'];

export default class Route {
    constructor (routeName, rawRoute) {
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
        const parsedOptions = new RouteOptions(rawRouteOptions, routeName);
        const parsedParams = new RouteParams(rawRouteParams);
        const parsedTemplate = {};
        forEachPartName((partName) => {
            const Template = chooseTemplate(templateUri, partName);
            parsedTemplate[partName] = new Template(templateUri, parsedParams, routeName);
        });
        const parsedMetaData = {};
        for (let metaDataProperty of metaDataProperties) {
            parsedMetaData[metaDataProperty] = rawRoute[metaDataProperty];
        }

        this._templateUri = templateUri;
        this._parsedOptions = parsedOptions;
        this._parsedParams = parsedParams;
        this._parsedTemplate = parsedTemplate;
        this._parsedMetaData = parsedMetaData;
    }

    matchUri (userUri, contextOptions) {
        const routeName = this.name;
        const parsedTemplate = this._parsedTemplate;
        const matchObject = {};
        const params = {};
        const options = Object.assign(
            {},
            contextOptions.router.getParsedOptions(),
            this._parsedOptions
        );
        Object.assign(contextOptions, options);

        for (let p in parsedTemplate) {
            contextOptions.partName = p;
            const matchFragment = parsedTemplate[p].matchParsedValue(userUri, contextOptions);
            if (!matchFragment) {
                return null;
            }
            matchObject[p] = matchFragment.value;
            Object.assign(params, matchFragment.params);
        }

        delete options.routeName;
        Object.assign(matchObject, this._parsedMetaData, {
            name: routeName,
            params,
            options
        });
        return matchObject;
    }

    generateUri (userParams, contextOptions) {
        const routeName = this.name;
        const parsedTemplate = this._parsedTemplate;
        const generatingUri = {};
        Object.assign(
            contextOptions,
            contextOptions.router.getParsedOptions(),
            this._parsedOptions,
            {generatingUri, routeName}
        );
        for (let p in parsedTemplate) {
            contextOptions.partName = p;
            generatingUri[p] = parsedTemplate[p].generateParsedValue(userParams, contextOptions);
        }

        let rawUri;
        try {
            rawUri = joinUri(generatingUri, contextOptions);
        } catch (error) {
            throw new RouterError(RouterError[error.code], {routeName});
        }

        if (contextOptions.dataConsistency) {
            const userUri = new UserUri(contextOptions.router.resolveUri(rawUri), contextOptions);
            if (!this.matchUri(userUri, {router: contextOptions.router})) {
                throw new RouterError(RouterError.INCONSISTENT_DATA, {routeName});
            }
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

    getParsedOptions () {
        return this._parsedOptions;
    }
}

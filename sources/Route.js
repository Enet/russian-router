import {
    joinUri,
    forEachPartName,
    chooseTemplate,
    mergeParams
} from './utils.js';
import RouteOptions from './RouteOptions.js';
import RouteParams from './RouteParams.js';
import TemplateUri from './TemplateUri.js';

export default class Route {
    constructor (routeName, rawRoute, defaultOptions={}) {
        const rawRouteParams = rawRoute.params || {};
        const rawRouteOptions = rawRoute.options || {};
        const rawRouteUri = rawRoute.uri || '';

        if (typeof rawRouteParams !== 'object') {
            throw 'Route params should be presented by object! Check ' + routeName + ' route.';
        }
        if (typeof rawRouteOptions !== 'object') {
            throw 'Route options should be presented by object! Check ' + routeName + ' route.';
        }
        if (typeof rawRouteUri !== 'string') {
            throw 'Route template should be presented by string! Check ' + routeName + ' route.';
        }

        this.name = routeName;
        const parsedOptions = this._parsedOptions = new RouteOptions(rawRouteOptions, defaultOptions);
        const parsedParams = this._parsedParams = new RouteParams(rawRouteParams);
        const templateUri = this._templateUri = new TemplateUri(rawRouteUri);
        const parsedTemplate = {};
        forEachPartName((partName) => {
            const Template = chooseTemplate(templateUri, partName);
            parsedTemplate[partName] = new Template(templateUri, parsedParams, parsedOptions, partName);
        });
        this._parsedTemplate = parsedTemplate;
    }

    matchUri (userUri) {
        const parsedTemplate = this._parsedTemplate;
        const protocolMatchObject = parsedTemplate.protocol.matchParsedValue(userUri);
        if (!protocolMatchObject) {
            return null;
        }
        const domainMatchObject = parsedTemplate.domain.matchParsedValue(userUri);
        if (!domainMatchObject) {
            return null;
        }
        const portMatchObject = parsedTemplate.port.matchParsedValue(userUri);
        if (!portMatchObject) {
            return null;
        }
        const pathMatchObject = parsedTemplate.path.matchParsedValue(userUri);
        if (!pathMatchObject) {
            return null;
        }
        const queryMatchObject = parsedTemplate.query.matchParsedValue(userUri);
        if (!queryMatchObject) {
            return null;
        }
        const hashMatchObject = parsedTemplate.hash.matchParsedValue(userUri);
        if (!hashMatchObject) {
            return null;
        }

        const matchObject = {
            name: this.name,
            protocol: protocolMatchObject.value,
            domain: domainMatchObject.value,
            port: portMatchObject.value,
            path: pathMatchObject.value,
            query: queryMatchObject.value,
            hash: hashMatchObject.value,
            params: mergeParams(
                protocolMatchObject,
                domainMatchObject,
                portMatchObject,
                pathMatchObject,
                queryMatchObject,
                hashMatchObject
            )
        };
        return matchObject;
    }

    generateUri (userParams) {
        const parsedTemplate = this._parsedTemplate;
        const parsedUri = {};
        for (let p in parsedTemplate) {
            parsedUri[p] = parsedTemplate[p].generateParsedValue(userParams);
        }

        const rawUri = joinUri(parsedUri);
        if (this._parsedOptions.dataConsistency && !this.matchUri(rawUri)) {
            throw 'Data is inconsistence for route ' + this.name + '!';
        }
        return rawUri;
    }
}

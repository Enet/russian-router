import Utils from 'Utils.js';
import {
    urlRegExp,
    templateRegExp,
    queryKeyValueRegExp,
    paramRegExp
} from './regExpStorage.js';

export default class RussianRouter {
    constructor (rawRoutes={}, rawOptions={}) {
        this.init();
        this._parsedOptions = this.parseOptions(rawOptions);
        this._parsedRoutes = this.parseRoutes(rawRoutes);
    }

    destructor () {

    }

    init (Utils=this.constructor.Utils) {
        this.Utils = Utils;
        this.parseProtocolTemplate = Utils.createTemplateParser(Utils.protocolParserOptions);
        this.parseDomainTemplate = Utils.createTemplateParser(Utils.domainParserOptions);
        this.parsePortTemplate = Utils.createTemplateParser(Utils.portParserOptions);
        this.parsePathTemplate = Utils.createTemplateParser(Utils.pathParserOptions);
        this.parseQueryTemplate = Utils.createTemplateParser(Utils.queryParserOptions);
        this.parseHashTemplate = Utils.createTemplateParser(Utils.hashParserOptions);
    }



    parseOptions (rawOptions={}) {
        let sortMatchedRoutes;
        if (typeof rawOptions.sortMatchedRoutes === 'function') {
            sortMatchedRoutes = rawOptions.sortMatchedRoutes;
        } else if (!rawOptions.hasOwnProperty('sortMatchedRoutes') || rawOptions.sortMatchedRoutes) {
            sortMatchedRoutes = this.sortRoutes;
        } else {
            sortMatchedRoutes = (matchedRoutes) => matchedRoutes;
        }
        return {
            caseSensitive: rawOptions.hasOwnProperty('caseSensitive') ? !!rawOptions.caseSensitive : false,
            trailingSlashSensitive: rawOptions.hasOwnProperty('trailingSlashSensitive') ? !!rawOptions.trailingSlashSensitive : false,
            dataConsistency: rawOptions.hasOwnProperty('dataConsistency') ? !!rawOptions.dataConsistency : true,
            onlyRoute: rawOptions.hasOwnProperty('onlyRoute') ? !!rawOptions.onlyRoute : false,
            sortMatchedRoutes
        };

    }

    sortRoutes (matchedRoutes) {
        return matchedRoutes.sort((matchedRoute1, matchedRoute2) => {
            return matchedRoute2.priority - matchedRoute1.priority;
        });
    }

    parseRoutes (rawRoutes) {
        const parsedRoutes = {};
        for (let routeName in rawRoutes) {
            parsedRoutes[routeName] = this.parseRoute(rawRoutes[routeName], routeName);
        }
        return parsedRoutes;
    }

    parseRoute (rawRoute={}, routeName='') {
        let {params, options} = rawRoute;
        params = params || {};
        options = Object.assign({
            caseSensitive: this._parsedOptions.caseSensitive,
            trailingSlashSensitive: this._parsedOptions.trailingSlashSensitive,
            dataConsistency: this._parsedOptions.dataConsistency
        }, options, {
            routeName
        });

        const rawTemplate = rawRoute.url;
        const parsedTemplate = this.parseTemplate(rawTemplate, params, options);
        const parsedRoute = {
            routeName,
            priority: options.priority || 0,
            options,
            template: parsedTemplate
        };
        return parsedRoute;
    }

    parseTemplate (rawTemplate='', routeParams={}, routeOptions={}) {
        const splittedTemplate = this.splitUrl(rawTemplate, templateRegExp, 'URL template');
        return {
            protocol: this.parseProtocolTemplate(splittedTemplate.protocol, routeParams, routeOptions),
            domain: this.parseDomainTemplate(splittedTemplate.domain, routeParams, routeOptions),
            port: this.parsePortTemplate(splittedTemplate.port, routeParams, routeOptions),
            path: this.parsePathTemplate(splittedTemplate.path, routeParams, routeOptions),
            query: this.parseQueryTemplate(splittedTemplate.query, routeParams, routeOptions),
            hash: this.parseHashTemplate(splittedTemplate.hash, routeParams, routeOptions)
        }
    }



    generateUrl (routeName, userParams={}, parsedRoutes=this._parsedRoutes) {
        const parsedRoute = parsedRoutes[routeName];
        if (!parsedRoute) {
            throw 'Invalid route name is specified for URL generation!';
        }
        const generatedUrl = this.joinUrl({
            parsedProtocol: parsedRoute.template.protocol.generateParsedValue(userParams),
            parsedDomain: parsedRoute.template.domain.generateParsedValue(userParams),
            parsedPort: parsedRoute.template.port.generateParsedValue(userParams),
            parsedPath: parsedRoute.template.path.generateParsedValue(userParams),
            parsedQuery: parsedRoute.template.query.generateParsedValue(userParams),
            parsedHash: parsedRoute.template.hash.generateParsedValue(userParams)
        });
        return generatedUrl;
    }

    matchUrl (url, parsedRoutes=this._parsedRoutes) {
        const splittedUrl = this.splitUrl(url);
        const matchedRoutes = [];
        for (let p in parsedRoutes) {
            const parsedRoute = parsedRoutes[p];
            if (this.compareUrl(splittedUrl, parsedRoute)) {
                matchedRoutes.push(parsedRoute);
                if (this._parsedOptions.onlyRoute) {
                    break;
                }
            }
        }
        const sortedRoutes = this._parsedOptions.sortMatchedRoutes(matchedRoutes);
        return sortedRoutes;
    }

    splitUrl (url, regExp=urlRegExp, entity='URL') {
        const match = url.match(regExp);
        if (!match) {
            throw 'Invalid ' + entity + ' cannot be splitted!';
        }
        if (match[3] && match[5][0] !== '/' && !paramRegExp.test(match[5])) {
            if (match[5]) {
                throw 'Path should be absolute when domain is specified!';
            } else {
                match[5] = '/';
            }
        }
        const protocol = match[2] ? match[2].replace(/:$/, '') : null;
        const domain = match[3] || null;
        const port = match[4] ? match[4].replace(/^:/, '') : null;
        const path = match[5] || '';
        const query = match[6] ? match[6].replace(/^\?/, '') : null;
        const hash = match[7] ? match[7].replace(/^#/, '') : null;
        return {protocol, domain, port, path, query, hash};
    }

    joinUrl ({parsedProtocol, parsedDomain, parsedPort, parsedPath, parsedQuery, parsedHash}) {
        let rawQuery = [];
        for (let p in parsedQuery) {
            rawQuery.push(encodeURIComponent(p) + '=' + encodeURIComponent(parsedQuery[p]));
        }
        rawQuery = '?' + rawQuery.join('&');

        let rawPath = parsedPath.components.join('/');
        if (parsedPath.isAbsolute) {
            rawPath = '/' + rawPath;
        }
        if (parsedPath.hasTrailingSlash && parsedPath.components.length) {
            rawPath = rawPath + '/';
        }

        let url = '';
        if (parsedProtocol) {
            url += parsedProtocol + ':';
        }
        if (parsedProtocol || parsedDomain || parsedPort) {
            url += '//' + parsedDomain;
            if (parsedPort) {
                url += ':' + parsedPort;
            }
        }
        url += rawPath;
        if (rawQuery.length > 1) {
            url += rawQuery;
        }
        if (parsedHash) {
            url += '#' + parsedHash;
        }
        return url;
    }

    compareUrl (splittedUrl={}, parsedRoute={}) {
        return true &&
            this.compareProtocol(splittedUrl.protocol, parsedRoute) &&
            this.compareDomain(splittedUrl.domain, parsedRoute) &&
            this.comparePort(splittedUrl.port, parsedRoute) &&
            this.comparePath(splittedUrl.path, parsedRoute) &&
            this.compareQuery(splittedUrl.query, parsedRoute) &&
            this.compareHash(splittedUrl.hash, parsedRoute);
    }



    compareProtocol (rawValue, parsedRoute) {
        const parsedValue = this.parseProtocol(rawValue);
        return parsedRoute.template.protocol.matchParsedValue(parsedValue);
    }

    compareDomain (rawValue, parsedRoute) {
        const parsedValue = this.parseDomain(rawValue);
        return parsedRoute.template.domain.matchParsedValue(parsedValue);
    }

    comparePort (rawValue, parsedRoute) {
        const parsedValue = this.parsePort(rawValue);
        return parsedRoute.template.port.matchParsedValue(rawValue);
    }

    comparePath (rawValue, parsedRoute) {
        const parsedValue = this.parsePath(rawValue, parsedRoute.options);
        return parsedRoute.template.path.matchParsedValue(parsedValue);
    }

    compareQuery (rawValue, parsedRoute) {
        const parsedValue = this.parseQuery(rawValue);
        return parsedRoute.template.query.matchParsedValue(parsedValue);
    }

    compareHash (rawValue, parsedRoute) {
        const parsedValue = this.parseHash(rawValue);
        return parsedRoute.template.hash.matchParsedValue(parsedValue);
    }



    parseProtocol (rawValue) {
        return this.Utils.parsePart('Protocol', rawValue);
    }

    parseDomain (rawValue) {
        return this.Utils.parsePart('Domain', rawValue);
    }

    parsePort (rawValue) {
        return this.Utils.parsePart('Port', rawValue);
    }

    parsePath (rawValue='') {
        const Utils = this.Utils;
        let parsedValue = Utils.parsePath(rawValue);
        parsedValue = Utils.transformValue(parsedValue, Utils.pathParserOptions);
        return parsedValue;
    }

    parseQuery (rawValue='') {
        let parsedValue;
        if (!rawValue) {
            parsedValue = this.Utils.getDefaultQuery();
            return parsedValue;
        }

        rawValue += '';
        parsedValue = {};
        const queryKeyValues = rawValue.split('&');
        queryKeyValues.forEach((queryKeyValue) => {
            const equalIndex = queryKeyValue.indexOf('=');
            if (equalIndex === -1) {
                parsedValue[queryKeyValue] = '';
            } else {
                const queryKey = queryKeyValue.substr(0, equalIndex);
                const queryValue = queryKeyValue.substr(equalIndex + 1);
                parsedValue[queryKey] = queryValue;
            }
        });
        return parsedValue;
    }

    parseHash (rawValue) {
        return this.Utils.parsePart('Hash', rawValue);
    }
}

RussianRouter.Utils = Utils;

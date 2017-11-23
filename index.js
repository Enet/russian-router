const urlRegExp = /^(([A-z0-9]+:)?\/\/([A-z0-9.]+)(:[0-9]+)?)?([^?#]*)(\?[^#]*)?(#.*)?$/i;
const templateRegExp = /^(((?:[A-z0-9]+|{[A-z0-9]+}):)?\/\/((?:[A-z0-9.]+|{[A-z0-9]+}))(:(?:[0-9]+|{[A-z0-9]+}))?)?([^?#]*)(\?[^#]*)?(#.*)?$/i;
const queryKeyValueRegExp = /([A-z0-9]+)(=[A-z0-9]*|={[A-z0-9]+})?(?:&|#|$)/ig;
const paramRegExp = /^{([^*}]*)(\*)?}$/;

export class Utils {
    static isEmpty (value) {
        return value === null || value === undefined;
    }

    static isMatchGenerate (value) {
        return value && typeof value === 'object' && (value.match || value.generate);
    }

    static getDefaultProtocol () {
        return '';
    }

    static getDefaultDomain () {
        return '';
    }

    static getDefaultPort () {
        return 0;
    }

    static getDefaultPath () {
        return {
            isAbsolute: false,
            hasTrailingSlash: false,
            rawPath: '',
            components: []
        };
    }

    static getDefaultQuery () {
        return {};
    }

    static getDefaultHash () {
        return '';
    }

    static parsePart (partName, rawValue) {
        let parsedValue = this.transformValue(rawValue, this[`${partName.toLowerCase()}ParserOptions`]);
        if (!parsedValue) {
            parsedValue = this[`getDefault${partName}`]();
        }
        return parsedValue;
    }

    static parsePath (rawPath='') {
        const splittedPath = rawPath.trim().split('/');
        const isAbsolute = splittedPath[0] === '';
        const hasTrailingSlash = splittedPath[splittedPath.length - 1] === '';
        const parsedPath = {
            isAbsolute,
            hasTrailingSlash,
            rawPath,
            components: splittedPath
                .slice(1 * isAbsolute, splittedPath.length - 1 * hasTrailingSlash)
                .filter((component) => component !== '.')
        };
        let deepLevel = 0;
        parsedPath.components = parsedPath.components.reverse().filter((component) => {
            if (component === '..') {
                deepLevel++;
            }
            if (deepLevel === 0) {
                return true;
            }
            if (component !== '..') {
                deepLevel = Math.max(deepLevel - 1, 0);
            }
            return false;
        }).reverse();
        return parsedPath;
    }

    static transformValue (value, parserOptions={}, routeOptions) {
        const isLowerCase = parserOptions.lowerCase || (routeOptions && !routeOptions.caseSensitive);
        if (parserOptions.toRegExp && isLowerCase && value.flags.indexOf('i') === -1) {
            value = new RegExp(value.source, value.flags + 'i');
        } else if (parserOptions.toNumber) {
            value = +(value || 0);
        } else if (parserOptions.toString === true) {
            value = this.isEmpty(value) ? '' : value + '';
            if (isLowerCase) {
                value = value.toLowerCase();
            }
        } else if (parserOptions.partName === 'Path' && isLowerCase) {
            value = Object.assign({}, value, {
                components: value.components.map((component) => component.toLowerCase())
            });
        } else if (parserOptions.partName === 'Query' && isLowerCase) {
            let lowerCaseValue = {};
            for (let v in value) {
                if (this.isEmpty(value[v])) {
                    continue;
                }
                lowerCaseValue[v.toLowerCase()] = (value[v] + '').toLowerCase();
            }
            value = lowerCaseValue;
        }
        return value;
    }

    static createParamOrDefaultGenerator (paramName, defaultValue, parserOptions, routeOptions, emptyValue=false) {
        return (userParams) => {
            const userParam = paramName ? userParams[paramName] : userParams;
            const parsedValue = this.isEmpty(userParam) ? defaultValue : userParam;
            if (emptyValue && this.isEmpty(parsedValue)) {
                return parsedValue;
            }
            return this.transformValue(parsedValue, parserOptions, routeOptions);
        };
    }

    static extractMatchGenerate (paramName, paramValue, parserOptions, routeOptions) {
        let matchTool;
        let generateTool;

        if (this.isMatchGenerate(paramValue)) {
            matchTool = paramValue.match;
            generateTool = paramValue.generate;
        } else {
            matchTool = paramValue;
        }

        if (this.isEmpty(matchTool)) {
            matchTool = [];
        } else if (matchTool instanceof Array === false) {
            matchTool = [matchTool];
        }

        if (this.isEmpty(generateTool)) {
            generateTool = [this.createParamOrDefaultGenerator(paramName, null, parserOptions, routeOptions, true)];
            for (let matchValue of matchTool) {
                if (typeof matchValue !== 'function' && matchValue instanceof RegExp === false) {
                    generateTool = [this.createParamOrDefaultGenerator(paramName, matchValue, parserOptions, routeOptions)];
                    break;
                }
            }
        } else if (typeof generateTool === 'function') {
            generateTool = [generateTool];
        } else {
            generateTool = [this.createParamOrDefaultGenerator(paramName, generateTool, parserOptions, routeOptions)];
        }

        matchTool = matchTool.map((matchValue) => {
            if (typeof matchValue === 'string') {
                matchValue = this.transformValue(matchValue, parserOptions, routeOptions);
                return (testValue) => testValue === matchValue;
            } else if (typeof matchValue === 'function') {
                return matchValue;
            } else if (parserOptions.matchNumber && typeof matchValue === 'number') {
                matchValue = this.transformValue(matchValue, parserOptions, routeOptions);
                return (testValue) => testValue === matchValue;
            } else if (parserOptions.matchRegExp && matchValue instanceof RegExp) {
                matchValue = this.transformValue(matchValue, {
                    toRegExp: true,
                    lowerCase: parserOptions.lowerCase
                }, routeOptions);
                return (testValue) => matchValue.test(testValue);
            } else {
                throw `Invalid data type to match ${parserOptions.partName.toLowerCase()}!`;
            }
        });

        let generateParsedValue;
        let matchParsedValue;
        if (generateTool.length) {
            generateParsedValue = generateTool[0];
        }
        if (matchTool.length) {
            matchParsedValue = (parsedValue) => {
                parsedValue = this.transformValue(parsedValue, parserOptions, routeOptions);
                for (let matchFunction of matchTool) {
                    if (matchFunction(parsedValue)) {
                        return true;
                    }
                }
                return false;
            };
        }

        return {matchParsedValue, generateParsedValue};
    }

    static createDefaultParsedTemplate (parserOptions, routeOptions) {
        const defaultValue = this.transformValue(this[`getDefault${parserOptions.partName}`](), parserOptions, routeOptions);
        const defaultParsedTemplate = {
            isSpecified: false,
            matchParsedValue: (parsedValue) => {
                if (parserOptions.matchIfNotSpecified) {
                    return true;
                }
                parsedValue = this.transformValue(parsedValue, parserOptions, routeOptions);
                return defaultValue === parsedValue;
            },
            generateParsedValue: (userParams={}) => {
                return defaultValue;
            }
        };
        return defaultParsedTemplate;
    }

    static createParamPathTemplate (parserOptions, routeOptions, routeParams, paramMatch) {
        const parsedTemplate = this.createDefaultParsedTemplate(parserOptions, routeOptions);
        parsedTemplate.isSpecified = true;

        const paramName = paramMatch[1];
        const paramValue = routeParams[paramName];

        if (typeof paramValue === 'function') {
            parsedTemplate.matchParsedValue = paramValue;
            return parsedTemplate;
        } else if (this.isMatchGenerate(paramValue)) {
            parsedTemplate.matchParsedValue = paramValue.match || parsedTemplate.matchParsedValue;
            if (!this.isEmpty(paramValue.generate)) {
                if (typeof paramValue.generate === 'function') {
                    parsedTemplate.generateParsedValue = paramValue.generate;
                } else {
                    parsedTemplate.generateParsedValue = (userParams) => {
                        const parsedValue = this.isEmpty(userParams) ? paramValue.generate : userParams;
                        return parsedValue + '';
                    };
                }
            }
            return parsedTemplate;
        } else if (paramValue) {
            throw 'Invalid data type to match whole ${parserOptions.partName.toLowerCase()}!';
        } else {
            return parsedTemplate;
        }
    }

    static createParamQueryTemplate (parserOptions, routeOptions, routeParams, paramMatch) {
        return this.createParamPathTemplate(parserOptions, routeOptions, routeParams, paramMatch);
    }

    static createParamUniversalTemplate (parserOptions, routeOptions, routeParams, paramMatch) {
        const paramName = paramMatch[1];
        const paramValue = routeParams[paramName];
        let parsedTemplate;

        if (this.isEmpty(paramValue)) {
            parsedTemplate = this.createDefaultParsedTemplate(Object.assign({}, parserOptions, {
                matchIfNotSpecified: true
            }), routeOptions);
            parsedTemplate.generateParsedValue = this.createParamOrDefaultGenerator(
                paramName,
                this[`getDefault${parserOptions.partName}`](),
                parserOptions,
                routeOptions
            );
            parsedTemplate.isSpecified = true;
            return parsedTemplate;
        }

        parsedTemplate = this.createDefaultParsedTemplate(parserOptions, routeOptions);
        parsedTemplate.isSpecified = true;
        let {generateParsedValue, matchParsedValue} = this.extractMatchGenerate(paramName, paramValue, parserOptions, routeOptions);
        parsedTemplate.generateParsedValue = generateParsedValue || parsedTemplate.generateParsedValue;
        parsedTemplate.matchParsedValue = matchParsedValue || parsedTemplate.matchParsedValue;
        parsedTemplate.processingRequired = true;

        return parsedTemplate;
    }

    static createParamParsedTemplate (parserOptions, routeOptions, routeParams, paramMatch) {
        if (parserOptions.partName === 'Path') {
            return this.createParamPathTemplate(parserOptions, routeOptions, routeParams, paramMatch);
        } else if (parserOptions.partName === 'Query') {
            return this.createParamQueryTemplate(parserOptions, routeOptions, routeParams, paramMatch);
        } else {
            return this.createParamUniversalTemplate(parserOptions, routeOptions, routeParams, paramMatch);
        }
    }

    static createConstPathTemplate (parserOptions, routeOptions, routeParams, rawTemplate) {
        const parsedTemplate = this.createDefaultParsedTemplate(parserOptions, routeOptions);
        parsedTemplate.isSpecified = true;

        let parsedPath = this.parsePath(rawTemplate);
        const pathParamTools = [];
        const pathParserOptions = Object.assign({}, parserOptions, {
            toString: true
        });
        const pathOptionalParamNames = [];

        for (let c = 0, cl = parsedPath.components.length; c < cl; c++) {
            let templateComponent = this.transformValue(parsedPath.components[c], pathParserOptions, routeOptions);
            pathParamTools[c] = {
                matchParsedValue: (parsedValue='') => {
                    parsedValue = this.transformValue(parsedValue, pathParserOptions, routeOptions);
                    return parsedValue === templateComponent;
                },
                generateParsedValue: (userParam) => {
                    return templateComponent;
                }
            };
            const pathParamMatch = parsedPath.components[c].match(paramRegExp);
            if (!pathParamMatch) {
                continue;
            }
            const pathParamName = pathParamMatch[1];
            const pathParamValue = routeParams[pathParamName];
            const isPathParamOptional = pathParamMatch[2] === '*';
            if (isPathParamOptional) {
                pathOptionalParamNames.push(pathParamName);
                pathParamTools[c].optionalIndex = pathOptionalParamNames.length;
            }
            if (this.isEmpty(pathParamValue)) {
                pathParamTools[c].matchParsedValue = () => true;
                pathParamTools[c].generateParsedValue = (userParam) => {
                    const parsedValue = this.isEmpty(userParam) ? userParam : this.transformValue(userParam, {toString: true}, routeOptions);
                    return parsedValue;
                };
                continue;
            }
            let {generateParsedValue, matchParsedValue} = this.extractMatchGenerate(pathParamName, pathParamValue, pathParserOptions, routeOptions);
            pathParamTools[c].generateParsedValue = generateParsedValue || pathParamTools[c].generateParsedValue;
            pathParamTools[c].matchParsedValue = matchParsedValue || pathParamTools[c].matchParsedValue;
        }

        parsedTemplate.matchParsedValue = (parsedValue={}) => {
            if (routeOptions.trailingSlashSensitive && parsedValue.hasTrailingSlash !== parsedPath.hasTrailingSlash) {
                return false;
            }
            let pOffset = parsedValue.components.length - parsedPath.components.length;
            if (pOffset + pathOptionalParamNames.length < 0) {
                return false;
            }
            if (parsedPath.isAbsolute && pOffset > 0) {
                return false;
            }
            parsedValue = this.transformValue(parsedValue, parserOptions, routeOptions);
            optionalLoop:
            for (let o = 0, ol = Math.pow(2, pathOptionalParamNames.length); o < ol; o++) {
                let oOffset = 0;
                paramLoop:
                for (let p = 0, pl = pathParamTools.length; p < pl; p++) {
                    const pIndex = parsedPath.isAbsolute ? p : pl - p - 1;
                    const pathParamTool = pathParamTools[pIndex];
                    if (pathParamTool.optionalIndex && o / Math.pow(2, pathParamTool.optionalIndex) % 1 >= 0.5) {
                        oOffset--;
                        continue paramLoop;
                    }
                    const tIndex = parsedPath.isAbsolute ? p + oOffset : parsedValue.components.length - p - 1 - oOffset;
                    const testValue = parsedValue.components[tIndex];
                    if (!pathParamTools[pIndex].matchParsedValue(testValue)) {
                        continue optionalLoop;
                    }
                }
                return true;
            }
            return false;
        };

        parsedTemplate.generateParsedValue = (userParams={}) => {
            const parsedValue = Object.assign({}, parsedPath, {
                components: []
            });
            for (let p = 0, pl = pathParamTools.length; p < pl; p++) {
                const pathParamTool = pathParamTools[p];
                parsedValue.components[p] = pathParamTool.generateParsedValue(userParams) || '';
            }
            return parsedValue;
        };

        parsedTemplate.processingRequired = true;
        return parsedTemplate;
    }

    static createConstQueryTemplate (parserOptions, routeOptions, routeParams, rawTemplate) {
        const parsedTemplate = this.createDefaultParsedTemplate(parserOptions, routeOptions);
        parsedTemplate.isSpecified = true;

        let queryMatch;
        const queryParamTools = {};
        const queryParserOptions = Object.assign({}, parserOptions, {
            toString: true
        });

        while (queryMatch = queryKeyValueRegExp.exec(rawTemplate)) {
            let queryKey = routeOptions.caseSensitive ? queryMatch[1] : queryMatch[1].toLowerCase();
            let queryValue = routeOptions.caseSensitive ? (queryMatch[2] || '') : (queryMatch[2] || '').toLowerCase();
            queryValue = queryValue.replace(/^=/, '');
            queryParamTools[queryKey] = {
                matchParsedValue: (parsedValue='') => {
                    parsedValue = this.transformValue(parsedValue, {toString: true}, routeOptions);
                    return parsedValue === queryValue;
                },
                generateParsedValue: (userParam) => {
                    return queryValue;
                }
            };
            const queryParamMatch = queryValue.match(paramRegExp);
            if (!queryParamMatch) {
                continue;
            }
            const queryParamName = queryParamMatch[1];
            const queryParamValue = routeParams[queryParamName];
            if (this.isEmpty(queryParamValue)) {
                queryParamTools[queryKey].matchParsedValue = (parsedValue) => true;
                queryParamTools[queryKey].generateParsedValue = (userParams) => {
                    const userParam = userParams[queryParamName];
                    const parsedValue = this.isEmpty(userParam) ? userParam : this.transformValue(userParam, {toString: true}, routeOptions);
                    return parsedValue;
                };
                continue;
            }
            let {generateParsedValue, matchParsedValue} = this.extractMatchGenerate(queryParamName, queryParamValue, queryParserOptions, routeOptions);
            queryParamTools[queryKey].generateParsedValue = generateParsedValue || ((userParams) => null);
            queryParamTools[queryKey].matchParsedValue = matchParsedValue || ((parsedValue) => true);
        }

        parsedTemplate.matchParsedValue = (parsedValue={}) => {
            parsedValue = this.transformValue(parsedValue, {partName: 'Query'}, routeOptions);
            for (let q in queryParamTools) {
                if (!queryParamTools[q].matchParsedValue(parsedValue[q])) {
                    return false;
                }
            }
            return true;
        };

        parsedTemplate.generateParsedValue = (userParams={}) => {
            const parsedValue = {};
            for (let q in queryParamTools) {
                parsedValue[q] = queryParamTools[q].generateParsedValue(userParams);
            }
            return parsedValue;
        };

        parsedTemplate.processingRequired = true;
        return parsedTemplate;
    }

    static createConstUniversalTemplate (parserOptions, routeOptions, routeParams, rawTemplate) {
        const parsedTemplate = this.createDefaultParsedTemplate(parserOptions, routeOptions);
        parsedTemplate.isSpecified = true;

        rawTemplate = this.transformValue(rawTemplate, parserOptions, routeOptions);
        parsedTemplate.matchParsedValue = (parsedValue) => {
            parsedValue = this.transformValue(parsedValue, parserOptions, routeOptions);
            return rawTemplate === parsedValue;
        };
        parsedTemplate.generateParsedValue = (userParams) => {
            return rawTemplate;
        };
        return parsedTemplate;
    }

    static createConstParsedTemplate (parserOptions, routeOptions, routeParams, rawTemplate) {
        if (parserOptions.partName === 'Path') {
            return this.createConstPathTemplate(parserOptions, routeOptions, routeParams, rawTemplate);
        } else if (parserOptions.partName === 'Query') {
            return this.createConstQueryTemplate(parserOptions, routeOptions, routeParams, rawTemplate);
        } else {
            return this.createConstUniversalTemplate(parserOptions, routeOptions, routeParams, rawTemplate);
        }
    }

    static createTemplateParser (parserOptions) {
        const that = this;

        return function (rawTemplate, routeParams, routeOptions) {
            let parsedTemplate;
            if (!rawTemplate) {
                // Template does not exist
                parsedTemplate = that.createDefaultParsedTemplate(parserOptions, routeOptions);
                return parsedTemplate;
            }

            const paramMatch = rawTemplate.match(paramRegExp);
            if (paramMatch) {
                // Whole template is presented by only parameter
                parsedTemplate = that.createParamParsedTemplate(parserOptions, routeOptions, routeParams, paramMatch);
            } else {
                // Template is presented by string that should be parsed
                parsedTemplate = that.createConstParsedTemplate(parserOptions, routeOptions, routeParams, rawTemplate);
            }

            if (!parsedTemplate.processingRequired) {
                // Template does not require decorators
                return parsedTemplate;
            }

            // Template requires decorators
            let {generateParsedValue} = parsedTemplate;
            parsedTemplate.generateParsedValue = (userParams) => {
                let parsedValue = generateParsedValue(userParams);
                parsedValue = that.transformValue(parsedValue, parserOptions, routeOptions);
                if (routeOptions.dataConsistency && !parsedTemplate.matchParsedValue(parsedValue)) {
                    if (parserOptions.partName === 'Path') {
                        let rawValue = parsedValue.components.join('/');
                        if (parsedValue.isAbsolute) {
                            rawValue = '/' + rawValue;
                        }
                        if (parsedValue.hasTrailingSlash) {
                            rawValue += '/';
                        }
                        parsedValue = rawValue;
                    }
                    if (parserOptions.partName === 'Query') {
                        parsedValue = JSON.stringify(parsedValue);
                    }
                    throw [
                        'DATA IS INCONSISTENCE!',
                        '    Route name: ' + routeOptions.routeName,
                        '    Part of url: ' + parserOptions.partName,
                        '    Generated value: ' + parsedValue
                    ].join('\n');
                }
                return parsedValue;
            };

            return parsedTemplate;
        };
    }
}

Utils.protocolParserOptions = {
    partName: 'Protocol',
    toString: true,
    lowerCase: true,
    matchRegExp: true
};

Utils.domainParserOptions = {
    partName: 'Domain',
    toString: true,
    lowerCase: true,
    matchRegExp: true
};

Utils.portParserOptions = {
    partName: 'Port',
    toNumber: true,
    matchNumber: true
};

Utils.pathParserOptions = {
    partName: 'Path',
    matchIfNotSpecified: true,
    matchNumber: true,
    matchRegExp: true
};

Utils.queryParserOptions = {
    partName: 'Query',
    matchIfNotSpecified: true,
    matchNumber: true,
    matchRegExp: true
};

Utils.hashParserOptions = {
    partName: 'Hash',
    matchIfNotSpecified: true,
    toString: true,
    matchNumber: true,
    matchRegExp: true
};



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

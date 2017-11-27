import {
    paramRegExp
} from './expressions.js';
import {
    MatchFragment,
    isEmpty,
    getDefaultPart,
    getPortByProtocol,
    getPartClass,
    convertMatchItemToFunction,
    convertGenerateItemToFunction
} from './utils.js';
import {
    Port,
    Query,
    PathComponent,
    QueryComponent
} from './parts.js';

class DefaultTemplate {
    constructor (templateUri, routeParams, routeOptions, partName) {
        this._templateUri = templateUri;
        this._routeParams = routeParams;
        this._routeOptions = routeOptions;
        this._partName = partName;
    }

    matchParsedValue (userUri, matchMap=this._matchMap) {
        for (let matchFunction of matchMap) {
            const matchFragment = matchFunction(userUri);
            if (matchFragment) {
                return matchFragment;
            }
        }
        return null;
    }

    generateParsedValue (userParams, generateMap=this._generateMap) {
        let parsedValue;
        for (let generateFunction of generateMap) {
            parsedValue = generateFunction(userParams);
            if (!parsedValue.isEmpty()) {
                return parsedValue;
            }
        }
        return parsedValue;
    }
}

export class ParamUniversalTemplate extends DefaultTemplate {
    constructor (templateUri, routeParams, routeOptions, partName) {
        super(...arguments);

        const rawTemplate = templateUri.getSplittedUri(partName);
        const paramMatch = rawTemplate.match(paramRegExp);
        const paramName = paramMatch[1];
        const paramValue = routeParams.getParam(paramName);
        this._paramName = paramName;
        this._paramValue = paramValue;

        this._matchMap = paramValue.match.map((matchItem) => {
            return convertMatchItemToFunction(matchItem, routeOptions, partName, paramName);
        });
        if (!this._matchMap.length) {
            this._matchMap.push((userUri) => {
                const matchParams = {};
                const userUriPart = userUri.getParsedUri(partName);
                matchParams[paramName] = userUriPart.toLowerCase(!routeOptions.caseSensitive).toString();
                return new MatchFragment(matchParams[paramName], matchParams);
            });
        }

        this._generateMap = paramValue.generate.map((generateItem) => {
            return convertGenerateItemToFunction(generateItem, routeOptions, partName, paramName);
        });
        this._generateMap.push((userParams) => {
            const userParam = userParams[paramName];
            const Constructor = getPartClass(partName);
            let parsedValue = new Constructor(userParam);
            if (parsedValue.isEmpty()) {
                parsedValue = getDefaultPart(partName);
            }
            return parsedValue.toLowerCase(!routeOptions.caseSensitive);
        });
    }
}

export class ParamProtocolTemplate extends ParamUniversalTemplate {

}

export class ParamDomainTemplate extends ParamUniversalTemplate {

}

export class ParamPortTemplate extends ParamUniversalTemplate {

}

export class ParamPathTemplate extends ParamUniversalTemplate {

}

export class ParamQueryTemplate extends ParamUniversalTemplate {

}

export class ParamHashTemplate extends ParamUniversalTemplate {

}

export class ConstUniversalTemplate extends DefaultTemplate {
    matchParsedValue (userUri) {
        const templateUri = this._templateUri;
        const routeOptions = this._routeOptions;
        const partName = this._partName;

        let userUriPart = userUri.getParsedUri(partName);
        let userUriPartString = userUriPart.toLowerCase(!routeOptions.caseSensitive).toString();
        let templateUriPart = templateUri.getParsedUri(partName);
        if (templateUriPart.isEmpty()) {
            templateUriPart = getDefaultPart(partName);
        }
        if (templateUriPart.isEmpty()) {
            return new MatchFragment(userUriPartString);
        }

        let templateUriPartString = templateUriPart.toLowerCase(!routeOptions.caseSensitive).toString();
        if (userUriPartString === templateUriPartString) {
            return new MatchFragment(userUriPartString);
        }

        return null;
    }

    generateParsedValue (userParams) {
        const templateUri = this._templateUri;
        const routeOptions = this._routeOptions;
        const partName = this._partName;

        let parsedValue = templateUri.getParsedUri(partName);
        return parsedValue.toLowerCase(!routeOptions.caseSensitive);
    }
}

export class ConstProtocolTemplate extends ConstUniversalTemplate {

}

export class ConstDomainTemplate extends ConstUniversalTemplate {

}

export class ConstPortTemplate extends ConstUniversalTemplate {
    matchParsedValue (userUri) {
        const templateUri = this._templateUri;
        const routeOptions = this._routeOptions;
        const partName = this._partName;

        let userUriPart = userUri.getParsedUri(partName);
        if (userUriPart.isEmpty()) {
            const userPortByProtocol = getPortByProtocol(userUri.getParsedUri('protocol'));
            userUriPart = new Port(userPortByProtocol);
        }
        if (userUriPart.isEmpty()) {
            userUriPart = getDefaultPart(partName);
        }

        let templateUriPart = templateUri.getParsedUri(partName);
        if (templateUriPart.isEmpty()) {
            const templateUriProtocol = templateUri.getParsedUri('protocol').toLowerCase();
            const defaultProtocol = getDefaultPart('protocol').toLowerCase();
            if (templateUriProtocol.toString() === defaultProtocol.toString()) {
                templateUriPart = getDefaultPart(partName);
            }
            if (templateUriPart.isEmpty()) {
                const templatePortByProtocol = getPortByProtocol(templateUriProtocol);
                templateUriPart = new Port(templatePortByProtocol);
            }
        }

        let userUriPartString = userUriPart.toString();
        if (userUriPartString === templateUriPart.toString()) {
            return new MatchFragment(userUriPartString);
        }

        return null;
    }
}

export class ConstPathTemplate extends DefaultTemplate {
    constructor (templateUri, routeParams, routeOptions, partName) {
        super(...arguments);

        const templateUriPath = templateUri.getParsedUri(partName);
        const templateUriPathComponents = templateUriPath.toArray();
        const matchArray = [];
        const generateArray = [];
        const optionalPathParamNames = [];

        for (let t = 0, tl = templateUriPathComponents.length; t < tl; t++) {
            let templateUriPathComponent = new PathComponent(templateUriPathComponents[t]).toLowerCase(!routeOptions.caseSensitive);

            const pathParamMatch = templateUriPathComponents[t].match(paramRegExp);
            if (!pathParamMatch) {
                matchArray.push([(userUri) => {
                    const userUriPathComponents = userUri.getParsedUri(partName).toArray();
                    const userUriPathComponent = new PathComponent(userUriPathComponents[t]).toLowerCase(!routeOptions.caseSensitive);
                    if (userUriPathComponent.toString() === templateUriPathComponent.toString()) {
                        return new MatchFragment(userUriPathComponent.toString());
                    }
                    return null;
                }]);
                generateArray.push([(userParams) => {
                    return templateUriPathComponent.toString();
                }]);
                continue;
            }

            const pathParamName = pathParamMatch[1];
            const pathParamValue = routeParams.getParam(pathParamName);
            const isPathParamOptional = pathParamMatch[2] === '*';
            if (isPathParamOptional) {
                optionalPathParamNames.push(pathParamName);
                matchArray[t].optionalIndex = optionalPathParamNames.length;
            }

            const pathMatchMap = pathParamValue.match.map((matchItem) => {
                return convertMatchItemToFunction(matchItem, routeOptions, 'pathComponent', pathParamName);
            });
            if (!pathMatchMap.length) {
                pathMatchMap.push((userUri) => {
                    const matchParams = {};
                    const userUriPart = new PathComponent(userUri.getParsedUri(partName).toObject()[pathParamName]);
                    matchParams[paramName] = userUriPart.toLowerCase(!routeOptions.caseSensitive).toString();
                    return new MatchFragment(matchParams[paramName], matchParams);
                });
            }
            matchObject[pathKey] = queryMatchMap;

            const queryGenerateMap = queryParamValue.generate.map((generateItem) => {
                return convertGenerateItemToFunction(generateItem, routeOptions, 'queryComponent', queryParamName);
            });
            queryGenerateMap.push((userParams) => {
                const userParam = userParams[queryParamName];
                let parsedValue = new QueryComponent(userParam);
                return parsedValue.toLowerCase(!routeOptions.caseSensitive);
            });
            generateObject[queryKey] = queryGenerateMap;



            if (isEmpty(pathParamValue)) {
                pathParamTools[t].matchParsedValue = () => true;
                pathParamTools[t].generateParsedValue = (userParam) => {
                    const parsedValue = this.isEmpty(userParam) ? userParam : this.transformValue(userParam, {toString: true}, routeOptions);
                    return parsedValue;
                };
                continue;
            }
            let {generateParsedValue, matchParsedValue} = this.extractMatchGenerate(pathParamName, pathParamValue, pathParserOptions, routeOptions);
            pathParamTools[t].generateParsedValue = generateParsedValue || pathParamTools[t].generateParsedValue;
            pathParamTools[t].matchParsedValue = matchParsedValue || pathParamTools[t].matchParsedValue;
        }

        this._matchArray = matchArray;
        this._generateArray = generateArray;
    }

    matchParsedValue () {
        return new MatchFragment('/hello/world/', {helloWorld: 123});

        /*if (routeOptions.trailingSlashSensitive && parsedValue.hasTrailingSlash !== parsedPath.hasTrailingSlash) {
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
        return false;*/
    }

    generateParsedValue (userParams) {
        const generateArray = this._generateArray;
        let rawValue = [];

        for (let generateMap of generateArray) {
            const pathParsedValue = super.generateParsedValue(userParams, generateMap);
            if (isEmpty(pathParsedValue) || pathParsedValue.isEmpty()) {
                continue;
            }
            rawValue.push(pathParsedValue.toString());
        }

        rawValue = rawValue.join('/');
        if (this._templateUri.isAbsolute()) {
            rawValue = '/' + rawValue;
        }
        if (this._templateUri.hasTrailingSlash()) {
            rawValue += '/';
        }

        return new Path(rawValue);
    }
}

export class ConstQueryTemplate extends DefaultTemplate {
    constructor (templateUri, routeParams, routeOptions, partName) {
        super(...arguments);

        const matchObject = {};
        const generateObject = {};

        const templateUriQuery = templateUri.getParsedUri(partName);
        const templateUriQueryObject = templateUriQuery.toObject();
        for (let templateUriQueryKey in templateUriQueryObject) {
            let queryKey = new QueryComponent(templateUriQueryKey).toLowerCase(!routeOptions.caseSensitive);
            let queryValue = new QueryComponent(templateUriQueryObject[templateUriQueryKey]).toLowerCase(!routeOptions.caseSensitive);

            const queryParamMatch = queryValue.toString().match(paramRegExp);
            if (!queryParamMatch) {
                matchObject[queryKey] = [(userUri) => {
                    const userUriQueryObject = userUri
                        .getParsedUri(partName)
                        .toLowerCase(!routeOptions.caseSensitive)
                        .toObject();
                    const userUriQueryValue = userUriQueryObject[queryKey];
                    if (userUriQueryValue.toString() === queryValue.toString()) {
                        return new MatchFragment(userUriQueryValue.toString());
                    }
                    return null;
                }];
                generateObject[queryKey] = [(userParams) => {
                    return queryValue.toString();
                }];
                continue;
            }

            const queryParamName = queryParamMatch[1];
            const queryParamValue = routeParams.getParam(queryParamName);

            const queryMatchMap = queryParamValue.match.map((matchItem) => {
                return convertMatchItemToFunction(matchItem, routeOptions, 'queryComponent', queryParamName);
            });
            if (!queryMatchMap.length) {
                queryMatchMap.push((userUri) => {
                    const matchParams = {};
                    const userUriPart = new QueryComponent(userUri.getParsedUri(partName).toObject()[queryParamName]);
                    matchParams[paramName] = userUriPart.toLowerCase(!routeOptions.caseSensitive).toString();
                    return new MatchFragment(matchParams[paramName], matchParams);
                });
            }
            matchObject[queryKey] = queryMatchMap;

            const queryGenerateMap = queryParamValue.generate.map((generateItem) => {
                return convertGenerateItemToFunction(generateItem, routeOptions, 'queryComponent', queryParamName);
            });
            queryGenerateMap.push((userParams) => {
                const userParam = userParams[queryParamName];
                let parsedValue = new QueryComponent(userParam);
                return parsedValue.toLowerCase(!routeOptions.caseSensitive);
            });
            generateObject[queryKey] = queryGenerateMap;
        }

        this._matchObject = matchObject;
        this._generateObject = generateObject;
    }

    matchParsedValue (userUri) {
        const matchObject = this._matchObject;
        const value = {};
        const params = {};

        for (let m in matchObject) {
            const queryMatchFragment = super.matchParsedValue(userUri, matchObject[m]);
            if (queryMatchFragment) {
                value[m] = queryMatchFragment.value;
                Object.assign(params, queryMatchFragment.params);
                continue;
            }
            return null;
        }

        const matchFragment = new MatchFragment(value, params);
        return matchFragment;
    }

    generateParsedValue (userParams) {
        const generateObject = this._generateObject;
        let rawValue = [];

        for (let g in generateObject) {
            const queryParsedValue = super.generateParsedValue(userParams, generateObject[g]);
            if (isEmpty(queryParsedValue) || queryParsedValue.isEmpty()) {
                continue;
            }
            rawValue.push(encodeURIComponent(g) + '=' + encodeURIComponent(queryParsedValue.toString()));
        }

        rawValue = rawValue.join('&');
        return new Query(rawValue);
    }
}

export class ConstHashTemplate extends ConstUniversalTemplate {

}

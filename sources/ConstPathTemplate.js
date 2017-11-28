import {
    isEmpty,
    getRegExp,
    getPartConstructor,
    convertMatchItemToFunction,
    convertGenerateItemToFunction
} from './utils.js';
import DefaultTemplate from './DefaultTemplate.js';
import MatchFragment from './MatchFragment.js';
import PathComponent from './PathComponent.js';

export default class ConstPathTemplate extends DefaultTemplate {
    constructor (partName, templateUri, routeOptions, routeParams) {
        super(...arguments);

        const templateUriPath = templateUri.getParsedUri(partName);
        const templateUriPathComponents = templateUriPath.toArray();
        const matchArray = [];
        const generateArray = [];
        const optionalPathParamNames = [];

        for (let t = 0, tl = templateUriPathComponents.length; t < tl; t++) {
            let templateUriPathComponent = new PathComponent(templateUriPathComponents[t]).toLowerCase(!routeOptions.caseSensitive);

            const pathParamMatch = templateUriPathComponents[t].match(getRegExp('param'));
            if (!pathParamMatch) {
                matchArray[t] = [(userUri) => {
                    const userUriPathComponents = userUri.getParsedUri(partName).toArray();
                    const userUriPathComponent = new PathComponent(userUriPathComponents[t]).toLowerCase(!routeOptions.caseSensitive);
                    if (userUriPathComponent.toString() === templateUriPathComponent.toString()) {
                        return new MatchFragment(userUriPathComponent.toString());
                    }
                    return null;
                }];
                generateArray[t] = [(userParams) => {
                    return templateUriPathComponent.toString();
                }];
                continue;
            }

            const pathParamName = pathParamMatch[1];
            const pathParamValue = routeParams.getParam(pathParamName);

            const pathMatchFunctions = pathParamValue.match.map((matchItem) => {
                return convertMatchItemToFunction(matchItem, routeOptions, 'pathComponent', pathParamName, t);
            });
            if (!pathMatchFunctions.length) {
                pathMatchFunctions.push((userUri) => {
                    const matchParams = {};
                    const userUriPart = new PathComponent(userUri.getParsedUri(partName).toObject()[t]);
                    matchParams[pathParamName] = userUriPart.toLowerCase(!routeOptions.caseSensitive).toString();
                    return new MatchFragment(matchParams[pathParamName], matchParams);
                });
            }
            matchArray[t] = pathMatchFunctions;

            const isPathParamOptional = pathParamMatch[2] === '*';
            if (isPathParamOptional) {
                optionalPathParamNames.push(pathParamName);
                matchArray[t].optionalIndex = optionalPathParamNames.length;
            }

            const pathGenerateFunctions = pathParamValue.generate.map((generateItem) => {
                return convertGenerateItemToFunction(generateItem, routeOptions, 'pathComponent', pathParamName);
            });
            pathGenerateFunctions.push((userParams) => {
                const userParam = userParams[pathParamName];
                let parsedValue = new PathComponent(userParam);
                return parsedValue.toLowerCase(!routeOptions.caseSensitive);
            });
            generateArray[t] = pathGenerateFunctions;
        }

        this._matchArray = matchArray;
        this._generateArray = generateArray;
        this._optionalPathParamNames = optionalPathParamNames;
    }

    matchParsedValue (userUri) {
        const partName = this._partName;
        const routeOptions = this._routeOptions;
        const userUriPath = userUri.getParsedUri(partName).toLowerCase(!routeOptions.caseSensitive);
        const templateUriPath = this._templateUri.getParsedUri(partName);
        const userUriPathComponents = userUriPath.toArray();
        const templateUriPathComponents = templateUriPath.toArray();
        const optionalPathParamNames = this._optionalPathParamNames;

        if (routeOptions.trailingSlashSensitive && userUriPath.hasTrailingSlash() !== templateUriPath.hasTrailingSlash()) {
            return null;
        }
        let pOffset = userUriPathComponents.length - templateUriPathComponents.length;
        if (pOffset + optionalPathParamNames.length < 0) {
            return null;
        }
        if (templateUriPath.isAbsolute() && pOffset > 0) {
            return null;
        }

        const matchArray = this._matchArray;
        const value = userUri.getSplittedUri(partName).toString();
        const params = {};

        optionalLoop:
        for (let o = 0, ol = Math.pow(2, optionalPathParamNames.length); o < ol; o++) {
            let oOffset = 0;
            componentLoop:
            for (let m = 0, ml = matchArray.length; m < ml; m++) {
                const mIndex = templateUriPath.isAbsolute() ? m : ml - m - 1;
                const matchFunctions = matchArray[mIndex];
                if (matchFunctions.optionalIndex && o / Math.pow(2, matchFunctions.optionalIndex) % 1 >= 0.5) {
                    oOffset--;
                    continue componentLoop;
                }
                const tIndex = templateUriPath.isAbsolute() ? m + oOffset : userUriPathComponents.length - m - 1 - oOffset;
                const pathMatchFragment = super.matchParsedValue(userUri, matchFunctions);
                if (!pathMatchFragment) {
                    continue optionalLoop;
                }
                Object.assign(params, pathMatchFragment.params);
            }
            return new MatchFragment(value, params);
        }
        return null;
    }

    generateParsedValue (userParams) {
        const partName = this._partName;
        const generateArray = this._generateArray;
        const templateUriPath = this._templateUri.getParsedUri(partName);
        let rawValue = [];

        for (let generateFunctions of generateArray) {
            const pathParsedValue = super.generateParsedValue(userParams, generateFunctions);
            if (isEmpty(pathParsedValue) || pathParsedValue.isEmpty()) {
                continue;
            }
            rawValue.push(pathParsedValue.toString());
        }

        rawValue = rawValue.join('/');
        if (templateUriPath.isAbsolute()) {
            rawValue = '/' + rawValue;
        }
        if (templateUriPath.hasTrailingSlash()) {
            rawValue += '/';
        }

        const PartConstructor = getPartConstructor(partName);
        return new PartConstructor(rawValue);
    }
}

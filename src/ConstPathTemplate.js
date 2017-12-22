import {
    getRegExp,
    getPartConstructor,
    convertMatchItemsToFunctions,
    convertGenerateItemsToFunctions
} from './utils.js';
import DefaultTemplate from './DefaultTemplate.js';
import MatchFragment from './MatchFragment.js';
import PathComponent from './PathComponent.js';
import RouterError from './RouterError.js';

export default class ConstPathTemplate extends DefaultTemplate {
    constructor (templateUri, routeParams) {
        super(...arguments);

        const matchArray = [];
        const generateArray = [];
        const templateUriPath = templateUri.getParsedUri(this._partName);
        const templateUriPathComponents = templateUriPath.toArray().map((value) => new PathComponent(value));
        const optionalPathParamNames = [];

        for (let t = 0, tl = templateUriPathComponents.length; t < tl; t++) {
            let matchFunctions = [];
            let generateFunctions = [];

            const templateUriPathComponent = templateUriPathComponents[t];
            const pathParamMatch = templateUriPathComponent.toString().match(getRegExp('param'));
            if (pathParamMatch) {
                const pathParamName = pathParamMatch[1];
                const pathParamValue = routeParams.getParam(pathParamName);
                matchFunctions = this._getParamMatchFunctions(pathParamName, pathParamValue);
                generateFunctions = this._getParamGenerateFunctions(pathParamName, pathParamValue);
                generateFunctions.paramName = pathParamName;
                const isPathParamOptional = pathParamMatch[2] === '*';
                if (isPathParamOptional) {
                    optionalPathParamNames.push(pathParamName);
                    matchFunctions.optionalIndex = optionalPathParamNames.length;
                    generateFunctions.optionalIndex = optionalPathParamNames.length;
                }
            } else {
                matchFunctions = this._getConstMatchFunctions(templateUriPathComponent);
                generateFunctions = this._getConstGenerateFunctions(templateUriPathComponent);
            }

            matchArray[t] = matchFunctions;
            generateArray[t] = generateFunctions;
        }

        this._matchArray = matchArray;
        this._generateArray = generateArray;
        this._optionalPathParamNames = optionalPathParamNames;
    }

    matchParsedValue (userUri, contextOptions) {
        const {partName} = contextOptions;
        const optionalPathParamNames = this._optionalPathParamNames;
        const userUriPath = userUri.getParsedUri(partName);
        const templateUriPath = this._templateUri.getParsedUri(partName);

        if (!userUriPath.isAbsolute()) {
            throw new RouterError(RouterError.ABSOLUTE_PATH_EXPECTED, {
                currentPath: userUriPath.toString()
            });
        }

        if (contextOptions.trailingSlashSensitive &&
            userUriPath.hasTrailingSlash() !== templateUriPath.hasTrailingSlash()) {
            return null;
        }

        const userUriPathComponentCount = userUriPath.toArray().length;
        const templateUriPathComponentCount = templateUriPath.toArray().length;
        if (userUriPathComponentCount < templateUriPathComponentCount - optionalPathParamNames.length) {
            return null;
        }
        if (templateUriPath.isAbsolute() && userUriPathComponentCount > templateUriPathComponentCount) {
            return null;
        }

        const matchArray = this._matchArray;
        const value = userUri.getParsedUri(partName).toString();

        optionalLoop:
        for (let o = 0, ol = Math.pow(2, optionalPathParamNames.length); o < ol; o++) {
            const params = {};
            let optionalOffset = 0;
            componentLoop:
            for (let m = 0, ml = matchArray.length; m < ml; m++) {
                const matchIndex = templateUriPath.isAbsolute() ? m : ml - 1 - m;
                const matchFunctions = matchArray[matchIndex];
                if (matchFunctions.optionalIndex && o / Math.pow(2, optionalPathParamNames.length + 1 - matchFunctions.optionalIndex) % 1 >= 0.5) {
                    optionalOffset--;
                    if (templateUriPath.isAbsolute() &&
                        userUriPathComponentCount > templateUriPathComponentCount + optionalOffset) {
                        continue optionalLoop;
                    } else {
                        const optionalParamName = optionalPathParamNames[matchFunctions.optionalIndex - 1];
                        Object.assign(params, {
                            [optionalParamName]: ''
                        });
                        continue componentLoop;
                    }
                }
                this._currentPathComponentIndex = templateUriPath.isAbsolute() ?
                    m + optionalOffset :
                    userUriPathComponentCount - 1 - m - optionalOffset;
                const pathMatchFragment = super.matchParsedValue(userUri, contextOptions, matchFunctions);
                if (!pathMatchFragment) {
                    continue optionalLoop;
                }
                Object.assign(params, pathMatchFragment.params);
            }
            return new MatchFragment(value, params);
        }
        return null;
    }

    generateParsedValue (userParams, contextOptions) {
        const {partName} = contextOptions;
        const generateArray = this._generateArray;
        const templateUriPath = this._templateUri.getParsedUri(partName);
        let rawValue = [];

        for (let generateFunctions of generateArray) {
            const pathComponent = super.generateParsedValue(userParams, contextOptions, generateFunctions);
            if (pathComponent.isEmpty() && generateFunctions.paramName) {
                if (generateFunctions.optionalIndex) {
                    continue;
                } else {
                    const {paramName} = generateFunctions;
                    const routeName = this._routeName;
                    throw new RouterError(RouterError.PATH_COMPONENT_EXPECTED, {
                        paramName,
                        routeName
                    });
                }
            }
            rawValue.push(encodeURIComponent(pathComponent.toString()));
        }

        rawValue = rawValue.join('/');
        if (templateUriPath.isAbsolute()) {
            rawValue = '/' + rawValue;
        }
        if (templateUriPath.hasTrailingSlash()) {
            rawValue += '/';
        }

        const PartConstructor = getPartConstructor(partName);
        const parsedValue = new PartConstructor(rawValue);
        return parsedValue;
    }

    _getConstMatchFunctions (templateUriPathComponent) {
        return [(userUri, contextOptions) => {
            const {partName} = contextOptions;
            const templateUriPathComponentString = templateUriPathComponent.toLowerCase(!contextOptions.caseSensitive).toString();
            const userUriRawPathComponents = userUri.getParsedUri(partName).toArray();
            const userUriPathComponent = new PathComponent(userUriRawPathComponents[this._currentPathComponentIndex]);
            const userUriPathComponentString = userUriPathComponent.toLowerCase(!contextOptions.caseSensitive).toString();
            if (userUriPathComponentString === templateUriPathComponentString) {
                return new MatchFragment(userUriPathComponentString);
            }
            return null;
        }];
    }

    _getConstGenerateFunctions (templateUriPathComponent) {
        return [(userParams) => templateUriPathComponent];
    }

    _getParamMatchFunctions (paramName, paramValue) {
        const getUserUriPart = (userUri) => {
            const userUriPath = userUri.getParsedUri('path');
            return new PathComponent(userUriPath.toArray()[this._currentPathComponentIndex]);
        };
        return convertMatchItemsToFunctions(paramValue.match, {
            partName: 'pathComponent',
            paramName,
            getUserUriPart
        });
    }

    _getParamGenerateFunctions (paramName, paramValue) {
        return convertGenerateItemsToFunctions(paramValue.generate, {
            partName: 'pathComponent',
            paramName
        });
    }

    _getPartName () {
        return 'path';
    }
}

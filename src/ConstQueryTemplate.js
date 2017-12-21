import {
    getRegExp,
    getPartConstructor,
    convertMatchItemsToFunctions,
    convertGenerateItemsToFunctions
} from './utils.js';
import DefaultTemplate from './DefaultTemplate.js';
import MatchFragment from './MatchFragment.js';
import QueryComponent from './QueryComponent.js';

export default class ConstQueryTemplate extends DefaultTemplate {
    constructor (templateUri, routeParams) {
        super(...arguments);

        const matchObjects = {true: {}, false: {}};
        const generateObjects = {true: {}, false: {}};
        const templateUriQuery = templateUri.getParsedUri(this._partName);
        const templateUriQueryObject = templateUriQuery.toObject();

        for (let templateUriQueryCoupleKey in templateUriQueryObject) {

            const templateUriQueryCoupleValue = templateUriQueryObject[templateUriQueryCoupleKey];
            let queryCoupleParsedValue = new QueryComponent(templateUriQueryCoupleValue);
            const queryParamMatch = queryCoupleParsedValue.toString().match(getRegExp('param'));

            for (let caseSensitive of [true, false]) {
                let queryCoupleKey = new QueryComponent(templateUriQueryCoupleKey).toLowerCase(!caseSensitive);
                let matchFunctions;
                let generateFunctions;
                if (queryParamMatch) {
                    const queryParamName = queryParamMatch[1];
                    const queryParamValue = routeParams.getParam(queryParamName);
                    matchFunctions = this._getParamMatchFunctions(queryCoupleKey, queryParamName, queryParamValue);
                    generateFunctions = this._getParamGenerateFunctions(queryCoupleKey, queryParamName, queryParamValue);
                    if (queryParamMatch[2] === '*') {
                        matchFunctions.isOptional = true;
                        generateFunctions.isOptional = true;
                    }
                } else {
                    matchFunctions = this._getConstMatchFunctions(queryCoupleKey, queryCoupleParsedValue);
                    generateFunctions = this._getConstGenerateFunctions(queryCoupleKey, queryCoupleParsedValue);
                }
                matchObjects[caseSensitive][queryCoupleKey] = matchFunctions;
                generateObjects[caseSensitive][queryCoupleKey] = generateFunctions;
            }
        }

        this._matchObjects = matchObjects;
        this._generateObjects = generateObjects;
    }

    matchParsedValue (userUri, contextOptions) {
        const matchObject = this._matchObjects[!!contextOptions.caseSensitive];
        const value = userUri.getParsedUri('query').toObject();
        const params = {};

        this._currentUserUriQueryObject = userUri
            .getParsedUri('query')
            .toLowerCase(!contextOptions.caseSensitive)
            .toObject();

        for (let m in matchObject) {
            const matchFunctions = matchObject[m];
            const queryMatchFragment = super.matchParsedValue(userUri, contextOptions, matchFunctions);
            if (queryMatchFragment) {
                if (queryMatchFragment.value !== null || matchFunctions.isOptional) {
                    Object.assign(params, queryMatchFragment.params);
                    continue;
                }
            }
            return null;
        }

        const matchFragment = new MatchFragment(value, params);
        return matchFragment;
    }

    generateParsedValue (userParams, contextOptions) {
        const {partName} = contextOptions;
        const generateObject = this._generateObjects[!!contextOptions.caseSensitive];
        let rawValue = [];

        for (let g in generateObject) {
            const generateFunctions = generateObject[g];
            const queryCoupleParsedValue = super.generateParsedValue(userParams, contextOptions, generateFunctions);
            if (generateFunctions.isOptional && queryCoupleParsedValue.isEmpty()) {
                continue;
            }
            rawValue.push(encodeURIComponent(g) + '=' + encodeURIComponent(queryCoupleParsedValue.toString()));
        }

        rawValue = rawValue.join('&');
        const PartConstructor = getPartConstructor(partName);
        const parsedValue = new PartConstructor(rawValue);
        return parsedValue;
    }

    _getConstMatchFunctions (queryCoupleKey, queryCoupleParsedValue) {
        return [(userUri, contextOptions) => {
            const userUriQueryObject = this._currentUserUriQueryObject;
            const userUriQueryCoupleParsedValue = new QueryComponent(userUriQueryObject[queryCoupleKey]);
            if (userUriQueryCoupleParsedValue.isEmpty()) {
                return null;
            }
            const userUriQueryCoupleString = userUriQueryCoupleParsedValue.toLowerCase(!contextOptions.caseSensitive).toString();
            const queryCoupleString = queryCoupleParsedValue.toLowerCase(!contextOptions.caseSensitive).toString();
            if (userUriQueryCoupleString !== queryCoupleString) {
                return null;
            }
            return new MatchFragment(userUriQueryCoupleParsedValue.toString());
        }];
    }

    _getConstGenerateFunctions (queryCoupleKey, queryCoupleParsedValue) {
        return [(userParams) => queryCoupleParsedValue];
    }

    _getParamMatchFunctions (queryCoupleKey, paramName, paramValue) {
        const getUserUriPart = (userUri) => {
            const userUriQueryObject = this._currentUserUriQueryObject;
            const userUriQueryCoupleParsedValue = new QueryComponent(userUriQueryObject[queryCoupleKey]);
            if (!paramValue.match.length && userUriQueryCoupleParsedValue.isEmpty()) {
                userUriQueryCoupleParsedValue.toString = () => null;
            }
            return userUriQueryCoupleParsedValue;
        };
        return convertMatchItemsToFunctions(paramValue.match, {
            partName: 'queryComponent',
            paramName,
            getUserUriPart
        });
    }

    _getParamGenerateFunctions (queryCoupleKey, paramName, paramValue) {
        return convertGenerateItemsToFunctions(paramValue.generate, {
            partName: 'queryComponent',
            paramName
        });
    }

    _getPartName () {
        return 'query';
    }
}

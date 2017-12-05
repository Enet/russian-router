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
    constructor (partName, templateUri, routeOptions, routeParams) {
        super(...arguments);

        const matchObject = {};
        const generateObject = {};
        const templateUriQuery = templateUri.getParsedUri(partName);
        const templateUriQueryObject = templateUriQuery.toObject();

        for (let templateUriQueryCoupleKey in templateUriQueryObject) {
            let matchFunctions = [];
            let generateFunctions = [];

            const templateUriQueryCoupleValue = templateUriQueryObject[templateUriQueryCoupleKey];
            let queryCoupleKey = new QueryComponent(templateUriQueryCoupleKey).toLowerCase(!routeOptions.caseSensitive);
            let queryCoupleParsedValue = new QueryComponent(templateUriQueryCoupleValue);
            const queryParamMatch = queryCoupleParsedValue.toString().match(getRegExp('param'));
            if (queryParamMatch) {
                const queryParamName = queryParamMatch[1];
                const queryParamValue = routeParams.getParam(queryParamName);
                matchFunctions = this._getParamMatchFunctions(queryCoupleKey, queryParamName, queryParamValue, routeOptions);
                generateFunctions = this._getParamGenerateFunctions(queryCoupleKey, queryParamName, queryParamValue, routeOptions);
            } else {
                matchFunctions = this._getConstMatchFunctions(queryCoupleKey, queryCoupleParsedValue, routeOptions);
                generateFunctions = this._getConstGenerateFunctions(queryCoupleKey, queryCoupleParsedValue, routeOptions);
            }

            matchObject[queryCoupleKey] = matchFunctions;
            generateObject[queryCoupleKey] = generateFunctions;
        }

        this._matchObject = matchObject;
        this._generateObject = generateObject;
    }

    matchParsedValue (userUri) {
        const matchObject = this._matchObject;
        const routeOptions = this._routeOptions;
        const value = userUri.getParsedUri('query').toObject();
        const params = {};

        this._currentUserUriQueryObject = userUri
            .getParsedUri('query')
            .toLowerCase(!routeOptions.caseSensitive)
            .toObject();

        for (let m in matchObject) {
            const matchFunctions = matchObject[m];
            const queryMatchFragment = super.matchParsedValue(userUri, matchFunctions);
            if (queryMatchFragment) {
                Object.assign(params, queryMatchFragment.params);
                continue;
            }
            return null;
        }

        const matchFragment = new MatchFragment(value, params);
        return matchFragment;
    }

    generateParsedValue (userParams, generatingUri) {
        const partName = this._partName;
        const generateObject = this._generateObject;
        let rawValue = [];

        for (let g in generateObject) {
            const generateFunctions = generateObject[g];
            const queryCoupleParsedValue = super.generateParsedValue(userParams, generatingUri, generateFunctions);
            if (queryCoupleParsedValue.isEmpty()) {
                continue;
            }
            rawValue.push(encodeURIComponent(g) + '=' + encodeURIComponent(queryCoupleParsedValue.toString()));
        }

        rawValue = rawValue.join('&');
        const PartConstructor = getPartConstructor(partName);
        const parsedValue = new PartConstructor(rawValue);
        return parsedValue;
    }

    _getConstMatchFunctions (queryCoupleKey, queryCoupleParsedValue, routeOptions) {
        return [(userUri) => {
            const userUriQueryObject = this._currentUserUriQueryObject;
            const userUriQueryCoupleParsedValue = new QueryComponent(userUriQueryObject[queryCoupleKey]);
            if (userUriQueryCoupleParsedValue.isEmpty()) {
                return null;
            }
            const userUriQueryCoupleString = userUriQueryCoupleParsedValue.toLowerCase(!routeOptions.caseSensitive).toString();
            const queryCoupleString = queryCoupleParsedValue.toLowerCase(!routeOptions.caseSensitive).toString();
            if (userUriQueryCoupleString !== queryCoupleString) {
                return null;
            }
            return new MatchFragment(userUriQueryCoupleParsedValue.toString());
        }];
    }

    _getConstGenerateFunctions (queryCoupleKey, queryCoupleParsedValue, routeOptions) {
        return [(userParams) => queryCoupleParsedValue];
    }

    _getParamMatchFunctions (queryCoupleKey, paramName, paramValue, routeOptions) {
        const getUserUriPart = (userUri, partName) => {
            const userUriQueryObject = this._currentUserUriQueryObject;
            return new QueryComponent(userUriQueryObject[queryCoupleKey]);
        };
        return convertMatchItemsToFunctions(paramValue.match, {
            partName: 'queryComponent',
            paramName,
            routeOptions,
            getUserUriPart
        });
    }

    _getParamGenerateFunctions (queryCoupleKey, paramName, paramValue, routeOptions) {
        return convertGenerateItemsToFunctions(paramValue.generate, {
            partName: 'queryComponent',
            paramName,
            routeOptions
        });
    }
}

import {
    getRegExp,
    getPartClass
} from './utils.js';
import DefaultTemplate from './DefaultTemplate.js';
import MatchFragment from './MatchFragment.js';
import QueryComponent from './QueryComponent.js';

export default class ConstQueryTemplate extends DefaultTemplate {
    constructor (templateUri, routeParams, routeOptions, partName) {
        super(...arguments);

        const matchObject = {};
        const generateObject = {};

        const templateUriQuery = templateUri.getParsedUri(partName);
        const templateUriQueryObject = templateUriQuery.toObject();
        for (let templateUriQueryKey in templateUriQueryObject) {
            let queryKey = new QueryComponent(templateUriQueryKey).toLowerCase(!routeOptions.caseSensitive);
            let queryValue = new QueryComponent(templateUriQueryObject[templateUriQueryKey]).toLowerCase(!routeOptions.caseSensitive);

            const queryParamMatch = queryValue.toString().match(getRegExp('param'));
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
                    matchParams[queryParamName] = userUriPart.toLowerCase(!routeOptions.caseSensitive).toString();
                    return new MatchFragment(matchParams[queryParamName], matchParams);
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
        const Constructor = getPartClass(this._partName);
        return new Constructor(rawValue);
    }
}

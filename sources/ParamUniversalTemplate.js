import {
    convertMatchItemToFunction,
    convertGenerateItemToFunction,
    getPartClass,
    getDefaultPart,
    getRegExp
} from './utils.js';
import DefaultTemplate from './DefaultTemplate.js';
import MatchFragment from './MatchFragment.js';

export default class ParamUniversalTemplate extends DefaultTemplate {
    constructor (templateUri, routeParams, routeOptions, partName) {
        super(...arguments);

        const rawTemplate = templateUri.getSplittedUri(partName);
        const paramMatch = rawTemplate.match(getRegExp('param'));
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

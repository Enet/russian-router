import {
    convertMatchItemToFunction,
    convertGenerateItemToFunction,
    getPartConstructor,
    getDefaultPart,
    getRegExp
} from './utils.js';
import DefaultTemplate from './DefaultTemplate.js';
import MatchFragment from './MatchFragment.js';

export default class ParamUniversalTemplate extends DefaultTemplate {
    constructor (partName, templateUri, routeOptions, routeParams) {
        super(...arguments);

        const rawTemplate = templateUri.getSplittedUri(partName);
        const paramMatch = rawTemplate.match(getRegExp('param'));
        const paramName = paramMatch[1];
        const paramValue = routeParams.getParam(paramName);

        this._matchFunctions = paramValue.match.map((matchItem) => {
            return convertMatchItemToFunction(matchItem, routeOptions, partName, paramName);
        });
        if (!this._matchFunctions.length) {
            this._matchFunctions.push((userUri) => {
                const matchParams = {};
                const userUriPart = userUri.getParsedUri(partName);
                matchParams[paramName] = userUriPart.toLowerCase(!routeOptions.caseSensitive).toString();
                return new MatchFragment(matchParams[paramName], matchParams);
            });
        }

        this._generateFunctions = paramValue.generate.map((generateItem) => {
            return convertGenerateItemToFunction(generateItem, routeOptions, partName, paramName);
        });
        this._generateFunctions.push((userParams) => {
            const userParam = userParams[paramName];
            const PartConstructor = getPartConstructor(partName);
            let parsedValue = new PartConstructor(userParam);
            if (parsedValue.isEmpty()) {
                parsedValue = getDefaultPart(partName);
            }
            return parsedValue.toLowerCase(!routeOptions.caseSensitive);
        });
    }
}

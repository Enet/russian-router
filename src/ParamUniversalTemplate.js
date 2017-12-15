import {
    convertMatchItemsToFunctions,
    convertGenerateItemsToFunctions,
    getRegExp
} from './utils.js';
import DefaultTemplate from './DefaultTemplate.js';

const getUserUriPart = (userUri, partName) => userUri.getParsedUri(partName);

export default class ParamUniversalTemplate extends DefaultTemplate {
    constructor (templateUri, routeParams) {
        super(...arguments);

        const rawTemplate = templateUri.getSplittedUri(this._partName);
        const paramMatch = rawTemplate.match(getRegExp('param'));
        this._paramName = paramMatch[1];
        this._paramValue = routeParams.getParam(this._paramName);
        this._initMatchGenerateFunctions(...arguments);
    }

    _getMatchFunctions (templateUri) {
        const partName = this._partName;
        const paramName = this._paramName;
        const paramValue = this._paramValue;

        return convertMatchItemsToFunctions(paramValue.match, {
            partName,
            paramName,
            getUserUriPart
        });
    }

    _getGenerateFunctions (templateUri) {
        const partName = this._partName;
        const paramName = this._paramName;
        const paramValue = this._paramValue;

        return convertGenerateItemsToFunctions(paramValue.generate, {
            partName,
            paramName
        });
    }
}

import {
    convertMatchItemsToFunctions,
    convertGenerateItemsToFunctions,
    getRegExp
} from './utils.js';
import DefaultTemplate from './DefaultTemplate.js';

const getUserUriPart = (userUri, partName) => userUri.getParsedUri(partName);

export default class ParamUniversalTemplate extends DefaultTemplate {
    constructor (partName, templateUri, routeOptions, routeParams) {
        super(...arguments);

        const rawTemplate = templateUri.getSplittedUri(partName);
        const paramMatch = rawTemplate.match(getRegExp('param'));
        this._paramName = paramMatch[1];
        this._paramValue = routeParams.getParam(this._paramName);
    }

    _getMatchFunctions (partName, templateUri, routeOptions) {
        const paramName = this._paramName;
        const paramValue = this._paramValue;

        return convertMatchItemsToFunctions(paramValue.match, {
            partName,
            paramName,
            routeOptions,
            getUserUriPart
        });
    }

    _getGenerateFunctions (partName, templateUri, routeOptions) {
        const paramName = this._paramName;
        const paramValue = this._paramValue;

        return convertGenerateItemsToFunctions(paramValue.generate, {
            partName,
            paramName,
            routeOptions
        })
    }
}

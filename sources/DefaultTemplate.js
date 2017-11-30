export default class DefaultTemplate {
    constructor (partName, templateUri, routeOptions, routeParams) {
        this._partName = partName;
        this._templateUri = templateUri;
        this._routeOptions = routeOptions;
        this._routeParams = routeParams;
    }

    matchParsedValue (userUri, matchFunctions=this._matchFunctions) {
        const partName = this._partName;
        const routeOptions = this._routeOptions;
        for (let matchFunction of matchFunctions) {
            const matchFragment = matchFunction(userUri, partName, routeOptions);
            if (matchFragment) {
                return matchFragment;
            }
        }
        return null;
    }

    generateParsedValue (userParams, generatingUri, generateFunctions=this._generateFunctions) {
        const partName = this._partName;
        const routeOptions = this._routeOptions;
        let parsedValue;
        for (let generateFunction of generateFunctions) {
            parsedValue = generateFunction(userParams, generatingUri, partName, routeOptions);
            if (!parsedValue.isEmpty()) {
                return parsedValue;
            }
        }
        return parsedValue;
    }

    _getMatchFunctions (partName, templateUri, routeOptions, routeParams) {
        return [];
    }

    _getGenerateFunctions (partName, templateUri, routeOptions, routeParams) {
        return [];
    }

    _initMatchGenerateFunctions () {
        this._matchFunctions = this._getMatchFunctions(...arguments);
        this._generateFunctions = this._getGenerateFunctions(...arguments);
    }
}

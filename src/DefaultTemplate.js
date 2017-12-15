export default class DefaultTemplate {
    constructor (templateUri, routeParams, routeName) {
        this._partName = this._getPartName();
        this._templateUri = templateUri;
        this._routeParams = routeParams;
        this._routeName = routeName;
    }

    matchParsedValue (userUri, contextOptions, matchFunctions=this._matchFunctions) {
        for (let matchFunction of matchFunctions) {
            const matchFragment = matchFunction(userUri, contextOptions);
            if (matchFragment) {
                return matchFragment;
            }
        }
        return null;
    }

    generateParsedValue (userParams, contextOptions, generateFunctions=this._generateFunctions) {
        let parsedValue;
        for (let generateFunction of generateFunctions) {
            parsedValue = generateFunction(userParams, contextOptions);
            if (!parsedValue.isEmpty()) {
                return parsedValue;
            }
        }
        return parsedValue;
    }

    _getMatchFunctions (templateUri, routeParams) {
        return [];
    }

    _getGenerateFunctions (templateUri, routeParams) {
        return [];
    }

    _getPartName () {
        throw 'Part name must be defined for the template!';
    }

    _initMatchGenerateFunctions () {
        this._matchFunctions = this._getMatchFunctions(...arguments);
        this._generateFunctions = this._getGenerateFunctions(...arguments);
    }
}

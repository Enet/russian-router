export default class DefaultTemplate {
    constructor (templateUri, routeParams, routeOptions, partName) {
        this._templateUri = templateUri;
        this._routeParams = routeParams;
        this._routeOptions = routeOptions;
        this._partName = partName;
    }

    matchParsedValue (userUri, matchMap=this._matchMap) {
        for (let matchFunction of matchMap) {
            const matchFragment = matchFunction(userUri);
            if (matchFragment) {
                return matchFragment;
            }
        }
        return null;
    }

    generateParsedValue (userParams, generateMap=this._generateMap) {
        let parsedValue;
        for (let generateFunction of generateMap) {
            parsedValue = generateFunction(userParams);
            if (!parsedValue.isEmpty()) {
                return parsedValue;
            }
        }
        return parsedValue;
    }
}

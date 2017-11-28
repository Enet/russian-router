import {
    isEmpty,
    isMatchGenerate
} from './utils.js';

const emptyMatchGenerate = {
    match: [],
    generate: []
};

export default class RouteParams {
    constructor (rawRouteParams) {
        const parsedParams = {};
        for (let r in rawRouteParams) {
            let rawRouteParam = rawRouteParams[r];
            if (isMatchGenerate(rawRouteParam)) {
                rawRouteParam.match = RouteParams.normalizeItems(rawRouteParam.match);
                rawRouteParam.generate = RouteParams.normalizeItems(rawRouteParam.generate);
            } else {
                rawRouteParam = {
                    match: RouteParams.normalizeItems(rawRouteParam),
                    generate: RouteParams.normalizeItems()
                };
            }
            if (rawRouteParam.match.length || rawRouteParam.generate.length) {
                if (!rawRouteParam.generate.length) {
                    rawRouteParam.generate = RouteParams.completeGenerateItems(rawRouteParam.match);
                }
                parsedParams[r] = rawRouteParam;
            }
        }

        this._parsedParams = parsedParams;
    }

    getParam (paramName) {
        return this._parsedParams[paramName] || emptyMatchGenerate;
    }

    static completeGenerateItems (matchItems) {
        for (let matchItem of matchItems) {
            if (typeof matchItem !== 'function' && matchItem instanceof RegExp === false) {
                return [matchItem];
            }
        }
        return [];
    }

    static normalizeItems (rawRouteParamItems) {
        if (rawRouteParamItems instanceof Array) {
            const filteredRouteParamItems = rawRouteParamItems.filter((rawRouteParamItem) => !isEmpty(rawRouteParamItem));
            if (filteredRouteParamItems.length) {
                return filteredRouteParamItems;
            }
        } else if (!isEmpty(rawRouteParamItems)) {
            return [rawRouteParamItems];
        }
        return [];
    }
}

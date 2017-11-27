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
                rawRouteParam.match = RouteParams.normalizeSection(rawRouteParam.match);
                rawRouteParam.generate = RouteParams.normalizeSection(rawRouteParam.generate);
            } else {
                rawRouteParam = {
                    match: RouteParams.normalizeSection(rawRouteParam),
                    generate: RouteParams.normalizeSection()
                };
            }
            if (rawRouteParam.match.length || rawRouteParam.generate.length) {
                if (!rawRouteParam.generate.length) {
                    rawRouteParam.generate = RouteParams.completeGenerateSection(rawRouteParam.match);
                }
                parsedParams[r] = rawRouteParam;
            }
        }

        this._parsedParams = parsedParams;
    }

    getParam (paramName) {
        return this._parsedParams[paramName] || emptyMatchGenerate;
    }

    static completeGenerateSection (matchSection) {
        for (let matchItem of matchSection) {
            if (typeof matchItem !== 'function' && matchItem instanceof RegExp === false) {
                return [matchItem];
            }
        }
        return [];
    }

    static normalizeSection (rawRouteParamSection) {
        if (rawRouteParamSection instanceof Array) {
            const filteredRouteParam = rawRouteParamSection.filter((rawRouteParamItem) => !isEmpty(rawRouteParamItem));
            if (filteredRouteParam.length) {
                return filteredRouteParam;
            }
        } else if (!isEmpty(rawRouteParamSection)) {
            return [rawRouteParamSection];
        }
        return [];
    }
}

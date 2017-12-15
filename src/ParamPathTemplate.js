import ParamUniversalTemplate from './ParamUniversalTemplate.js';
import RouterError from './RouterError.js';

export default class ParamPathTemplate extends ParamUniversalTemplate {
    constructor () {
        super(...arguments);

        const matchItems = this._paramValue.match;
        for (let matchItem of matchItems) {
            if (typeof matchItem !== 'function') {
                const {routeName} = this._routeName;
                throw new RouterError(RouterError.FUNCTION_EXPECTED, {
                    entity: this._getPartName(),
                    routeName
                });
            }
        }
    }

    _getPartName () {
        return 'path';
    }
}

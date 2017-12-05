import {
    getRegExp
} from './utils.js';
import Uri from './Uri.js';
import RouterError from './RouterError.js';

export default class TemplateUri extends Uri {
    constructor (rawUri, routeName) {
        super(rawUri);
        this._routeName = routeName;
    }

    _getRegExp () {
        return getRegExp('template');
    }

    _handleError (error) {
        const routeName = this._routeName;
        throw new RouterError(RouterError[error.code], {
            entity: 'URI template',
            routeName
        });
    }
}

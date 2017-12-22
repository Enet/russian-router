import {
    getRegExp
} from './utils.js';
import Uri from './Uri.js';
import RouterError from './RouterError.js';

export default class TemplateUri extends Uri {
    constructor (rawUri, routeName) {
        super(rawUri);
        this._routeName = routeName;

        const parsedPathArray = this._value.parsedUri.path.toArray();
        if (parsedPathArray.length > 1) {
            const emptyPathComponentIndex = parsedPathArray.findIndex((component) => {
                return !component;
            });
            if (emptyPathComponentIndex !== -1) {
                throw new RouterError(RouterError.PATH_COMPONENT_EXPECTED, {routeName});
            }
        }
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

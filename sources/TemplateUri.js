import {
    getRegExp
} from './utils.js';
import Uri from './Uri.js';

export default class TemplateUri extends Uri {
    getName () {
        return 'URI template';
    }

    getRegExp () {
        return getRegExp('template');
    }
}

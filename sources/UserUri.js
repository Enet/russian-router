import {
    getPortByParsedUri
} from './utils.js';
import Uri from './Uri.js';

export default class UserUri extends Uri {
    constructor (rawUri, getDefaultPrt) {
        super(rawUri);
        const parsedPort = getPortByParsedUri(this._value.parsedUri, getDefaultPrt);
        this._value.parsedUri.port = parsedPort;
        this._value.splittedUri.port = parsedPort.toString() || null;
    }
}

import Uri from './Uri.js';

export default class UserUri extends Uri {
    constructor () {
        super(...arguments);
        const parsedPort = getPortByParsedUri(this._value.parsedUri);
        this._value.parsedUri.port = parsedPort;
        this._value.splittedUri.port = parsedPort.toString() || null;
    }
}

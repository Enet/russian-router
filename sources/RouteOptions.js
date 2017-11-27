import DefaultOptions from './DefaultOptions.js';

export default class RouteOptions extends DefaultOptions {
    constructor (rawOptions, defaultOptions) {
        super(rawOptions, defaultOptions);
        this.priority = +rawOptions.priority || 0;
    }
}

import {
    toLowerCase,
    toUpperCase,
    toTitleCase
} from './utils.js';

export default class RouterError extends Error {
    constructor (getErrorMessage, errorOptions={}) {
        let message = getErrorMessage(errorOptions);
        if (errorOptions.routeName) {
            message += ` Check the route ${routeName}.`;
        }

        super(message);
    }
}

Object.assign(RouterError, {
    INVALID_ROUTE_NAME: ({desiredRouteName}) => `Invalid route's name; ${desiredRouteName} was not found!`,
    INVALID_INPUT_TYPE: ({entity, type}) => `${toTitleCase(entity)} should be presented by ${toLowerCase(type)}.`,
    INVALID_URI_STRUCTURE: ({entity}) => `${toTitleCase(entity)} cannot be splitted because it has invalid structure.`,
    INVALID_PATH_STRUCTURE: ({entity}) => `Path in ${toLowerCase(entity)} must be absolute when domain is specified!`,
    INCONSISTENT_DATA: () => `Data is inconsistent; generated URI cannot be matched.`
});

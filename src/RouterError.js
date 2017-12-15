import {
    toLowerCase,
    toTitleCase
} from './utils.js';

export default class RouterError extends Error {
    constructor (getErrorMessage, errorOptions={}) {
        let message = getErrorMessage(errorOptions);
        const {routeName} = errorOptions;
        if (routeName) {
            message += ` Check the route ${routeName}.`;
        }

        super(message);
    }
}

Object.assign(RouterError, {
    INVALID_ROUTE_NAME: ({desiredRouteName}) => `Invalid route's name; ${desiredRouteName} was not found!`,
    INVALID_INPUT_TYPE: ({entity, type}) => `${toTitleCase(entity)} must be presented by ${toLowerCase(type)}.`,
    INVALID_URI_STRUCTURE: ({entity}) => `${toTitleCase(entity)} cannot be splitted because it has invalid structure.`,
    INVALID_PATH_STRUCTURE: ({entity}) => `Path in ${toLowerCase(entity)} must be absolute when domain is specified!`,
    INVALID_DEFAULT_GETTER: () => `Method getDefaultPart must be presented by function that returns instances of default URI components.`,
    INCONSISTENT_DATA: () => `Data is inconsistent; generated URI cannot be matched.`,
    MATCH_FRAGMENT_EXPECTED: () => `Match function must return null or MatchFragment's instance.`,
    FUNCTION_EXPECTED: ({entity}) => `Only function could be used as parameter for the whole ${toLowerCase(entity)}.`,
    DOMAIN_EXPECTED: () => `URI must contain not empty domain when protocol or port is specified.`,
    ABSOLUTE_PATH_EXPECTED: ({currentPath}) => `Matching URI path must be absolute. Current path is ${currentPath}.`,
    CUSTOM_ERROR: ({message}) => `${message}`
});

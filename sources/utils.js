import Protocol from './Protocol.js';
import Domain from './Domain.js';
import Port from './Port.js';
import Path from './Path.js';
import Query from './Query.js';
import Hash from './Hash.js';
import PathComponent from './PathComponent.js';
import QueryComponent from './QueryComponent.js';
import MatchFragment from './MatchFragment.js';
import RouterError from './RouterError.js';

import ParamProtocolTemplate from './ParamProtocolTemplate.js';
import ParamDomainTemplate from './ParamDomainTemplate.js';
import ParamPortTemplate from './ParamPortTemplate.js';
import ParamPathTemplate from './ParamPathTemplate.js';
import ParamQueryTemplate from './ParamQueryTemplate.js';
import ParamHashTemplate from './ParamHashTemplate.js';
import ConstProtocolTemplate from './ConstProtocolTemplate.js';
import ConstDomainTemplate from './ConstDomainTemplate.js';
import ConstPortTemplate from './ConstPortTemplate.js';
import ConstPathTemplate from './ConstPathTemplate.js';
import ConstQueryTemplate from './ConstQueryTemplate.js';
import ConstHashTemplate from './ConstHashTemplate.js';



export const toLowerCase = (value='') => {
    return value.toLowerCase();
};

export const toUpperCase = (value='') => {
    return value.toUpperCase();
};

export const toTitleCase = (value='') => {
    return value.substr(0, 1).toUpperCase() + value.substr(1);
};

export const isEmpty = (value) => {
    return value === null || value === undefined;
};

export const isMatchGenerate = (value) => {
    return value && typeof value === 'object' && (value.match || value.generate);
};

export const isMatchFragment = (value) => {
    if (value === null) {
        return true;
    }
    return value && value.hasOwnProperty('value') && value.hasOwnProperty('params');
};

export const forEachPartName = (callback) => {
    partNames.forEach(callback);
};

export const getPartConstructor = (partName) => {
    return partConstructors[partName];
};

export const getDefaultPart = (partName) => {
    const PartConstructor = getPartConstructor(partName);
    return new PartConstructor();
};

export const getPortByProtocol = (protocol) => {
    protocol = (protocol + '').toLowerCase();
    return protocolByPort[protocol] || null;
};

export const getRegExp = (regExpName) => {
    return regExps[regExpName];
};

export const getPortByParsedUri = (parsedUri) => {
    const parsedPort = parsedUri.port;
    if (parsedPort.isEmpty()) {
        if (parsedUri.domain.isEmpty()) {
            const defaultPort = getDefaultPart('port');
            if (defaultPort.isEmpty()) {
                const defaultProtocol = getDefaultPart('protocol');
                const portByDefaultProtocol = getPortByProtocol(defaultProtocol.toLowerCase(true).toString());
                if (portByDefaultProtocol.isEmpty()) {
                    return defaultPort;
                } else {
                    return portByDefaultProtocol;
                }
            } else {
                return defaultPort;
            }
        } else {
            const currentProtocol = parsedUri.protocol.isEmpty() ? getDefaultPart('protocol') : parsedUri.protocol;
            const portByCurrentProtocol = getPortByProtocol(currentProtocol.toLowerCase(true).toString());
            if (portByCurrentProtocol.isEmpty()) {
                return parsedPort;
            } else {
                return portByCurrentProtocol;
            }
        }
    } else {
        return parsedPort;
    }
};

export const chooseTemplate = (templateUri, partName) => {
    let templateType;
    const rawTemplate = templateUri.getSplittedUri(partName);

    if (rawTemplate) {
        const paramTest = getRegExp('param').test(rawTemplate);
        templateType = paramTest ? 'Param' : 'Const';
    } else {
        templateType = 'Const';
    }

    const templateName = templateType + toTitleCase(partName) + 'Template';
    return partTemplates[templateName];
};

export const parseSplittedUriPart = (rawUriPart, regExp) => {
    if (!rawUriPart) {
        return null;
    }
    if (regExp) {
        rawUriPart = rawUriPart.replace(regExp, '');
    }
    return rawUriPart || null;
};

export const splitUri = (rawUri, regExp, entityName) => {
    const uriMatch = rawUri.match(regExp);

    if (!uriMatch) {
        const uriStructureError = new Error('URI has invalid structure and cannot be splitted!');
        uriStructureError.code = 'INVALID_URI_STRUCTURE';
        throw uriStructureError;
    }
    if (uriMatch[3] && uriMatch[5][0] !== '/' && !getRegExp('param').test(uriMatch[5])) {
        if (uriMatch[5]) {
            const pathStructureError = new Error('Path must be absolute when domain is specified!');
            pathStructureError.code = 'INVALID_PATH_STRUCTURE';
            throw pathStructureError;
        } else {
            uriMatch[5] = '/';
        }
    }

    const splittedUri = {};
    forEachPartName((partName, p) => {
        const regExp = splittedUriPartRegExps[partName];
        splittedUri[partName] = parseSplittedUriPart(uriMatch[p + 1], regExp);
    });
    return splittedUri;
};

export const joinUri = (parsedUri) => {
    const {
        protocol,
        domain,
        port,
        path,
        query,
        hash
    } = parsedUri;

    let rawUri = '';
    if (!protocol.isEmpty()) {
        rawUri += protocol + ':';
    }
    if (!protocol.isEmpty() || !domain.isEmpty() || !port.isEmpty()) {
        rawUri += '//' + domain;
        if (!port.isEmpty()) {
            rawUri += ':' + port;
        }
    }
    rawUri += path;
    if (!query.isEmpty()) {
        rawUri += '?' + query;
    }
    if (!hash.isEmpty()) {
        rawUri += '#' + hash;
    }
    return rawUri;
};

export const getMatchFunctionByItem = (matchItem, {partName, paramName, routeOptions, getUserUriPart}) => {
    if (typeof matchItem === 'function') {
        return (userUri) => {
            const matchFragment = matchItem(userUri, partName, paramName, routeOptions);
            if (!isMatchFragment(matchFragment)) {
                throw new RouterError(RouterError.MATCH_FRAGMENT_EXPECTED);
            }
            return matchFragment;
        };
    } else if (matchItem instanceof RegExp) {
        if (!routeOptions.caseSensitive && matchItem.flags.indexOf('i') === -1) {
            matchItem = new RegExp(matchItem.source, matchItem.flags + 'i');
        }
        return (userUri) => {
            const userUriPart = getUserUriPart(userUri, partName);
            const rawValue = userUriPart.toString();
            if (!matchItem.test(rawValue)) {
                return null;
            }
            return new MatchFragment(rawValue, {[paramName]: rawValue});
        };
    } else {
        const PartConstructor = getPartConstructor(partName);
        const templateUriPart = new PartConstructor(matchItem);
        const templateUriPartString = templateUriPart.toLowerCase(!routeOptions.caseSensitive).toString();
        return (userUri) => {
            const userUriPart = getUserUriPart(userUri, partName);
            const userUriPartString = userUriPart.toLowerCase(!routeOptions.caseSensitive).toString();
            if (userUriPartString === templateUriPartString) {
                const rawValue = userUriPart.toString();
                return new MatchFragment(rawValue, {[paramName]: rawValue});
            }
            return null;
        };
    }
};

export const getFallbackMatchFunction = ({partName, paramName, routeOptions, getUserUriPart}) => {
    return (userUri) => {
        const matchParams = {};
        const userUriPart = getUserUriPart(userUri, partName);
        matchParams[paramName] = userUriPart.toLowerCase(!routeOptions.caseSensitive).toString();
        return new MatchFragment(matchParams[paramName], matchParams);
    };
};

export const convertMatchItemsToFunctions = (matchItems, converterOptions) => {
    const matchFunctions = matchItems.map((matchItem) => {
        return getMatchFunctionByItem(matchItem, converterOptions);
    });
    if (!matchFunctions.length) {
        matchFunctions.push(getFallbackMatchFunction(converterOptions));
    }
    return matchFunctions;
};

export const getGenerateFunctionByItem = (generateItem, {partName, paramName, routeOptions}) => {
    const PartConstructor = getPartConstructor(partName);
    return (userParams) => {
        const rawValue = typeof generateItem === 'function' ?
            generateItem(userParams, partName, paramName, routeOptions) :
            generateItem;
        const parsedValue = new PartConstructor(rawValue);
        return parsedValue;
    };
};

export const getFallbackGenerateFunction = ({partName, paramName, routeOptions}) => {
    const PartConstructor = getPartConstructor(partName);
    return (userParams) => {
        const userParam = userParams[paramName];
        let parsedValue = new PartConstructor(userParam);
        if (parsedValue.isEmpty()) {
            parsedValue = getDefaultPart(partName);
        }
        return parsedValue;
    };
};

export const convertGenerateItemsToFunctions = (generateItems, converterOptions) => {
    const generateFunctions = generateItems.map((generateItem) => {
        return getGenerateFunctionByItem(generateItem, converterOptions);
    });
    generateFunctions.push(getFallbackGenerateFunction(converterOptions));
};



const partTemplates = {
    ParamProtocolTemplate,
    ParamDomainTemplate,
    ParamPortTemplate,
    ParamPathTemplate,
    ParamQueryTemplate,
    ParamHashTemplate,
    ConstProtocolTemplate,
    ConstDomainTemplate,
    ConstPortTemplate,
    ConstPathTemplate,
    ConstQueryTemplate,
    ConstHashTemplate
};

const partNames = [
    'protocol',
    'domain',
    'port',
    'path',
    'query',
    'hash'
];

const partConstructors = {
    protocol: Protocol,
    domain: Domain,
    port: Port,
    path: Path,
    query: Query,
    hash: Hash,
    queryComponent: QueryComponent,
    pathComponent: PathComponent
};

const protocolByPort = {
    ftp: 21,
    ssh: 22,
    telnet: 23,
    smtp: 25,
    dns: 53,
    dhcp: 68,
    tftp: 69,
    http: 80,
    pop: 110,
    ntp: 123,
    imap: 143,
    snmp: 162,
    bgp: 179,
    https: 443,
    ldaps: 636
};

const regExps = {
    uri: /^(([-.+A-z0-9]+:)?\/\/([A-z0-9.]+)(:[0-9]+)?)?([^?#]*)(\?[^#]*)?(#.*)?$/i,
    template: /^(((?:[-.+A-z0-9]+|{[A-z0-9]+}):)?\/\/((?:[A-z0-9.]+|{[A-z0-9]+}))(:(?:[0-9]+|{[A-z0-9]+}))?)?([^?#]*)(\?[^#]*)?(#.*)?$/i,
    param: /^{([^*}]*)(\*)?}$/
};

const splittedUriPartRegExps = {
    protocol: /:$/,
    domain: null,
    port: /^:/,
    path: null,
    query: /^\?/,
    hash: /^#/
};

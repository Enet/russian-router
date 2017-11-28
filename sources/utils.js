import Protocol from './Protocol.js';
import Domain from './Domain.js';
import Port from './Port.js';
import Path from './Path.js';
import Query from './Query.js';
import Hash from './Hash.js';
import PathComponent from './PathComponent.js';
import QueryComponent from './QueryComponent.js';
import MatchFragment from './MatchFragment.js';

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
    return templates[templateName];
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

export const convertMatchItemToFunction = (matchItem, routeOptions, partName, paramName, ...restOptions) => {
    let substituteUserUri;
    if (partName === 'queryComponent' || partName === 'pathComponent') {
        substituteUserUri = (userUri) => ({
            getParsedUri: () => new QueryComponent(userUri.getParsedUri('query').toObject()[paramName])
        });
    } else if (partName === 'pathComponent') {
        substituteUserUri = (userUri) => ({
            getParsedUri: () => new PathComponent(userUri.getParsedUri('path').toArray()[restOptions[0]])
        });
    } else {
        substituteUserUri = (userUri) => userUri;
    }

    if (typeof matchItem === 'function') {
        return (userUri) => {
            const matchFragment = matchItem(userUri, routeOptions, partName, paramName);
            if (matchFragment !== null && matchFragment instanceof MatchFragment === false) {
                throw 'Function to match route param must return either null or instance of MatchFragment!';
            }
            return matchFragment;
        };
    } else if (matchItem instanceof RegExp) {
        if (!routeOptions.caseSensitive && matchItem.flags.indexOf('i') === -1) {
            matchItem = new RegExp(matchItem.source, matchItem.flags + 'i');
        }
        return (userUri) => {
            userUri = substituteUserUri(userUri);
            const rawValue = userUri.getParsedUri(partName).toLowerCase(!routeOptions.caseSensitive).toString();
            if (!matchItem.test(rawValue)) {
                return null;
            }
            return new MatchFragment(rawValue, {[paramName]: rawValue});
        };
    } else {
        const PartConstructor = getPartConstructor(partName);
        const templateUriPart = new Constructor(matchItem).toLowerCase(!routeOptions.caseSensitive);
        return (userUri) => {
            userUri = substituteUserUri(userUri);
            const userUriPart = userUri.getParsedUri(partName).toLowerCase(!routeOptions.caseSensitive);
            const userUriPartString = userUriPart.toString();
            if (userUriPartString === templateUriPart.toString()) {
                return new MatchFragment(userUriPartString, {[paramName]: userUriPartString});
            }
            return null;
        };
    }
};

export const convertGenerateItemToFunction = (generateItem, routeOptions, partName, paramName) => {
    if (typeof generateItem === 'function') {
        return (userParams) => {
            const rawValue = generateItem(userParams, routeOptions, partName, paramName);
            const PartConstructor = getPartConstructor(partName);
            const parsedValue = new Constructor(rawValue);
            return parsedValue.toLowerCase(!routeOptions.caseSensitive);
        };
    } else {
        return (userParams) => {
            const PartConstructor = getPartConstructor(partName);
            const parsedValue = new Constructor(generateItem);
            return parsedValue.toLowerCase(!routeOptions.caseSensitive);
        };
    }
};



const templates = {
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

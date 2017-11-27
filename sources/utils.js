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



export const isEmpty = (value) => {
    return value === null || value === undefined;
};

export const isMatchGenerate = (value) => {
    return value && typeof value === 'object' && (value.match || value.generate);
};

export const forEachPartName = (callback) => {
    partNames.forEach(callback);
};

export const getRegExp = (regExpName) => {
    return regExps[regExpName];
};

export const mergeParams = (...matchFragments) => {
    const params = {};
    for (let matchFragment of matchFragments) {
        Object.assign(params, matchFragment.params);
    }
    return params;
}

export const chooseTemplate = (templateUri, partName) => {
    let templateType;
    const rawTemplate = templateUri.getSplittedUri(partName);

    if (rawTemplate) {
        const paramMatch = rawTemplate.match(getRegExp('param'));
        templateType = paramMatch ? 'Param' : 'Const';
    } else {
        templateType = 'Const';
    }

    const templateName = templateType + partName[0].toUpperCase() + partName.substr(1) + 'Template';
    return templates[templateName];
};

export const splitUri = (rawUri, regExp, entityName) => {
    const match = rawUri.match(regExp);

    if (!match) {
        throw 'Invalid ' + entityName + ' cannot be splitted!';
    }
    if (match[3] && match[5][0] !== '/' && !getRegExp('param').test(match[5])) {
        if (match[5]) {
            throw 'Path should be absolute when domain is specified!';
        } else {
            match[5] = '/';
        }
    }

    const protocol = match[2] ? match[2].replace(/:$/, '') : null;
    const domain = match[3] || null;
    const port = match[4] ? match[4].replace(/^:/, '') : null;
    const path = match[5] || null;
    const query = match[6] ? match[6].replace(/^\?/, '') : null;
    const hash = match[7] ? match[7].replace(/^#/, '') : null;

    return {
        protocol,
        domain,
        port,
        path,
        query,
        hash
    };
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
    if (!parsedUri.protocol.isEmpty()) {
        rawUri += parsedUri.protocol + ':';
    }
    if (!parsedUri.protocol.isEmpty() || !parsedUri.domain.isEmpty() || !parsedUri.port.isEmpty()) {
        rawUri += '//' + parsedUri.domain;
        if (!parsedUri.port.isEmpty()) {
            rawUri += ':' + parsedUri.port;
        }
    }
    rawUri += parsedUri.path;
    if (!parsedUri.query.isEmpty()) {
        rawUri += '?' + parsedUri.query;
    }
    if (!parsedUri.hash.isEmpty()) {
        rawUri += '#' + parsedUri.hash;
    }
    return rawUri;
};

export const getPortByProtocol = (protocol) => {
    protocol = (protocol + '').toLowerCase();
    return protocolToPort[protocol] || null;
};

export const getDefaultProtocol = () => {
    return new Protocol();
};

export const getDefaultDomain = () => {
    return new Domain();
};

export const getDefaultPort = () => {
    return new Port();
};

export const getDefaultPath = () => {
    return new Path();
};

export const getDefaultQuery = () => {
    return new Query();
};

export const getDefaultHash = () => {
    return new Hash();
};

export const getDefaultPart = (partName) => {
    return defaultParts[partName]();
};

export const getPartClass = (partName) => {
    return partClasses[partName];
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
        const templateUriPart = new partClasses[partName](matchItem).toLowerCase(!routeOptions.caseSensitive);
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
            const parsedValue = new partClasses[partName](rawValue);
            return parsedValue.toLowerCase(!routeOptions.caseSensitive);
        };
    } else {
        return (userParams) => {
            const parsedValue = new partClasses[partName](generateItem);
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

const defaultParts = {
    protocol: getDefaultProtocol,
    domain: getDefaultDomain,
    port: getDefaultPort,
    path: getDefaultPath,
    query: getDefaultQuery,
    hash: getDefaultHash
};

const partClasses = {
    protocol: Protocol,
    domain: Domain,
    port: Port,
    path: Path,
    query: Query,
    hash: Hash,
    queryComponent: QueryComponent
};

const protocolToPort = {
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

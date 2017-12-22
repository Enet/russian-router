import {
    utils
} from 'russian-router';

const Protocol = utils.getPartConstructor('protocol');
const Domain = utils.getPartConstructor('domain');
const Port = utils.getPartConstructor('port');

const normalRouterMock = {
    getDefaultPart: (partName) => ({
        protocol: new Protocol('https'),
        domain: new Domain('localhost'),
        port: new Port(8080)
    })[partName]
};
const unknownProtocolRouterMock = {
    getDefaultPart: (partName) => ({
        protocol: new Protocol('unknown'),
        domain: new Domain('localhost'),
        port: new Port(1234)
    })[partName]
};
const emptyPortRouterMock = {
    getDefaultPart: (partName) => ({
        protocol: new Protocol('http'),
        domain: new Domain('localhost'),
        port: new Port()
    })[partName]
};
const absolutelyEmptyRouterMock = {
    getDefaultPart: (partName) => ({
        protocol: new Protocol(),
        domain: new Domain('localhost'),
        port: new Port()
    })[partName]
};

test('Function getPortByParsedUri returns specified port, if it is specified', () => {
    expect(utils.getPortByParsedUri({
        protocol: new Protocol(),
        domain: new Domain('localhost'),
        port: new Port(90)
    }, {
        router: normalRouterMock
    }).toString()).toBe('90');
});

test('Function getPortByParsedUri returns port by uri protocol, if uri protocol is specified', () => {
    expect(utils.getPortByParsedUri({
        protocol: new Protocol('https'),
        domain: new Domain('localhost'),
        port: new Port()
    }, {
        router: normalRouterMock
    }).toString()).toBe('443');
});

test('Function getPortByParsedUri returns port by default protocol, if uri protocol is not specified', () => {
    expect(utils.getPortByParsedUri({
        protocol: new Protocol(),
        domain: new Domain('google.com'),
        port: new Port()
    }, {
        router: normalRouterMock
    }).toString()).toBe('443');
});

test('Function getPortByParsedUri returns original port, if uri protocol and default protocol are not specified', () => {
    expect(utils.getPortByParsedUri({
        protocol: new Protocol(),
        domain: new Domain('google.com'),
        port: new Port()
    }, {
        router: unknownProtocolRouterMock
    }).toString()).toBe('');
});

test('Function getPortByParsedUri returns default port, if uri domain is not specified', () => {
    expect(utils.getPortByParsedUri({
        protocol: new Protocol(),
        domain: new Domain(),
        port: new Port()
    }, {
        router: normalRouterMock
    }).toString()).toBe('8080');
});

test('Function getPortByParsedUri returns port by default protocol, if uri domain is not specified', () => {
    expect(utils.getPortByParsedUri({
        protocol: new Protocol(),
        domain: new Domain(),
        port: new Port()
    }, {
        router: emptyPortRouterMock
    }).toString()).toBe('80');
});

test('Function getPortByParsedUri returns default port, if nothing is specified', () => {
    expect(utils.getPortByParsedUri({
        protocol: new Protocol(),
        domain: new Domain(),
        port: new Port()
    }, {
        router: absolutelyEmptyRouterMock
    }).toString()).toBe('');
});

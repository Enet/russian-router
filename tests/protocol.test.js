import RussianRouter from '../index.js';
import {
    defaultRoutes,
    defaultOptions
} from './defaults.js';

let routes;
let options = {};
let router;

function configure (o) {
    options = o || {};
}

function select (...routeNames) {
    routes = {};
    for (let routeName of routeNames) {
        routes[routeName] = defaultRoutes[routeName];
    }
}

function init () {
    router = new RussianRouter(routes, options);
}

test('Protocol presented by null or undefined works correctly', () => {
    const test = () => {
        expect(router.generateUri('paramProtocol', {protocol: 'http'})).toBe('http://localhost/');
        expect(router.generateUri('paramProtocol', {protocol: null})).toBe('//localhost/');
        expect(router.generateUri('paramProtocol', {protocol: undefined})).toBe('//localhost/');
        expect(router.generateUri('paramProtocol', {})).toBe('//localhost/');
        expect(router.generateUri('paramProtocol')).toBe('//localhost/');
        expect(router.generateUri('paramProtocol', {protocol: ''})).toBe('//localhost/');
        expect(router.generateUri('paramProtocol', {protocol: 'https'})).toBe('https://localhost/');
        expect(router.matchUri('http://localhost/').length).toBe(1);
        expect(router.matchUri('https://localhost/').length).toBe(1);
        expect(router.matchUri('HTTP://localhost/').length).toBe(1);
        expect(router.matchUri('//localhost/').length).toBe(1);
    };

    select('paramProtocol');
    routes.paramProtocol.params = {
        protocol: null
    };
    init();
    test();

    routes.paramProtocol.params = {
        protocol: undefined
    };
    init();
    test();
});

test('Protocol presented by empty string works correctly', () => {
    select('paramProtocol');
    routes.paramProtocol.params = {
        protocol: ''
    };
    init();
    expect(() => router.generateUri('paramProtocol', {protocol: 'http'})).toThrow();
    expect(router.generateUri('paramProtocol', {protocol: null})).toBe('//localhost/');
    expect(router.generateUri('paramProtocol', {protocol: undefined})).toBe('//localhost/');
    expect(router.generateUri('paramProtocol', {})).toBe('//localhost/');
    expect(router.generateUri('paramProtocol')).toBe('//localhost/');
    expect(router.generateUri('paramProtocol', {protocol: ''})).toBe('//localhost/');
    expect(router.matchUri('http://localhost/').length).toBe(0);
    expect(router.matchUri('//localhost/').length).toBe(1);
    expect(router.matchUri('localhost/').length).toBe(0);
});

test('Protocol presented by string works correctly', () => {
    select('paramProtocol');
    routes.paramProtocol.params = {
        protocol: 'http'
    };
    init();
    expect(router.generateUri('paramProtocol', {protocol: 'http'})).toBe('http://localhost/');
    expect(router.generateUri('paramProtocol', {protocol: null})).toBe('http://localhost/');
    expect(router.generateUri('paramProtocol', {protocol: undefined})).toBe('http://localhost/');
    expect(router.generateUri('paramProtocol', {})).toBe('http://localhost/');
    expect(router.generateUri('paramProtocol')).toBe('http://localhost/');
    expect(() => router.generateUri('paramProtocol', {protocol: ''})).toThrow();
    expect(() => router.generateUri('paramProtocol', {protocol: 'https'})).toThrow();
    expect(router.matchUri('http://localhost/').length).toBe(1);
    expect(router.matchUri('https://localhost/').length).toBe(0);
    expect(router.matchUri('HTTP://localhost/').length).toBe(1);
    expect(router.matchUri('//localhost/').length).toBe(0);
});

test('Protocol presented by function or regular expression works correctly', () => {
    const test = () => {
        expect(router.generateUri('paramProtocol', {protocol: 'http'})).toBe('http://localhost/');
        expect(router.generateUri('paramProtocol', {protocol: 'ftp'})).toBe('ftp://localhost/');
        expect(() => router.generateUri('paramProtocol', {protocol: null})).toThrow();
        expect(() => router.generateUri('paramProtocol', {protocol: undefined})).toThrow();
        expect(() => router.generateUri('paramProtocol', {})).toThrow();
        expect(() => router.generateUri('paramProtocol')).toThrow();
        expect(() => router.generateUri('paramProtocol', {protocol: ''})).toThrow();
        expect(() => router.generateUri('paramProtocol', {protocol: 'https'})).toThrow();
        expect(router.matchUri('http://localhost/').length).toBe(1);
        expect(router.matchUri('HTTP://localhost/').length).toBe(1);
        expect(router.matchUri('ftp://localhost/').length).toBe(1);
        expect(router.matchUri('https://localhost/').length).toBe(0);
        expect(router.matchUri('//localhost/').length).toBe(0);
        expect(router.matchUri('ssh://localhost/').length).toBe(0);
    };

    select('paramProtocol');
    routes.paramProtocol.params = {
        protocol: (parsedProtocol) => parsedProtocol.slice(-2) === 'tp'
    };
    init();
    test();

    routes.paramProtocol.params = {
        protocol: /tp$/
    };
    init();
    test();

    routes.paramProtocol.params = {
        protocol: /TP$/
    };
    init();
    test();
});

test('Protocol presented by match-generate object works correctly', () => {
    select('paramProtocol');
    routes.paramProtocol.params = {
        protocol: {
            match: /tp$/,
            generate: 'http'
        }
    };
    init();
    expect(router.generateUri('paramProtocol', {protocol: 'http'})).toBe('http://localhost/');
    expect(router.generateUri('paramProtocol', {protocol: 'ftp'})).toBe('ftp://localhost/');
    expect(router.generateUri('paramProtocol', {protocol: null})).toBe('http://localhost/');
    expect(router.generateUri('paramProtocol', {protocol: undefined})).toBe('http://localhost/');
    expect(router.generateUri('paramProtocol', {})).toBe('http://localhost/');
    expect(router.generateUri('paramProtocol')).toBe('http://localhost/');
    expect(() => router.generateUri('paramProtocol', {protocol: ''})).toThrow();
    expect(() => router.generateUri('paramProtocol', {protocol: 'https'})).toThrow();
    expect(router.matchUri('http://localhost/').length).toBe(1);
    expect(router.matchUri('HTTP://localhost/').length).toBe(1);
    expect(router.matchUri('ftp://localhost/').length).toBe(1);
    expect(router.matchUri('tp://localhost/').length).toBe(1);
    expect(router.matchUri('https://localhost/').length).toBe(0);
    expect(router.matchUri('//localhost/').length).toBe(0);
    expect(router.matchUri('ssh://localhost/').length).toBe(0);

    routes.paramProtocol.params = {
        protocol: {
            match: /tp$/,
            generate: (userParams) => userParams.p + 'tp'
        }
    };
    init();
    expect(router.generateUri('paramProtocol')).toBe('undefinedtp://localhost/');
    expect(router.generateUri('paramProtocol', {p: 'ht'})).toBe('http://localhost/');
    expect(router.generateUri('paramProtocol', {p: 'f'})).toBe('ftp://localhost/');
    expect(router.matchUri('http://localhost/').length).toBe(1);
    expect(router.matchUri('ftp://localhost/').length).toBe(1);
    expect(router.matchUri('https://localhost/').length).toBe(0);
});

test('Protocol presented by array works correctly', () => {
    const test = () => {
        expect(router.generateUri('paramProtocol', {protocol: 'ftp'})).toBe('ftp://localhost/');
        expect(router.generateUri('paramProtocol', {protocol: null})).toBe('ftp://localhost/');
        expect(router.generateUri('paramProtocol', {protocol: undefined})).toBe('ftp://localhost/');
        expect(router.generateUri('paramProtocol', {})).toBe('ftp://localhost/');
        expect(router.generateUri('paramProtocol')).toBe('ftp://localhost/');
        expect(router.matchUri('ftp://localhost/').length).toBe(1);
        expect(router.matchUri('FTP://localhost/').length).toBe(1);
    };

    select('paramProtocol');
    routes.paramProtocol.params = {
        protocol: ['ftp', 'http']
    };
    init();
    test();
    expect(router.generateUri('paramProtocol', {protocol: 'http'})).toBe('http://localhost/');
    expect(() => router.generateUri('paramProtocol', {protocol: ''})).toThrow();
    expect(() => router.generateUri('paramProtocol', {protocol: 'https'})).toThrow();
    expect(router.matchUri('http://localhost/').length).toBe(1);
    expect(router.matchUri('https://localhost/').length).toBe(0);
    expect(router.matchUri('//localhost/').length).toBe(0);
    expect(router.matchUri('ssh://localhost/').length).toBe(0);

    routes.paramProtocol.params = {
        protocol: [null, 'ftp']
    };
    init();
    test();
    expect(() => router.generateUri('paramProtocol', {protocol: ''})).not.toThrow();
    expect(() => router.generateUri('paramProtocol', {protocol: 'http'})).not.toThrow();
    expect(() => router.generateUri('paramProtocol', {protocol: 'https'})).not.toThrow();
    expect(router.matchUri('http://localhost/').length).toBe(1);
    expect(router.matchUri('https://localhost/').length).toBe(1);
    expect(router.matchUri('//localhost/').length).toBe(1);
    expect(router.matchUri('ssh://localhost/').length).toBe(1);

    routes.paramProtocol.params = {
        protocol: ['ftp', undefined]
    };
    init();
    test();
    expect(() => router.generateUri('paramProtocol', {protocol: ''})).not.toThrow();
    expect(() => router.generateUri('paramProtocol', {protocol: 'http'})).not.toThrow();
    expect(() => router.generateUri('paramProtocol', {protocol: 'https'})).not.toThrow();
    expect(router.matchUri('http://localhost/').length).toBe(1);
    expect(router.matchUri('https://localhost/').length).toBe(1);
    expect(router.matchUri('//localhost/').length).toBe(1);
    expect(router.matchUri('ssh://localhost/').length).toBe(1);

    routes.paramProtocol.params = {
        protocol: ['ftp', 'ftp']
    };
    init();
    test();
    expect(() => router.generateUri('paramProtocol', {protocol: ''})).toThrow();
    expect(() => router.generateUri('paramProtocol', {protocol: 'http'})).toThrow();
    expect(() => router.generateUri('paramProtocol', {protocol: 'https'})).toThrow();
    expect(router.matchUri('http://localhost/').length).toBe(0);
    expect(router.matchUri('https://localhost/').length).toBe(0);
    expect(router.matchUri('//localhost/').length).toBe(0);
    expect(router.matchUri('ssh://localhost/').length).toBe(0);

    routes.paramProtocol.params = {
        protocol: [null, null, 'ftp', null, null]
    };
    init();
    test();
    expect(() => router.generateUri('paramProtocol', {protocol: ''})).not.toThrow();
    expect(() => router.generateUri('paramProtocol', {protocol: 'http'})).not.toThrow();
    expect(() => router.generateUri('paramProtocol', {protocol: 'https'})).not.toThrow();
    expect(router.matchUri('http://localhost/').length).toBe(1);
    expect(router.matchUri('https://localhost/').length).toBe(1);
    expect(router.matchUri('//localhost/').length).toBe(1);
    expect(router.matchUri('ssh://localhost/').length).toBe(1);
});

test('Protocol presented by empty array works correctly', () => {
    const test = () => {
        expect(router.generateUri('paramProtocol', {protocol: 'ftp'})).toBe('ftp://localhost/');
        expect(router.generateUri('paramProtocol', {protocol: null})).toBe('//localhost/');
        expect(router.generateUri('paramProtocol', {protocol: undefined})).toBe('//localhost/');
        expect(router.generateUri('paramProtocol', {})).toBe('//localhost/');
        expect(router.generateUri('paramProtocol')).toBe('//localhost/');
        expect(router.matchUri('ftp://localhost/').length).toBe(1);
        expect(router.matchUri('FTP://localhost/').length).toBe(1);
        expect(router.matchUri('//localhost/').length).toBe(1);
        expect(router.matchUri('https://localhost/').length).toBe(1);
    };

    select('paramProtocol');
    routes.paramProtocol.params = {
        protocol: []
    };
    init();
    test();

    routes.paramProtocol.params = {
        protocol: [null]
    };
    init();
    test();

    routes.paramProtocol.params = {
        protocol: [undefined]
    };
    init();
    test();

    routes.paramProtocol.params = {
        protocol: [null, undefined]
    };
    init();
    test();
});

test('Protocol presented by another type', () => {
    select('paramProtocol');
    routes.paramProtocol.params = {
        protocol: {}
    };
    expect(init).toThrow();
});

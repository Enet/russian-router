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
        expect(router.generateUrl('paramProtocol', {protocol: 'http'})).toBe('http://localhost/');
        expect(router.generateUrl('paramProtocol', {protocol: null})).toBe('//localhost/');
        expect(router.generateUrl('paramProtocol', {protocol: undefined})).toBe('//localhost/');
        expect(router.generateUrl('paramProtocol', {})).toBe('//localhost/');
        expect(router.generateUrl('paramProtocol')).toBe('//localhost/');
        expect(router.generateUrl('paramProtocol', {protocol: ''})).toBe('//localhost/');
        expect(router.generateUrl('paramProtocol', {protocol: 'https'})).toBe('https://localhost/');
        expect(router.matchUrl('http://localhost/').length).toBe(1);
        expect(router.matchUrl('https://localhost/').length).toBe(1);
        expect(router.matchUrl('HTTP://localhost/').length).toBe(1);
        expect(router.matchUrl('//localhost/').length).toBe(1);
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
    expect(() => router.generateUrl('paramProtocol', {protocol: 'http'})).toThrow();
    expect(router.generateUrl('paramProtocol', {protocol: null})).toBe('//localhost/');
    expect(router.generateUrl('paramProtocol', {protocol: undefined})).toBe('//localhost/');
    expect(router.generateUrl('paramProtocol', {})).toBe('//localhost/');
    expect(router.generateUrl('paramProtocol')).toBe('//localhost/');
    expect(router.generateUrl('paramProtocol', {protocol: ''})).toBe('//localhost/');
    expect(router.matchUrl('http://localhost/').length).toBe(0);
    expect(router.matchUrl('//localhost/').length).toBe(1);
    expect(router.matchUrl('localhost/').length).toBe(0);
});

test('Protocol presented by string works correctly', () => {
    select('paramProtocol');
    routes.paramProtocol.params = {
        protocol: 'http'
    };
    init();
    expect(router.generateUrl('paramProtocol', {protocol: 'http'})).toBe('http://localhost/');
    expect(router.generateUrl('paramProtocol', {protocol: null})).toBe('http://localhost/');
    expect(router.generateUrl('paramProtocol', {protocol: undefined})).toBe('http://localhost/');
    expect(router.generateUrl('paramProtocol', {})).toBe('http://localhost/');
    expect(router.generateUrl('paramProtocol')).toBe('http://localhost/');
    expect(() => router.generateUrl('paramProtocol', {protocol: ''})).toThrow();
    expect(() => router.generateUrl('paramProtocol', {protocol: 'https'})).toThrow();
    expect(router.matchUrl('http://localhost/').length).toBe(1);
    expect(router.matchUrl('https://localhost/').length).toBe(0);
    expect(router.matchUrl('HTTP://localhost/').length).toBe(1);
    expect(router.matchUrl('//localhost/').length).toBe(0);
});

test('Protocol presented by function or regular expression works correctly', () => {
    const test = () => {
        expect(router.generateUrl('paramProtocol', {protocol: 'http'})).toBe('http://localhost/');
        expect(router.generateUrl('paramProtocol', {protocol: 'ftp'})).toBe('ftp://localhost/');
        expect(() => router.generateUrl('paramProtocol', {protocol: null})).toThrow();
        expect(() => router.generateUrl('paramProtocol', {protocol: undefined})).toThrow();
        expect(() => router.generateUrl('paramProtocol', {})).toThrow();
        expect(() => router.generateUrl('paramProtocol')).toThrow();
        expect(() => router.generateUrl('paramProtocol', {protocol: ''})).toThrow();
        expect(() => router.generateUrl('paramProtocol', {protocol: 'https'})).toThrow();
        expect(router.matchUrl('http://localhost/').length).toBe(1);
        expect(router.matchUrl('HTTP://localhost/').length).toBe(1);
        expect(router.matchUrl('ftp://localhost/').length).toBe(1);
        expect(router.matchUrl('https://localhost/').length).toBe(0);
        expect(router.matchUrl('//localhost/').length).toBe(0);
        expect(router.matchUrl('ssh://localhost/').length).toBe(0);
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
    expect(router.generateUrl('paramProtocol', {protocol: 'http'})).toBe('http://localhost/');
    expect(router.generateUrl('paramProtocol', {protocol: 'ftp'})).toBe('ftp://localhost/');
    expect(router.generateUrl('paramProtocol', {protocol: null})).toBe('http://localhost/');
    expect(router.generateUrl('paramProtocol', {protocol: undefined})).toBe('http://localhost/');
    expect(router.generateUrl('paramProtocol', {})).toBe('http://localhost/');
    expect(router.generateUrl('paramProtocol')).toBe('http://localhost/');
    expect(() => router.generateUrl('paramProtocol', {protocol: ''})).toThrow();
    expect(() => router.generateUrl('paramProtocol', {protocol: 'https'})).toThrow();
    expect(router.matchUrl('http://localhost/').length).toBe(1);
    expect(router.matchUrl('HTTP://localhost/').length).toBe(1);
    expect(router.matchUrl('ftp://localhost/').length).toBe(1);
    expect(router.matchUrl('tp://localhost/').length).toBe(1);
    expect(router.matchUrl('https://localhost/').length).toBe(0);
    expect(router.matchUrl('//localhost/').length).toBe(0);
    expect(router.matchUrl('ssh://localhost/').length).toBe(0);

    routes.paramProtocol.params = {
        protocol: {
            match: /tp$/,
            generate: (userParams) => userParams.p + 'tp'
        }
    };
    init();
    expect(router.generateUrl('paramProtocol')).toBe('undefinedtp://localhost/');
    expect(router.generateUrl('paramProtocol', {p: 'ht'})).toBe('http://localhost/');
    expect(router.generateUrl('paramProtocol', {p: 'f'})).toBe('ftp://localhost/');
    expect(router.matchUrl('http://localhost/').length).toBe(1);
    expect(router.matchUrl('ftp://localhost/').length).toBe(1);
    expect(router.matchUrl('https://localhost/').length).toBe(0);
});

test('Protocol presented by array works correctly', () => {
    const test = () => {
        expect(router.generateUrl('paramProtocol', {protocol: 'ftp'})).toBe('ftp://localhost/');
        expect(router.generateUrl('paramProtocol', {protocol: null})).toBe('ftp://localhost/');
        expect(router.generateUrl('paramProtocol', {protocol: undefined})).toBe('ftp://localhost/');
        expect(router.generateUrl('paramProtocol', {})).toBe('ftp://localhost/');
        expect(router.generateUrl('paramProtocol')).toBe('ftp://localhost/');
        expect(router.matchUrl('ftp://localhost/').length).toBe(1);
        expect(router.matchUrl('FTP://localhost/').length).toBe(1);
    };

    select('paramProtocol');
    routes.paramProtocol.params = {
        protocol: ['ftp', 'http']
    };
    init();
    test();
    expect(router.generateUrl('paramProtocol', {protocol: 'http'})).toBe('http://localhost/');
    expect(() => router.generateUrl('paramProtocol', {protocol: ''})).toThrow();
    expect(() => router.generateUrl('paramProtocol', {protocol: 'https'})).toThrow();
    expect(router.matchUrl('http://localhost/').length).toBe(1);
    expect(router.matchUrl('https://localhost/').length).toBe(0);
    expect(router.matchUrl('//localhost/').length).toBe(0);
    expect(router.matchUrl('ssh://localhost/').length).toBe(0);

    routes.paramProtocol.params = {
        protocol: [null, 'ftp']
    };
    init();
    test();
    expect(() => router.generateUrl('paramProtocol', {protocol: ''})).not.toThrow();
    expect(() => router.generateUrl('paramProtocol', {protocol: 'http'})).not.toThrow();
    expect(() => router.generateUrl('paramProtocol', {protocol: 'https'})).not.toThrow();
    expect(router.matchUrl('http://localhost/').length).toBe(1);
    expect(router.matchUrl('https://localhost/').length).toBe(1);
    expect(router.matchUrl('//localhost/').length).toBe(1);
    expect(router.matchUrl('ssh://localhost/').length).toBe(1);

    routes.paramProtocol.params = {
        protocol: ['ftp', undefined]
    };
    init();
    test();
    expect(() => router.generateUrl('paramProtocol', {protocol: ''})).not.toThrow();
    expect(() => router.generateUrl('paramProtocol', {protocol: 'http'})).not.toThrow();
    expect(() => router.generateUrl('paramProtocol', {protocol: 'https'})).not.toThrow();
    expect(router.matchUrl('http://localhost/').length).toBe(1);
    expect(router.matchUrl('https://localhost/').length).toBe(1);
    expect(router.matchUrl('//localhost/').length).toBe(1);
    expect(router.matchUrl('ssh://localhost/').length).toBe(1);

    routes.paramProtocol.params = {
        protocol: ['ftp', 'ftp']
    };
    init();
    test();
    expect(() => router.generateUrl('paramProtocol', {protocol: ''})).toThrow();
    expect(() => router.generateUrl('paramProtocol', {protocol: 'http'})).toThrow();
    expect(() => router.generateUrl('paramProtocol', {protocol: 'https'})).toThrow();
    expect(router.matchUrl('http://localhost/').length).toBe(0);
    expect(router.matchUrl('https://localhost/').length).toBe(0);
    expect(router.matchUrl('//localhost/').length).toBe(0);
    expect(router.matchUrl('ssh://localhost/').length).toBe(0);

    routes.paramProtocol.params = {
        protocol: [null, null, 'ftp', null, null]
    };
    init();
    test();
    expect(() => router.generateUrl('paramProtocol', {protocol: ''})).not.toThrow();
    expect(() => router.generateUrl('paramProtocol', {protocol: 'http'})).not.toThrow();
    expect(() => router.generateUrl('paramProtocol', {protocol: 'https'})).not.toThrow();
    expect(router.matchUrl('http://localhost/').length).toBe(1);
    expect(router.matchUrl('https://localhost/').length).toBe(1);
    expect(router.matchUrl('//localhost/').length).toBe(1);
    expect(router.matchUrl('ssh://localhost/').length).toBe(1);
});

test('Protocol presented by empty array works correctly', () => {
    const test = () => {
        expect(router.generateUrl('paramProtocol', {protocol: 'ftp'})).toBe('ftp://localhost/');
        expect(router.generateUrl('paramProtocol', {protocol: null})).toBe('//localhost/');
        expect(router.generateUrl('paramProtocol', {protocol: undefined})).toBe('//localhost/');
        expect(router.generateUrl('paramProtocol', {})).toBe('//localhost/');
        expect(router.generateUrl('paramProtocol')).toBe('//localhost/');
        expect(router.matchUrl('ftp://localhost/').length).toBe(1);
        expect(router.matchUrl('FTP://localhost/').length).toBe(1);
        expect(router.matchUrl('//localhost/').length).toBe(1);
        expect(router.matchUrl('https://localhost/').length).toBe(1);
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

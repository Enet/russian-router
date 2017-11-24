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

test('Domain presented by null or undefined works correctly', () => {
    const test = () => {
        expect(router.generateUrl('paramDomain', {domain: 'localhost'})).toBe('http://localhost/');
        expect(router.generateUrl('paramDomain', {domain: null})).toBe('http:///');
        expect(router.generateUrl('paramDomain', {domain: undefined})).toBe('http:///');
        expect(router.generateUrl('paramDomain', {})).toBe('http:///');
        expect(router.generateUrl('paramDomain')).toBe('http:///');
        expect(router.generateUrl('paramDomain', {domain: ''})).toBe('http:///');
        expect(router.generateUrl('paramDomain', {domain: 'google.com'})).toBe('http://google.com/');
        expect(router.matchUrl('http://localhost/').length).toBe(1);
        expect(router.matchUrl('http://google.com/').length).toBe(1);
        expect(router.matchUrl('http://LOCALHOST/').length).toBe(1);
        expect(router.matchUrl('http://google.com').length).toBe(1);
    };

    select('paramDomain');
    routes.paramDomain.params = {
        protocol: null
    };
    init();
    test();

    routes.paramDomain.params = {
        protocol: undefined
    };
    init();
    test();
});

test('Domain presented by empty string works correctly', () => {
    select('paramDomain');
    routes.paramDomain.params = {
        domain: ''
    };
    init();
    expect(() => router.generateUrl('paramDomain', {domain: 'localhost'})).toThrow();
    expect(router.generateUrl('paramDomain', {domain: null})).toBe('http:///');
    expect(router.generateUrl('paramDomain', {domain: undefined})).toBe('http:///');
    expect(router.generateUrl('paramDomain', {})).toBe('http:///');
    expect(router.generateUrl('paramDomain')).toBe('http:///');
    expect(router.generateUrl('paramDomain', {domain: ''})).toBe('http:///');
    expect(router.matchUrl('http://localhost/').length).toBe(0);
    expect(router.matchUrl('http://google.com/').length).toBe(0);
    expect(router.matchUrl('http:///').length).toBe(0);
});

test('Domain presented by string works correctly', () => {
    select('paramDomain');
    routes.paramDomain.params = {
        domain: 'localhost'
    };
    init();
    expect(router.generateUrl('paramDomain', {domain: 'localhost'})).toBe('http://localhost/');
    expect(router.generateUrl('paramDomain', {domain: null})).toBe('http://localhost/');
    expect(router.generateUrl('paramDomain', {domain: undefined})).toBe('http://localhost/');
    expect(router.generateUrl('paramDomain', {})).toBe('http://localhost/');
    expect(router.generateUrl('paramDomain')).toBe('http://localhost/');
    expect(() => router.generateUrl('paramDomain', {domain: ''})).toThrow();
    expect(() => router.generateUrl('paramDomain', {domain: 'google.com'})).toThrow();
    expect(router.matchUrl('http://localhost/').length).toBe(1);
    expect(router.matchUrl('http://LoCaLhOsT/').length).toBe(1);
    expect(router.matchUrl('http://google.com/').length).toBe(0);
    expect(router.matchUrl('http:///').length).toBe(0);
});

test('Domain presented by function or regular expression works correctly', () => {
    const test = () => {
        expect(router.generateUrl('paramDomain', {domain: 'localhost'})).toBe('http://localhost/');
        expect(() => router.generateUrl('paramDomain', {domain: 'google.com'})).toThrow();
        expect(() => router.generateUrl('paramDomain', {domain: null})).toThrow();
        expect(() => router.generateUrl('paramDomain', {domain: undefined})).toThrow();
        expect(() => router.generateUrl('paramDomain', {})).toThrow();
        expect(() => router.generateUrl('paramDomain')).toThrow();
        expect(() => router.generateUrl('paramDomain', {domain: ''})).toThrow();
        expect(router.matchUrl('http://localhost/').length).toBe(1);
        expect(router.matchUrl('http://localHOST/').length).toBe(1);
        expect(router.matchUrl('http://google.com/').length).toBe(0);
        expect(router.matchUrl('http:///').length).toBe(0);
        expect(router.matchUrl('/').length).toBe(0);
    };

    select('paramDomain');
    routes.paramDomain.params = {
        domain: (parsedDomain) => parsedDomain.slice(-4) === 'host'
    };
    init();
    test();

    routes.paramDomain.params = {
        domain: /host$/
    };
    init();
    test();

    routes.paramDomain.params = {
        domain: /HOST$/
    };
    init();
    test();
});

test('Domain presented by match-generate object works correctly', () => {
    select('paramDomain');
    routes.paramDomain.params = {
        domain: {
            match: /host$/,
            generate: 'localhost'
        }
    };
    init();
    expect(router.generateUrl('paramDomain', {domain: 'localhost'})).toBe('http://localhost/');
    expect(router.generateUrl('paramDomain', {domain: 'superhost'})).toBe('http://superhost/');
    expect(router.generateUrl('paramDomain', {domain: null})).toBe('http://localhost/');
    expect(router.generateUrl('paramDomain', {domain: undefined})).toBe('http://localhost/');
    expect(router.generateUrl('paramDomain', {})).toBe('http://localhost/');
    expect(router.generateUrl('paramDomain')).toBe('http://localhost/');
    expect(() => router.generateUrl('paramDomain', {domain: ''})).toThrow();
    expect(() => router.generateUrl('paramDomain', {domain: 'google.com'})).toThrow();
    expect(router.matchUrl('http://localhost/').length).toBe(1);
    expect(router.matchUrl('http://LOCALHOST/').length).toBe(1);
    expect(router.matchUrl('http://superhost/').length).toBe(1);
    expect(router.matchUrl('http://host').length).toBe(1);
    expect(router.matchUrl('http://google.com/').length).toBe(0);
    expect(router.matchUrl('http:///').length).toBe(0);

    routes.paramDomain.params = {
        domain: {
            match: /host$/,
            generate: (userParams) => userParams.d + 'st'
        }
    };
    init();
    expect(router.generateUrl('paramDomain', {d: 'localho'})).toBe('http://localhost/');
    expect(router.generateUrl('paramDomain', {d: 'superho'})).toBe('http://superhost/');
    expect(() => router.generateUrl('paramDomain')).toThrow();
    expect(() => router.generateUrl('paramDomain', {d: 'google.'})).toThrow();
    expect(router.matchUrl('http://localhost/').length).toBe(1);
    expect(router.matchUrl('http://superhost/').length).toBe(1);
    expect(router.matchUrl('http://google.com/').length).toBe(0);
});

test('Domain presented by array works correctly', () => {
    const test = () => {
        expect(router.generateUrl('paramDomain', {domain: 'localhost'})).toBe('http://localhost/');
        expect(router.generateUrl('paramDomain', {domain: null})).toBe('http://localhost/');
        expect(router.generateUrl('paramDomain', {domain: undefined})).toBe('http://localhost/');
        expect(router.generateUrl('paramDomain', {})).toBe('http://localhost/');
        expect(router.generateUrl('paramDomain')).toBe('http://localhost/');
        expect(router.matchUrl('http://localhost/').length).toBe(1);
        expect(router.matchUrl('http://LOCALHOST/').length).toBe(1);
    };

    select('paramDomain');
    routes.paramDomain.params = {
        domain: ['localhost', 'google.com']
    };
    init();
    test();
    expect(router.generateUrl('paramDomain', {domain: 'google.com'})).toBe('http://google.com/');
    expect(() => router.generateUrl('paramDomain', {domain: ''})).toThrow();
    expect(() => router.generateUrl('paramDomain', {domain: 'yandex.ru'})).toThrow();

    routes.paramDomain.params = {
        domain: [null, 'localhost']
    };
    init();
    test();
    expect(() => router.generateUrl('paramDomain', {domain: ''})).not.toThrow();
    expect(() => router.generateUrl('paramDomain', {domain: 'localhost'})).not.toThrow();
    expect(() => router.generateUrl('paramDomain', {domain: 'google.com'})).not.toThrow();
    expect(router.matchUrl('http://google.com/').length).toBe(1);
    expect(router.matchUrl('http:///').length).toBe(0);

    routes.paramDomain.params = {
        domain: ['localhost', undefined]
    };
    init();
    test();
    expect(() => router.generateUrl('paramDomain', {domain: ''})).not.toThrow();
    expect(() => router.generateUrl('paramDomain', {domain: 'localhost'})).not.toThrow();
    expect(() => router.generateUrl('paramDomain', {domain: 'google.com'})).not.toThrow();
    expect(router.matchUrl('http://google.com/').length).toBe(1);
    expect(router.matchUrl('http:///').length).toBe(0);

    routes.paramDomain.params = {
        domain: ['localhost', 'localhost']
    };
    init();
    test();
    expect(() => router.generateUrl('paramDomain', {domain: ''})).toThrow();
    expect(() => router.generateUrl('paramDomain', {domain: 'google.com'})).toThrow();
    expect(router.matchUrl('http://google.com/').length).toBe(0);
    expect(router.matchUrl('http:///').length).toBe(0);

    routes.paramDomain.params = {
        domain: [null, null, 'localhost', null, null]
    };
    init();
    test();
    expect(() => router.generateUrl('paramDomain', {domain: ''})).not.toThrow();
    expect(() => router.generateUrl('paramDomain', {domain: 'localhost'})).not.toThrow();
    expect(() => router.generateUrl('paramDomain', {domain: 'google.com'})).not.toThrow();
    expect(router.matchUrl('http://google.com/').length).toBe(1);
    expect(router.matchUrl('http:///').length).toBe(0);
});

test('Domain presented by empty array works correctly', () => {
    const test = () => {
        expect(router.generateUrl('paramDomain', {domain: 'localhost'})).toBe('http://localhost/');
        expect(router.generateUrl('paramDomain', {domain: null})).toBe('http:///');
        expect(router.generateUrl('paramDomain', {domain: undefined})).toBe('http:///');
        expect(router.generateUrl('paramDomain', {})).toBe('http:///');
        expect(router.generateUrl('paramDomain')).toBe('http:///');
        expect(router.matchUrl('http://localhost/').length).toBe(1);
        expect(router.matchUrl('http://LOCALHOST/').length).toBe(1);
        expect(router.matchUrl('http://google.com/').length).toBe(1);
        expect(router.matchUrl('http:///').length).toBe(0);
    };

    select('paramDomain');
    routes.paramDomain.params = {
        domain: []
    };
    init();
    test();

    routes.paramDomain.params = {
        domain: [null]
    };
    init();
    test();

    routes.paramDomain.params = {
        domain: [undefined]
    };
    init();
    test();

    routes.paramDomain.params = {
        domain: [null, undefined]
    };
    init();
    test();
});

test('Domain presented by another type', () => {
    select('paramDomain');
    routes.paramDomain.params = {
        domain: {}
    };
    expect(init).toThrow();
});

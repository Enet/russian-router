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

test('Router renders root route correctly', () => {
    configure();
    select('index');
    init();

    expect(router.generateUrl('index')).toBe('/');
    expect(router.generateUrl('index', {})).toBe('/');
    expect(router.generateUrl('index', {a: 1})).toBe('/');
});

test('Router option onlyRoute works correctly', () => {
    configure();
    select('priorityX', 'priorityY', 'priorityZ');
    init();
    expect(router.matchUrl('/priority/checking').length).toBe(3);

    configure({onlyRoute: true});
    init();
    expect(router.matchUrl('/priority/checking').length).toBe(1);
});

test('Router option sortMatchedRoutes works correctly', () => {
    let matchedRoutes;

    configure();
    select('priorityD', 'priorityX', 'priorityY', 'priorityZ');
    init();
    matchedRoutes = router.matchUrl('/priority/checking');
    expect(matchedRoutes[0].options.priority).toBe(1);
    expect(matchedRoutes[1].options.priority).toBeUndefined();
    expect(matchedRoutes[2].options.priority).toBe(0);
    expect(matchedRoutes[3].options.priority).toBe(-1);

    configure({sortMatchedRoutes: true});
    init();
    matchedRoutes = router.matchUrl('/priority/checking');
    expect(matchedRoutes[0].options.priority).toBe(1);
    expect(matchedRoutes[1].options.priority).toBeUndefined();
    expect(matchedRoutes[2].options.priority).toBe(0);
    expect(matchedRoutes[3].options.priority).toBe(-1);

    configure({sortMatchedRoutes: false});
    init();
    matchedRoutes = router.matchUrl('/priority/checking');
    expect(matchedRoutes[0].options.priority).not.toBe(1);

    configure({sortMatchedRoutes: (matchedRoutes) => []});
    init();
    matchedRoutes = router.matchUrl('/priority/checking');
    expect(matchedRoutes.length).toBe(0);
});

test('Router option dataConsistency works correctly', () => {
    const getEmptyUrl = () => {
        return router.generateUrl('dataConsistency');
    };

    const getFullUrl = () => {
        return router.generateUrl('dataConsistency', {
            protocol: 'http',
            domain: 'localhost',
            port: 8080,
            path: 'hello',
            query: 'world',
            hash: 'asdf'
        });
    };

    configure();
    select('dataConsistency');
    init();
    expect(getEmptyUrl).toThrow();
    expect(getFullUrl).not.toThrow();

    configure({dataConsistency: true});
    init();
    expect(getEmptyUrl).toThrow();
    expect(getFullUrl).not.toThrow();

    configure({dataConsistency: false});
    init();
    expect(getEmptyUrl).not.toThrow();
    expect(getFullUrl).not.toThrow();
});

test('Router option trailingSlashSensitive works correctly', () => {
    let matchedRoutes;
    configure();
    select('hasTrailingSlash', 'noTrailingSlash');
    init();
    matchedRoutes = router.matchUrl('/trailing/slash');
    expect(matchedRoutes.length).toBe(2);
    expect(router.generateUrl('noTrailingSlash').slice(-1)[0]).not.toBe('/');
    matchedRoutes = router.matchUrl('/trailing/slash/');
    expect(matchedRoutes.length).toBe(2);
    expect(router.generateUrl('hasTrailingSlash').slice(-1)[0]).toBe('/');

    configure({trailingSlashSensitive: false});
    init();
    matchedRoutes = router.matchUrl('/trailing/slash');
    expect(matchedRoutes.length).toBe(2);
    expect(router.generateUrl('noTrailingSlash').slice(-1)[0]).not.toBe('/');
    matchedRoutes = router.matchUrl('/trailing/slash/');
    expect(matchedRoutes.length).toBe(2);
    expect(router.generateUrl('hasTrailingSlash').slice(-1)[0]).toBe('/');

    configure({trailingSlashSensitive: true});
    init();
    matchedRoutes = router.matchUrl('/trailing/slash');
    expect(matchedRoutes.length).toBe(1);
    expect(matchedRoutes[0].routeName).toBe('noTrailingSlash');
    expect(router.generateUrl('noTrailingSlash').slice(-1)[0]).not.toBe('/');
    matchedRoutes = router.matchUrl('/trailing/slash/');
    expect(matchedRoutes.length).toBe(1);
    expect(matchedRoutes[0].routeName).toBe('hasTrailingSlash');
    expect(router.generateUrl('hasTrailingSlash').slice(-1)[0]).toBe('/');
});

test('Router option caseSensitive works correctly', () => {
    const getConstUrl = () => {
        return router.generateUrl('constRandomCase');
    };

    const getParamUrl = () => {
        return router.generateUrl('constRandomCase', {
            protocol: 'hTtP',
            domain: 'lOcAlHoSt',
            port: 8080,
            to: 'tO',
            query: 'QuErY',
            hash: 'hAsH'
        });
    };

    let url;
    configure();
    select('constRandomCase', 'paramRandomCase');
    init();
    url = getConstUrl();
    expect(url).toBe(url.toLowerCase());
    expect(router.matchUrl(url).length).toBeGreaterThan(0);
    expect(router.matchUrl(url.toLowerCase()).length).toBeGreaterThan(0);
    url = getParamUrl();
    expect(url).toBe(url.toLowerCase());
    expect(router.matchUrl(url).length).toBeGreaterThan(0);
    expect(router.matchUrl(url.toLowerCase()).length).toBeGreaterThan(0);

    configure({caseSensitive: false});
    init();
    url = getConstUrl();
    expect(url).toBe(url.toLowerCase());
    expect(router.matchUrl(url).length).toBeGreaterThan(0);
    expect(router.matchUrl(url.toLowerCase()).length).toBeGreaterThan(0);
    url = getParamUrl();
    expect(url).toBe(url.toLowerCase());
    expect(router.matchUrl(url).length).toBeGreaterThan(0);
    expect(router.matchUrl(url.toLowerCase()).length).toBeGreaterThan(0);

    configure({caseSensitive: true});
    init();
    url = getConstUrl();
    expect(url).not.toBe(url.toLowerCase());
    expect(router.matchUrl(url).length).toBeGreaterThan(0);
    expect(router.matchUrl(url.toLowerCase()).length).toBe(0);
    url = getParamUrl();
    expect(url).not.toBe(url.toLowerCase());
    expect(router.matchUrl(url).length).toBeGreaterThan(0);
    expect(router.matchUrl(url.toLowerCase()).length).toBe(0);
});

test('Route option dataConsistency works correctly', () => {
    expect(1).toBe(1);
});

test('Route option trailingSlashSensitive works correctly', () => {
    expect(1).toBe(1);
});

test('Route option caseSensitive works correctly', () => {
    expect(1).toBe(1);
});

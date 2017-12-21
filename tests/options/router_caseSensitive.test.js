import RussianRouter from 'russian-router';
import {
    getRouteUri,
    fillRoutes
} from 'utils';

test('Router option caseSensitive works correctly', () => {
    let router;
    const routes = fillRoutes({
        indexUpperCase: {},
        indexLowerCase: {},
        indexRandomCase: {}
    });

    // default value
    router = new RussianRouter(routes, {});
    expect(router.matchUri(getRouteUri('indexUpperCase')).length).toBe(3);
    expect(router.matchUri(getRouteUri('indexLowerCase')).length).toBe(3);
    expect(router.matchUri(getRouteUri('indexRandomCase')).length).toBe(3);

    // false
    router = new RussianRouter(routes, {caseSensitive: false});
    expect(router.matchUri(getRouteUri('indexUpperCase')).length).toBe(3);
    expect(router.matchUri(getRouteUri('indexLowerCase')).length).toBe(3);
    expect(router.matchUri(getRouteUri('indexRandomCase')).length).toBe(3);

    // true
    router = new RussianRouter(routes, {caseSensitive: true});
    expect(router.matchUri(getRouteUri('indexUpperCase')).length).toBe(1);
    expect(router.matchUri(getRouteUri('indexLowerCase')).length).toBe(1);
    expect(router.matchUri(getRouteUri('indexRandomCase')).length).toBe(1);
});

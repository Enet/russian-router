import RussianRouter from 'russian-router';
import {
    getRouteUri,
    fillRoutes
} from 'utils';

test('Router option onlyRoute works correctly', () => {
    let router;
    const routes = fillRoutes({
        indexUpperCase: {},
        indexLowerCase: {},
        indexRandomCase: {}
    });

    // default value
    router = new RussianRouter(routes, {});
    expect(router.matchUri(getRouteUri('indexLowerCase')).length).toBe(3);

    // false
    router = new RussianRouter(routes, {onlyRoute: false});
    expect(router.matchUri(getRouteUri('indexLowerCase')).length).toBe(3);

    // true
    router = new RussianRouter(routes, {onlyRoute: true});
    expect(router.matchUri(getRouteUri('indexLowerCase')).length).toBe(1);
});

import RussianRouter from 'russian-router';
import {
    getRouteUri,
    fillRoutes
} from 'utils';

test('Router option trailingSlashSensitive works correctly', () => {
    let router;
    const routes = fillRoutes({
        indexHasTrailingSlash: {},
        indexNoTrailingSlash: {}
    });

    // default value
    router = new RussianRouter(routes, {});
    expect(router.matchUri(getRouteUri('indexHasTrailingSlash')).length).toBe(2);
    expect(router.matchUri(getRouteUri('indexNoTrailingSlash')).length).toBe(2);

    // false
    router = new RussianRouter(routes, {trailingSlashSensitive: false});
    expect(router.matchUri(getRouteUri('indexHasTrailingSlash')).length).toBe(2);
    expect(router.matchUri(getRouteUri('indexNoTrailingSlash')).length).toBe(2);

    // true
    router = new RussianRouter(routes, {trailingSlashSensitive: true});
    expect(router.matchUri(getRouteUri('indexHasTrailingSlash')).length).toBe(1);
    expect(router.matchUri(getRouteUri('indexNoTrailingSlash')).length).toBe(1);
});

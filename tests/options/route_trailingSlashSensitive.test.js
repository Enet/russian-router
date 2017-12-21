import RussianRouter from 'russian-router';
import {
    getRouteUri,
    fillRoutes
} from 'utils';

test('Route option trailingSlashSensitive works correctly', () => {
    let router;

    for (let routeTrailingSlashSensitive of [undefined, true, false]) {
        let expectedByRouteCount = null;
        const routes = fillRoutes({
            indexHasTrailingSlash: {options: {}},
            indexNoTrailingSlash: {options: {}}
        });

        if (typeof routeTrailingSlashSensitive === 'boolean') {
            expectedByRouteCount = routeTrailingSlashSensitive ? 1 : 2;
            for (let r in routes) {
                routes[r].options.trailingSlashSensitive = routeTrailingSlashSensitive;
            }
        }

        for (let routerTrailingSlashSensitive of [true, false]) {
            const expectedByRouterCount = routerTrailingSlashSensitive ? 1 : 2;
            const expectedCount = expectedByRouteCount || expectedByRouterCount;

            router = new RussianRouter(routes, {trailingSlashSensitive: routerTrailingSlashSensitive});
            expect(router.matchUri(getRouteUri('indexHasTrailingSlash')).length).toBe(expectedCount);
            expect(router.matchUri(getRouteUri('indexNoTrailingSlash')).length).toBe(expectedCount);
        }
    }
});

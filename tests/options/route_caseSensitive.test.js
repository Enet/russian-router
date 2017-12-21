import RussianRouter from 'russian-router';
import {
    getRouteUri,
    fillRoutes
} from 'utils';

test('Route option caseSensitive works correctly', () => {
    let router;

    for (let routeCaseSensitive of [undefined, true, false]) {
        let expectedByRouteCount = null;
        const routes = fillRoutes({
            indexUpperCase: {options: {}},
            indexLowerCase: {options: {}},
            indexRandomCase: {options: {}}
        });

        if (typeof routeCaseSensitive === 'boolean') {
            expectedByRouteCount = routeCaseSensitive ? 1 : 3;
            for (let r in routes) {
                routes[r].options.caseSensitive = routeCaseSensitive;
            }
        }

        for (let routerCaseSensitive of [true, false]) {
            const expectedByRouterCount = routerCaseSensitive ? 1 : 3;
            const expectedCount = expectedByRouteCount || expectedByRouterCount;

            router = new RussianRouter(routes, {caseSensitive: routerCaseSensitive});
            expect(router.matchUri(getRouteUri('indexUpperCase')).length).toBe(expectedCount);
            expect(router.matchUri(getRouteUri('indexLowerCase')).length).toBe(expectedCount);
            expect(router.matchUri(getRouteUri('indexRandomCase')).length).toBe(expectedCount);
        }
    }
});

import RussianRouter from 'russian-router';
import {
    fillRoutes
} from 'utils';

test('Route option dataConsistency works correctly', () => {
    let router;

    for (let routeDataConsistency of [undefined, true, false]) {
        let expectedByRouteError = null;
        const routes = fillRoutes({
            indexOneParam: {
                params: {x: /\d+/},
                options: {}
            }
        });

        if (typeof routeDataConsistency === 'boolean') {
            expectedByRouteError = routeDataConsistency ? 1 : -1;
            for (let r in routes) {
                routes[r].options.dataConsistency = routeDataConsistency;
            }
        }

        for (let routerDataConsistency of [true, false]) {
            const expectedByRouterError = routerDataConsistency ? 1 : -1;
            const expectedError = (expectedByRouteError || expectedByRouterError) === 1;

            router = new RussianRouter(routes, {dataConsistency: routerDataConsistency});
            expect(() => router.generateUri('indexOneParam', {x: 12345})).not.toThrow();
            if (expectedError) {
                expect(() => router.generateUri('indexOneParam', {x: 'abc'})).toThrow();
            } else {
                expect(() => router.generateUri('indexOneParam', {x: 'abc'})).not.toThrow();
            }
        }
    }
});

import RussianRouter from 'russian-router';
import {
    getRouteUri,
    fillRoutes
} from 'utils';

test('Route option canBeMatched works correctly', () => {
    let router;
    const routes = fillRoutes({
        indexUpperCase: {
            options: {canBeMatched: false}
        },
        indexLowerCase: {
            options: {canBeMatched: true}
        },
        indexRandomCase: {}
    });

    router = new RussianRouter(routes, {caseSensitive: true});
    expect(router.matchUri(getRouteUri('indexUpperCase')).length).toBe(0);
    expect(router.matchUri(getRouteUri('indexLowerCase')).length).toBe(1);
    expect(router.matchUri(getRouteUri('indexRandomCase')).length).toBe(1);
});

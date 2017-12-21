import RussianRouter from 'russian-router';
import {
    getRouteUri,
    fillRoutes
} from 'utils';

test('Route option priority works correctly', () => {
    let router;
    let matchObjects;
    const routes = fillRoutes({
        indexUpperCase: {
            options: {priority: -1}
        },
        indexLowerCase: {
            options: {priority: 1}
        },
        indexRandomCase: {}
    });

    router = new RussianRouter(routes, {});
    matchObjects = router.matchUri(getRouteUri('indexLowerCase'));
    expect(matchObjects[0].name).toBe('indexLowerCase');
    expect(matchObjects[1].name).toBe('indexRandomCase');
    expect(matchObjects[2].name).toBe('indexUpperCase');
});

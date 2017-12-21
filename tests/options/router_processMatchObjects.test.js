import RussianRouter from 'russian-router';
import {
    getRouteUri,
    fillRoutes
} from 'utils';

test('Router option processMatchObjects works correctly', () => {
    let router;
    let matchObjects;
    const routes = fillRoutes({
        indexUpperCase: {
            options: {priority: 5}
        },
        indexRandomCase: {},
        indexLowerCase: {
            options: {priority: 10}
        }
    });

    // default value
    router = new RussianRouter(routes, {});
    matchObjects = router.matchUri(getRouteUri('indexLowerCase'));
    expect(matchObjects[0].name).toBe('indexLowerCase');
    expect(matchObjects[1].name).toBe('indexUpperCase');
    expect(matchObjects[2].name).toBe('indexRandomCase');

    // false
    router = new RussianRouter(routes, {processMatchObjects: false});
    matchObjects = router.matchUri(getRouteUri('indexLowerCase'));
    expect(matchObjects[0].name).toBe('indexUpperCase');
    expect(matchObjects[1].name).toBe('indexRandomCase');
    expect(matchObjects[2].name).toBe('indexLowerCase');

    // true
    router = new RussianRouter(routes, {processMatchObjects: true});
    matchObjects = router.matchUri(getRouteUri('indexLowerCase'));
    expect(matchObjects[0].name).toBe('indexLowerCase');
    expect(matchObjects[1].name).toBe('indexUpperCase');
    expect(matchObjects[2].name).toBe('indexRandomCase');

    // function value
    router = new RussianRouter(routes, {processMatchObjects: (matchObjects) => {
        return matchObjects.slice().reverse();
    }});
    matchObjects = router.matchUri(getRouteUri('indexLowerCase'));
    expect(matchObjects[0].name).toBe('indexLowerCase');
    expect(matchObjects[1].name).toBe('indexRandomCase');
    expect(matchObjects[2].name).toBe('indexUpperCase');
});

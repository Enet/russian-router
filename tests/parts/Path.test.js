import RussianRouter from 'russian-router';
import {
    fillRoutes
} from 'utils';

function fillRoute (params) {
    return fillRoutes({
        pathParam: {params}
    });
}

const options = {
    dataConsistency: false,
    caseSensitive: true
};

test('Path param can be presented only by function', () => {
    let routes;

    routes = fillRoute({path: '/hello/world'});
    expect(() => new RussianRouter(routes, options)).toThrow();
    routes = fillRoute({path: /\/hello\/world/});
    expect(() => new RussianRouter(routes, options)).toThrow();
    routes = fillRoute({path: {}});
    expect(() => new RussianRouter(routes, options)).toThrow();
    routes = fillRoute({path: function () {}});
    expect(() => new RussianRouter(routes, options)).not.toThrow();
});

test('Path part is matched correctly by function', () => {
    const routes = fillRoute({path: function (userUri, {partName, paramName, MatchFragment}) {
        const userUriPart = userUri.getParsedUri(partName);
        const userUriPartString = userUriPart.toString();
        if (userUriPartString !== '/hello/world') {
            return null;
        }
        const params = {[paramName]: userUriPartString};
        return new MatchFragment(userUriPartString, params);
    }});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/hello/world').length).toBe(1);
    expect(router.matchUri('/hello/world/').length).toBe(0);
    expect(router.matchUri('/Hello/world').length).toBe(0);
    expect(router.matchUri('hello/world').length).toBe(0);
    expect(router.matchUri('//localhost/hello/world').length).toBe(1);
});

test('Path part is generated correctly by function', () => {
    const routes = fillRoute({path: {
        match: function () {
            return null;
        },
        generate: function (userParams, {paramName}) {
            return '/hello/' + userParams[paramName];
        }
    }});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('pathParam', {path: 'world'})).toBe('/hello/world');
    expect(router.generateUri('pathParam', {path: 'user'})).toBe('/hello/user');
    expect(router.generateUri('pathParam', {path: ''})).toBe('/hello/');
    expect(router.generateUri('pathParam', {path: null})).toBe('/hello/null');
    expect(router.generateUri('pathParam', {path: undefined})).toBe('/hello/undefined');
    expect(router.generateUri('pathParam')).toBe('/hello/undefined');
});

test('Path part is generated correctly by string', () => {
    const routes = fillRoute({path: {
        match: function () {
            return null;
        },
        generate: '/hello/world'
    }});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('pathParam', {path: '/hello/user'})).toBe('/hello/user');
    expect(router.generateUri('pathParam', {path: ''})).toBe('/hello/world');
    expect(router.generateUri('pathParam', {path: null})).toBe('/hello/world');
    expect(router.generateUri('pathParam', {path: undefined})).toBe('/hello/world');
    expect(router.generateUri('pathParam')).toBe('/hello/world');
});

test('Path part is matched and generated correctly if param is not specified', () => {
    const routes = fillRoute({});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('').length).toBe(1);
    expect(router.matchUri('/hello/user').length).toBe(1);
    expect(router.matchUri('/hello/dear/user').length).toBe(1);
    expect(router.matchUri('/').length).toBe(1);
    expect(router.matchUri('//localhost/').length).toBe(1);
    expect(router.matchUri('relative').length).toBe(1);

    expect(router.generateUri('pathParam', {path: '/hello/user'})).toBe('/hello/user');
    expect(router.generateUri('pathParam', {path: '/hello/world/'})).toBe('/hello/world/');
    expect(router.generateUri('pathParam', {path: null})).toBe('');
    expect(router.generateUri('pathParam', {path: undefined})).toBe('');
    expect(router.generateUri('pathParam')).toBe('');
});

test('Path part is matched and generated correctly if presented by constant', () => {
    const routes = fillRoutes({
        pathConst: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('pathConst', {path: '/hello/user'})).toBe('/hello/world');
    expect(router.generateUri('pathConst')).toBe('/hello/world');
    expect(router.matchUri('/hello/user').length).toBe(0);
    expect(router.matchUri('/hello/world').length).toBe(1);
    expect(router.matchUri('/hello/WORLD').length).toBe(0);
});

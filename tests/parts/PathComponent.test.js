import RussianRouter from 'russian-router';
import {
    fillRoutes
} from 'utils';

function fillRoute (params) {
    return fillRoutes({
        pathComponentParam: {params}
    });
}

const options = {
    dataConsistency: false,
    caseSensitive: true
};

test('Path component part is matched correctly by string', () => {
    const routes = fillRoute({component: 'world'});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/hello/world').length).toBe(1);
    expect(router.matchUri('/hello/WORLD').length).toBe(0);
    expect(router.matchUri('/hello/user').length).toBe(0);
    expect(router.matchUri('/hello/').length).toBe(0);
    expect(router.matchUri('/hello').length).toBe(0);
});

test('Path component part is generated correctly by string', () => {
    const routes = fillRoute({component: 'world'});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('pathComponentParam')).toBe('/hello/world');
    expect(router.generateUri('pathComponentParam', {component: null})).toBe('/hello/world');
    expect(router.generateUri('pathComponentParam', {component: undefined})).toBe('/hello/world');
    expect(router.generateUri('pathComponentParam', {component: ''})).toBe('/hello/world');
    expect(router.generateUri('pathComponentParam', {component: 'WORLD'})).toBe('/hello/WORLD');
    expect(router.generateUri('pathComponentParam', {component: 'user'})).toBe('/hello/user');
});

test('Path component part is matched correctly by regular expression', () => {
    const routes = fillRoute({component: /^Worl?d$/});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/hello/World').length).toBe(1);
    expect(router.matchUri('/hello/Word').length).toBe(1);
    expect(router.matchUri('/hello/WORLD').length).toBe(0);
    expect(router.matchUri('/hello/user').length).toBe(0);
    expect(router.matchUri('/hello/').length).toBe(0);
    expect(router.matchUri('/hello').length).toBe(0);
});

test('Path component part is generated correctly by regular expression', () => {
    const routes = fillRoute({component: /^worl?d$/});
    const router = new RussianRouter(routes, options);

    expect(() => router.generateUri('pathComponentParam')).toThrow();
    expect(() => router.generateUri('pathComponentParam', {component: null})).toThrow();
    expect(() => router.generateUri('pathComponentParam', {component: undefined})).toThrow();
    expect(() => router.generateUri('pathComponentParam', {component: ''})).toThrow();
    expect(router.generateUri('pathComponentParam', {component: 'world'})).toBe('/hello/world');
    expect(router.generateUri('pathComponentParam', {component: 'user'})).toBe('/hello/user');
});

test('Path component part is matched correctly by function', () => {
    const routes = fillRoute({component: function (userUri, {partName, paramName, MatchFragment}) {
        const userUriPart = userUri.getParsedUri(partName);
        const userUriPathComponentString = (userUriPart.toArray()[1] + '').toLowerCase();
        if (userUriPathComponentString.indexOf('world') !== 0) {
            return null;
        }
        const params = {[paramName]: userUriPathComponentString};
        return new MatchFragment(userUriPathComponentString, params);
    }});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/hello/world').length).toBe(1);
    expect(router.matchUri('/hello/WORLD').length).toBe(1);
    expect(router.matchUri('/hello/user').length).toBe(0);
    expect(router.matchUri('/hello/worlds').length).toBe(1);
    expect(router.matchUri('/hello/').length).toBe(0);
    expect(router.matchUri('/hello').length).toBe(0);
});

test('Path component part is generated correctly by function', () => {
    const routes = fillRoute({component: {
        generate: function (userParams, {paramName}) {
            return userParams[paramName] + '/zzz';
        }
    }});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('pathComponentParam', {component: 'world'})).toBe('/hello/world%2Fzzz');
    expect(router.generateUri('pathComponentParam', {component: 'user'})).toBe('/hello/user%2Fzzz');
    expect(router.generateUri('pathComponentParam', {component: ''})).toBe('/hello/%2Fzzz');
    expect(router.generateUri('pathComponentParam', {component: null})).toBe('/hello/null%2Fzzz');
    expect(router.generateUri('pathComponentParam', {component: undefined})).toBe('/hello/undefined%2Fzzz');
    expect(router.generateUri('pathComponentParam', {})).toBe('/hello/undefined%2Fzzz');
    expect(router.generateUri('pathComponentParam')).toBe('/hello/undefined%2Fzzz');
});

test('Path component part is matched and generated correctly by match object', () => {
    const routes = fillRoute({component: {
        match: 'world',
        generate: 'user'
    }});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('pathComponentParam', {component: 'world'})).toBe('/hello/world');
    expect(router.generateUri('pathComponentParam', {component: 'user'})).toBe('/hello/user');
    expect(router.generateUri('pathComponentParam')).toBe('/hello/user');
    expect(router.matchUri('/hello/user').length).toBe(0);
    expect(router.matchUri('/hello/world').length).toBe(1);
    expect(router.matchUri('/hello/WORLD').length).toBe(0);
});

test('Path component part is matched and generated correctly if param is not specified', () => {
    const routes = fillRoute({});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('pathComponentParam', {component: 'world'})).toBe('/hello/world');
    expect(() => router.generateUri('pathComponentParam')).toThrow();
    expect(router.matchUri('/hello/world').length).toBe(1);
    expect(router.matchUri('/hello/user').length).toBe(1);
    expect(router.matchUri('/hello/WORLD').length).toBe(1);
    expect(router.matchUri('/hello/').length).toBe(0);
    expect(router.matchUri('/hello').length).toBe(0);
});

test('Path component part is matched and generated correctly if presented by constant', () => {
    const routes = fillRoutes({
        pathComponentConst: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('pathComponentConst', {component: 'user'})).toBe('/hello/world');
    expect(router.generateUri('pathComponentConst')).toBe('/hello/world');
    expect(router.matchUri('/hello/user').length).toBe(0);
    expect(router.matchUri('/hello/world').length).toBe(1);
    expect(router.matchUri('/hello/WORLD').length).toBe(0);
});



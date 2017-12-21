import RussianRouter from 'russian-router';
import {
    fillRoutes
} from 'utils';

function fillRoute (params) {
    return fillRoutes({
        hashParam: {params}
    });
}

const options = {
    dataConsistency: false,
    caseSensitive: true
};

test('Hash part is matched correctly by string', () => {
    const routes = fillRoute({hash: 'Hello'});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/#Hello').length).toBe(1);
    expect(router.matchUri('/#hello').length).toBe(0);
    expect(router.matchUri('/#world').length).toBe(0);
    expect(router.matchUri('/#').length).toBe(0);
    expect(router.matchUri('/').length).toBe(0);
});

test('Hash part is generated correctly by string', () => {
    const routes = fillRoute({hash: 'Hello'});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('hashParam')).toBe('/#Hello');
    expect(router.generateUri('hashParam', {hash: null})).toBe('/#Hello');
    expect(router.generateUri('hashParam', {hash: undefined})).toBe('/#Hello');
    expect(router.generateUri('hashParam', {hash: ''})).toBe('/#');
    expect(router.generateUri('hashParam', {hash: 'world'})).toBe('/#world');
    expect(router.generateUri('hashParam', {hash: '#'})).toBe('/#%23');
});

test('Hash part is matched correctly by regular expression', () => {
    const routes = fillRoute({hash: /^Worl?d$/});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/#World').length).toBe(1);
    expect(router.matchUri('/#world').length).toBe(0);
    expect(router.matchUri('/#Word').length).toBe(1);
    expect(router.matchUri('/#hello').length).toBe(0);
    expect(router.matchUri('/#').length).toBe(0);
    expect(router.matchUri('/').length).toBe(0);
});

test('Hash part is generated correctly by regular expression', () => {
    const routes = fillRoute({hash: /^Worl?d$/});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('hashParam')).toBe('/');
    expect(router.generateUri('hashParam', {hash: null})).toBe('/');
    expect(router.generateUri('hashParam', {hash: undefined})).toBe('/');
    expect(router.generateUri('hashParam', {hash: ''})).toBe('/#');
    expect(router.generateUri('hashParam', {hash: 'hello'})).toBe('/#hello');
    expect(router.generateUri('hashParam', {hash: 'world'})).toBe('/#world');
});

test('Hash part is matched correctly by function', () => {
    const routes = fillRoute({hash: function (userUri, {partName, paramName, MatchFragment}) {
        const userUriPart = userUri.getParsedUri(partName);
        const userUriPartString = (userUriPart + '').toLowerCase();
        if (userUriPartString.indexOf('world') !== 0) {
            return null;
        }
        const params = {[paramName]: userUriPartString};
        return new MatchFragment(userUriPartString, params);
    }});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/#world').length).toBe(1);
    expect(router.matchUri('/#WoRlD').length).toBe(1);
    expect(router.matchUri('/#hello').length).toBe(0);
    expect(router.matchUri('/#worlds').length).toBe(1);
    expect(router.matchUri('/#').length).toBe(0);
    expect(router.matchUri('/').length).toBe(0);
});

test('Hash part is generated correctly by function', () => {
    const routes = fillRoute({hash: {
        generate: function (userParams, {paramName}) {
            return 'hello' + userParams[paramName];
        }
    }});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('hashParam', {hash: 'World'})).toBe('/#helloWorld');
    expect(router.generateUri('hashParam', {hash: 'User'})).toBe('/#helloUser');
    expect(router.generateUri('hashParam', {hash: ''})).toBe('/#hello');
    expect(router.generateUri('hashParam', {hash: null})).toBe('/#hellonull');
    expect(router.generateUri('hashParam', {hash: undefined})).toBe('/#helloundefined');
    expect(router.generateUri('hashParam', {hash: +'z'})).toBe('/#helloNaN');
    expect(router.generateUri('hashParam')).toBe('/#helloundefined');
});

test('Hash part is matched and generated correctly by match object', () => {
    const routes = fillRoute({hash: {
        match: 'hello',
        generate: 'world'
    }});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('hashParam', {hash: 'world'})).toBe('/#world');
    expect(router.generateUri('hashParam', {hash: 'user'})).toBe('/#user');
    expect(router.generateUri('hashParam')).toBe('/#world');
    expect(router.matchUri('/#world').length).toBe(0);
    expect(router.matchUri('/#hello').length).toBe(1);
    expect(router.matchUri('/#user').length).toBe(0);
    expect(router.matchUri('/#Hello').length).toBe(0);
    expect(router.matchUri('/#').length).toBe(0);
});

test('Hash part is matched and generated correctly if param is not specified', () => {
    const routes = fillRoute({});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('hashParam', {hash: 'hello'})).toBe('/#hello');
    expect(router.generateUri('hashParam', {hash: ''})).toBe('/#');
    expect(router.generateUri('hashParam')).toBe('/');
    expect(router.matchUri('/').length).toBe(1);
    expect(router.matchUri('/#').length).toBe(1);
    expect(router.matchUri('/#Hello').length).toBe(1);
    expect(router.matchUri('/#World').length).toBe(1);
});

test('Hash part is matched and generated correctly if presented by constant', () => {
    const routes = fillRoutes({
        hashConst: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('hashConst', {hash: 'user'})).toBe('/#hello');
    expect(router.generateUri('hashConst')).toBe('/#hello');
    expect(router.matchUri('/#hello').length).toBe(1);
    expect(router.matchUri('/#Hello').length).toBe(0);
    expect(router.matchUri('/#HELLO').length).toBe(0);
    expect(router.matchUri('/#user').length).toBe(0);
    expect(router.matchUri('/#').length).toBe(0);
    expect(router.matchUri('/').length).toBe(0);
});


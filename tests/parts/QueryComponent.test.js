import RussianRouter from 'russian-router';
import {
    fillRoutes
} from 'utils';

function fillRoute (params) {
    return fillRoutes({
        queryComponentParam: {params}
    });
}

const options = {
    dataConsistency: false,
    caseSensitive: true
};

test('Query component part is matched correctly by string', () => {
    const routes = fillRoute({component: 'Abc'});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/?XXX=111&yyy&zzz=Abc').length).toBe(1);
    expect(router.matchUri('/?XXX=111&yyy=&zzz=Abc').length).toBe(1);
    expect(router.matchUri('/?XXX=111&yyy&ZZZ=Abc').length).toBe(0);
    expect(router.matchUri('/?xxx=111&yyy&zzz=abc').length).toBe(0);
    expect(router.matchUri('/?XXX=111&zzz=Abc').length).toBe(0);
    expect(router.matchUri('/?XXX=111&yyy=222&zzz=Abc').length).toBe(0);
});

test('Query component part is generated correctly by string', () => {
    const routes = fillRoute({component: '333'});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('queryComponentParam')).toBe('/?XXX=111&yyy=&zzz=333');
    expect(router.generateUri('queryComponentParam', {component: null})).toBe('/?XXX=111&yyy=&zzz=333');
    expect(router.generateUri('queryComponentParam', {component: undefined})).toBe('/?XXX=111&yyy=&zzz=333');
    expect(router.generateUri('queryComponentParam', {component: ''})).toBe('/?XXX=111&yyy=&zzz=');
    expect(router.generateUri('queryComponentParam', {COMPONENT: '999'})).toBe('/?XXX=111&yyy=&zzz=333');
    expect(router.generateUri('queryComponentParam', {component: '123'})).toBe('/?XXX=111&yyy=&zzz=123');
});

test('Query component part is matched correctly by regular expression', () => {
    const routes = fillRoute({component: /^Worl?d$/});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/?yyy&XXX=111&zzz=World').length).toBe(1);
    expect(router.matchUri('/?zzz=Word&XXX=111&yyy=').length).toBe(1);
    expect(router.matchUri('/?XXX=111&yyy&abc&zzz=Word').length).toBe(1);
    expect(router.matchUri('/?XXX=111&yyy&zzz=word').length).toBe(0);
    expect(router.matchUri('/?XXX=111&yyy=222&zzz=World').length).toBe(0);
    expect(router.matchUri('/?XXX=111&yyy=222&zzz=').length).toBe(0);
    expect(router.matchUri('/?XXX=111&yyy=222').length).toBe(0);
});

test('Query component part is generated correctly by regular expression', () => {
    const routes = fillRoute({component: /^worl?d$/});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('queryComponentParam')).toBe('/?XXX=111&yyy=&zzz=');
    expect(router.generateUri('queryComponentParam', {component: null})).toBe('/?XXX=111&yyy=&zzz=');
    expect(router.generateUri('queryComponentParam', {component: undefined})).toBe('/?XXX=111&yyy=&zzz=');
    expect(router.generateUri('queryComponentParam', {component: ''})).toBe('/?XXX=111&yyy=&zzz=');
    expect(router.generateUri('queryComponentParam', {component: 'world'})).toBe('/?XXX=111&yyy=&zzz=world');
    expect(router.generateUri('queryComponentParam', {component: 'user'})).toBe('/?XXX=111&yyy=&zzz=user');
});

test('Query component part is matched correctly by function', () => {
    const routes = fillRoute({component: function (userUri, {partName, paramName, MatchFragment}) {
        const userUriPart = userUri.getParsedUri(partName);
        const userUriQueryObject = userUriPart.toObject();
        const queryCoupleValue = (userUriQueryObject.zzz || '').toLowerCase();
        if (queryCoupleValue.indexOf('world') !== 0) {
            return null;
        }
        const params = {[paramName]: queryCoupleValue};
        return new MatchFragment(queryCoupleValue, params);
    }});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/?yyy&XXX=111&zzz=World').length).toBe(1);
    expect(router.matchUri('/?yyy&zzz=WORLD&XXX=111').length).toBe(1);
    expect(router.matchUri('/?yyy&XXX=111&zzz=word').length).toBe(0);
    expect(router.matchUri('/?yyy&XXX=111&zzz=Worlds').length).toBe(1);
    expect(router.matchUri('/?yyy&XXX=111&zzz=').length).toBe(0);
    expect(router.matchUri('/?yyy&XXX=111').length).toBe(0);
});

test('Query component part is generated correctly by function', () => {
    const routes = fillRoute({component: {
        generate: function (userParams, {paramName}) {
            return userParams[paramName] + '?';
        }
    }});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('queryComponentParam', {component: 'world'})).toBe('/?XXX=111&yyy=&zzz=world%3F');
    expect(router.generateUri('queryComponentParam', {component: 'user'})).toBe('/?XXX=111&yyy=&zzz=user%3F');
    expect(router.generateUri('queryComponentParam', {component: ''})).toBe('/?XXX=111&yyy=&zzz=%3F');
    expect(router.generateUri('queryComponentParam', {component: null})).toBe('/?XXX=111&yyy=&zzz=null%3F');
    expect(router.generateUri('queryComponentParam', {component: undefined})).toBe('/?XXX=111&yyy=&zzz=undefined%3F');
    expect(router.generateUri('queryComponentParam', {})).toBe('/?XXX=111&yyy=&zzz=undefined%3F');
    expect(router.generateUri('queryComponentParam')).toBe('/?XXX=111&yyy=&zzz=undefined%3F');
});

test('Query component part is matched and generated correctly by match object', () => {
    const routes = fillRoute({component: {
        match: 'world',
        generate: 'user'
    }});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('queryComponentParam', {component: 'world'})).toBe('/?XXX=111&yyy=&zzz=world');
    expect(router.generateUri('queryComponentParam', {component: 'user'})).toBe('/?XXX=111&yyy=&zzz=user');
    expect(router.generateUri('queryComponentParam')).toBe('/?XXX=111&yyy=&zzz=user');
    expect(router.matchUri('/?XXX=111&yyy=&zzz=world').length).toBe(1);
    expect(router.matchUri('/?XXX=111&yyy=&zzz=WORLD').length).toBe(0);
    expect(router.matchUri('/?XXX=111&yyy=&zzz=user').length).toBe(0);
});

test('Query component part is matched and generated correctly if param is not specified', () => {
    const routes = fillRoute({});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('queryComponentParam', {component: 'world'})).toBe('/?XXX=111&yyy=&zzz=world');
    expect(router.generateUri('queryComponentParam')).toBe('/?XXX=111&yyy=&zzz=');
    expect(router.matchUri('/?XXX=111&yyy=&zzz=world').length).toBe(1);
    expect(router.matchUri('/?XXX=111&yyy=&zzz=user').length).toBe(1);
    expect(router.matchUri('/?XXX=111&yyy=&zzz=WORLD').length).toBe(1);
    expect(router.matchUri('/?XXX=111&yyy=&zzz=').length).toBe(1);
    expect(router.matchUri('/?XXX=111&yyy=&zzz').length).toBe(1);
    expect(router.matchUri('/?XXX=111&yyy=').length).toBe(0);
});

test('Query component part is matched and generated correctly if presented by constant', () => {
    const routes = fillRoutes({
        queryComponentConst: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('queryComponentConst', {component: 'user'})).toBe('/?XXX=111&yyy=&zzz=333');
    expect(router.generateUri('queryComponentConst')).toBe('/?XXX=111&yyy=&zzz=333');
    expect(router.matchUri('/?XXX=111&yyy=&zzz=333').length).toBe(1);
    expect(router.matchUri('/?zzz=333&XXX=111&yyy=').length).toBe(1);
    expect(router.matchUri('/?zzz=333&XXX=111&yyy=&www').length).toBe(1);
    expect(router.matchUri('/?XXX=111&yyy=&ZZZ=333').length).toBe(0);
    expect(router.matchUri('/?XXX=111&yyy=&ZZZ=').length).toBe(0);
});

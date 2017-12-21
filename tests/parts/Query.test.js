import RussianRouter from 'russian-router';
import {
    fillRoutes
} from 'utils';

function fillRoute (params) {
    return fillRoutes({
        queryParam: {params}
    });
}

const options = {
    dataConsistency: false,
    caseSensitive: true
};

test('Query param can be presented only by function', () => {
    let routes;

    routes = fillRoute({query: 'x=1&y=2'});
    expect(() => new RussianRouter(routes, options)).toThrow();
    routes = fillRoute({query: /[xyz]=[123]/});
    expect(() => new RussianRouter(routes, options)).toThrow();
    routes = fillRoute({query: {}});
    expect(() => new RussianRouter(routes, options)).toThrow();
    routes = fillRoute({query: function () {}});
    expect(() => new RussianRouter(routes, options)).not.toThrow();
});

test('Query part is matched correctly by function', () => {
    const routes = fillRoute({query: function (userUri, {partName, paramName, MatchFragment}) {
        const userUriPart = userUri.getParsedUri(partName);
        const userUriPartObject = userUriPart.toObject();
        if (userUriPartObject.xxx > 111 && userUriPartObject.xxx < 333) {
            const params = {
                query: userUriPartObject,
                xxx: userUriPartObject.xxx
            };
            return new MatchFragment(userUriPart.toString(), params);
        }
        return null;
    }});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/?xxx=222').length).toBe(1);
    expect(router.matchUri('/?xxx=111').length).toBe(0);
    expect(router.matchUri('/?xxx=333').length).toBe(0);
    expect(router.matchUri('/?XXX=222').length).toBe(0);
    expect(router.matchUri('/?xxx').length).toBe(0);
    expect(router.matchUri('/?yyy=222').length).toBe(0);
    expect(router.matchUri('/?').length).toBe(0);
    expect(router.matchUri('/hello/world').length).toBe(0);
});

test('Query part is generated correctly by function', () => {
    const routes = fillRoute({query: {
        match: function () {
            return null;
        },
        generate: function (userParams, {paramName}) {
            return [
                'xxx=111',
                'yyy=' + encodeURIComponent(userParams[paramName]),
                'zzz=' + encodeURIComponent(userParams.zzz || '')
            ].join('&');
        }
    }});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('queryParam', {query: 'world'})).toBe('?xxx=111&yyy=world&zzz=');
    expect(router.generateUri('queryParam', {query: '222', zzz: 333})).toBe('?xxx=111&yyy=222&zzz=333');
    expect(router.generateUri('queryParam', {query: ''})).toBe('?xxx=111&yyy=&zzz=');
    expect(router.generateUri('queryParam', {query: null})).toBe('?xxx=111&yyy=null&zzz=');
    expect(router.generateUri('queryParam', {zzz: '?'})).toBe('?xxx=111&yyy=undefined&zzz=%3F');
    expect(router.generateUri('queryParam')).toBe('?xxx=111&yyy=undefined&zzz=');
});

test('Query part is generated correctly by string', () => {
    const routes = fillRoute({query: {
        match: function () {
            return null;
        },
        generate: 'xxx=111'
    }});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('queryParam', {query: 'yyy=222'})).toBe('?yyy=222');
    expect(router.generateUri('queryParam', {query: ''})).toBe('?xxx=111');
    expect(router.generateUri('queryParam', {query: null})).toBe('?xxx=111');
    expect(router.generateUri('queryParam', {query: undefined})).toBe('?xxx=111');
    expect(router.generateUri('queryParam')).toBe('?xxx=111');
});

test('Query part is matched and generated correctly if param is not specified', () => {
    const routes = fillRoute({});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/').length).toBe(1);
    expect(router.matchUri('/?').length).toBe(1);
    expect(router.matchUri('/?x=1').length).toBe(1);
    expect(router.matchUri('/?x').length).toBe(1);
    expect(router.matchUri('/?#').length).toBe(1);

    expect(router.generateUri('queryParam', {query: 'x=1'})).toBe('?x=1');
    expect(router.generateUri('queryParam', {query: 'x=1&y=2'})).toBe('?x=1&y=2');
    expect(router.generateUri('queryParam', {query: null})).toBe('');
    expect(router.generateUri('queryParam', {query: undefined})).toBe('');
    expect(router.generateUri('queryParam')).toBe('');
});

test('Query part is matched and generated correctly if presented by constant', () => {
    const routes = fillRoutes({
        queryConst: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('queryConst', {query: '?x=1'})).toBe('/?www=&xxx=111&YYY=bbb&zzz=');
    expect(router.generateUri('queryConst')).toBe('/?www=&xxx=111&YYY=bbb&zzz=');
    expect(router.matchUri('/?www&xxx=111&YYY=bbb&zzz=').length).toBe(1);
    expect(router.matchUri('/?xxx=111&YYY=bbb&zzz=&www').length).toBe(1);
    expect(router.matchUri('/?xxx=111&YYY=bbb&zzz&www').length).toBe(1);
    expect(router.matchUri('/?xxx=111&YYY=bbb&zzz&www=').length).toBe(1);
    expect(router.matchUri('/?xxx=111&YYY=bbb&zzz&www= ').length).toBe(0);
    expect(router.matchUri('/?xxx=111&YYY=bbb&zzz').length).toBe(0);
    expect(router.matchUri('/?xxx=111&yyy=bbb&zzz=&www').length).toBe(0);
    expect(router.matchUri('/?xxx=111&YYY=BBB&zzz=&www').length).toBe(0);
    expect(router.matchUri('/?').length).toBe(0);
    expect(router.matchUri('/').length).toBe(0);
});

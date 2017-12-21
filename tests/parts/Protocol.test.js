import RussianRouter from 'russian-router';
import {
    fillRoutes
} from 'utils';

function fillRoute (params) {
    return fillRoutes({
        protocolParam: {params}
    });
}

const options = {
    dataConsistency: false,
    caseSensitive: true
};

test('Protocol part is matched correctly by string', () => {
    const routes = fillRoute({protocol: 'http'});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('http://localhost/abc').length).toBe(1);
    expect(router.matchUri('HTTP://localhost/abc').length).toBe(1);
    expect(router.matchUri('https://localhost/abc').length).toBe(0);
    expect(router.matchUri('//localhost/abc').length).toBe(0);
    expect(router.matchUri('://localhost/abc').length).toBe(0);
});

test('Protocol part is generated correctly by string', () => {
    const routes = fillRoute({protocol: 'http'});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('protocolParam')).toBe('http://localhost/abc');
    expect(router.generateUri('protocolParam', {protocol: null})).toBe('http://localhost/abc');
    expect(router.generateUri('protocolParam', {protocol: undefined})).toBe('http://localhost/abc');
    expect(router.generateUri('protocolParam', {protocol: ''})).toBe('http://localhost/abc');
    expect(router.generateUri('protocolParam', {protocol: 'http'})).toBe('http://localhost/abc');
    expect(router.generateUri('protocolParam', {protocol: 'https'})).toBe('https://localhost/abc');
});

test('Protocol part is matched correctly by regular expression', () => {
    const routes = fillRoute({protocol: /^https?$/});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('http://localhost/abc').length).toBe(1);
    expect(router.matchUri('HTTP://localhost/abc').length).toBe(1);
    expect(router.matchUri('https://localhost/abc').length).toBe(1);
    expect(router.matchUri('ftp://localhost/abc').length).toBe(0);
    expect(router.matchUri('//localhost/abc').length).toBe(0);
    expect(router.matchUri('://localhost/abc').length).toBe(0);
});

test('Protocol part is generated correctly by regular expression', () => {
    const routes = fillRoute({protocol: /^https?$/});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('protocolParam')).toBe('//localhost/abc');
    expect(router.generateUri('protocolParam', {protocol: null})).toBe('//localhost/abc');
    expect(router.generateUri('protocolParam', {protocol: undefined})).toBe('//localhost/abc');
    expect(router.generateUri('protocolParam', {protocol: ''})).toBe('//localhost/abc');
    expect(router.generateUri('protocolParam', {protocol: 'http'})).toBe('http://localhost/abc');
    expect(router.generateUri('protocolParam', {protocol: 'https'})).toBe('https://localhost/abc');
    expect(router.generateUri('protocolParam', {protocol: 'ftp'})).toBe('ftp://localhost/abc');
});

test('Protocol part is matched correctly by function', () => {
    const routes = fillRoute({protocol: function (userUri, {partName, paramName, MatchFragment}) {
        const userUriPart = userUri.getParsedUri(partName);
        const userUriPartString = (userUriPart + '').toLowerCase();
        if (userUriPartString !== 'http' && userUriPartString !== 'ftp') {
            return null;
        }
        const params = {[paramName]: userUriPartString};
        return new MatchFragment(userUriPartString, params);
    }});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('http://localhost/abc').length).toBe(1);
    expect(router.matchUri('HTTP://localhost/abc').length).toBe(1);
    expect(router.matchUri('https://localhost/abc').length).toBe(0);
    expect(router.matchUri('ftp://localhost/abc').length).toBe(1);
    expect(router.matchUri('//localhost/abc').length).toBe(0);
    expect(router.matchUri('://localhost/abc').length).toBe(0);
});

test('Protocol part is generated correctly by function', () => {
    const routes = fillRoute({protocol: {
        generate: function (userParams, {paramName}) {
            return userParams[paramName] + 's';
        }
    }});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('protocolParam', {protocol: 'http'})).toBe('https://localhost/abc');
    expect(router.generateUri('protocolParam', {protocol: 'ftp'})).toBe('ftps://localhost/abc');
    expect(router.generateUri('protocolParam', {protocol: ''})).toBe('s://localhost/abc');
    expect(router.generateUri('protocolParam', {protocol: null})).toBe('nulls://localhost/abc');
    expect(router.generateUri('protocolParam', {protocol: undefined})).toBe('undefineds://localhost/abc');
    expect(router.generateUri('protocolParam', {})).toBe('undefineds://localhost/abc');
    expect(router.generateUri('protocolParam')).toBe('undefineds://localhost/abc');
});

test('Protocol part is matched and generated correctly by match object', () => {
    const routes = fillRoute({protocol: {
        match: 'https',
        generate: 'ssh'
    }});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('protocolParam', {protocol: 'http'})).toBe('http://localhost/abc');
    expect(router.generateUri('protocolParam')).toBe('ssh://localhost/abc');
    expect(router.matchUri('ssh://localhost/abc').length).toBe(0);
    expect(router.matchUri('https://localhost/abc').length).toBe(1);
    expect(router.matchUri('HTTPS://localhost/abc').length).toBe(1);
});

test('Protocol part is matched and generated correctly if param is not specified', () => {
    const routes = fillRoute({});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('protocolParam', {protocol: 'http'})).toBe('http://localhost/abc');
    expect(router.generateUri('protocolParam')).toBe('//localhost/abc');
    expect(router.matchUri('ssh://localhost/abc').length).toBe(1);
    expect(router.matchUri('https://localhost/abc').length).toBe(1);
    expect(router.matchUri('HTTPS://localhost/abc').length).toBe(1);
});

test('Protocol part is matched and generated correctly if presented by constant', () => {
    const routes = fillRoutes({
        protocolConst: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('protocolConst', {protocol: 'https'})).toBe('http://localhost/abc');
    expect(router.generateUri('protocolConst')).toBe('http://localhost/abc');
    expect(router.matchUri('ssh://localhost/abc').length).toBe(0);
    expect(router.matchUri('http://localhost/abc').length).toBe(1);
    expect(router.matchUri('HTTP://localhost/abc').length).toBe(1);
});

import RussianRouter from 'russian-router';
import {
    fillRoutes
} from 'utils';

function fillRoute (params) {
    return fillRoutes({
        domainParam: {params}
    });
}

const options = {
    dataConsistency: false,
    caseSensitive: true
};

test('Domain part is matched correctly by string', () => {
    const routes = fillRoute({domain: 'google.com'});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('//google.com/abc').length).toBe(1);
    expect(router.matchUri('//GOOGLE.com/abc').length).toBe(1);
    expect(router.matchUri('//facebook.com/abc').length).toBe(0);
    expect(router.matchUri('/abc').length).toBe(0);
    expect(router.matchUri('abc').length).toBe(0);
});

test('Domain part is generated correctly by string', () => {
    const routes = fillRoute({domain: 'google.com'});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('domainParam')).toBe('//google.com/abc');
    expect(router.generateUri('domainParam', {domain: null})).toBe('//google.com/abc');
    expect(router.generateUri('domainParam', {domain: undefined})).toBe('//google.com/abc');
    expect(router.generateUri('domainParam', {domain: ''})).toBe('//google.com/abc');
    expect(router.generateUri('domainParam', {domain: 'google.COM'})).toBe('//google.COM/abc');
    expect(router.generateUri('domainParam', {domain: 'facebook.com'})).toBe('//facebook.com/abc');
});

test('Domain part is matched correctly by regular expression', () => {
    const routes = fillRoute({domain: /^google\.\w+$/});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('//google.com/abc').length).toBe(1);
    expect(router.matchUri('//Google.Com/abc').length).toBe(1);
    expect(router.matchUri('//google.ru/abc').length).toBe(1);
    expect(router.matchUri('//facebook.com/abc').length).toBe(0);
    expect(router.matchUri('/abc').length).toBe(0);
    expect(router.matchUri('abc').length).toBe(0);
});

test('Domain part is generated correctly by regular expression', () => {
    const routes = fillRoute({domain: /^google\.\w+?$/});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('domainParam')).toBe('/abc');
    expect(router.generateUri('domainParam', {domain: null})).toBe('/abc');
    expect(router.generateUri('domainParam', {domain: undefined})).toBe('/abc');
    expect(router.generateUri('domainParam', {domain: ''})).toBe('/abc');
    expect(router.generateUri('domainParam', {domain: 'google.com'})).toBe('//google.com/abc');
    expect(router.generateUri('domainParam', {domain: 'facebook.com'})).toBe('//facebook.com/abc');
});

test('Domain part is matched correctly by function', () => {
    const routes = fillRoute({domain: function (userUri, {partName, paramName, MatchFragment}) {
        const userUriPart = userUri.getParsedUri(partName);
        const userUriPartString = (userUriPart + '').toLowerCase();
        if (userUriPartString.indexOf('google') !== 0) {
            return null;
        }
        const params = {[paramName]: userUriPartString};
        return new MatchFragment(userUriPartString, params);
    }});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('//google.com/abc').length).toBe(1);
    expect(router.matchUri('//gOOgle.COM/abc').length).toBe(1);
    expect(router.matchUri('//facebook.com/abc').length).toBe(0);
    expect(router.matchUri('//googlefake.com/abc').length).toBe(1);
    expect(router.matchUri('/abc').length).toBe(0);
    expect(router.matchUri('abc').length).toBe(0);
});

test('Domain part is generated correctly by function', () => {
    const routes = fillRoute({domain: {
        generate: function (userParams, {paramName}) {
            return userParams[paramName] + '.com';
        }
    }});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('domainParam', {domain: 'google'})).toBe('//google.com/abc');
    expect(router.generateUri('domainParam', {domain: 'facebook'})).toBe('//facebook.com/abc');
    expect(router.generateUri('domainParam', {domain: ''})).toBe('//.com/abc');
    expect(router.generateUri('domainParam', {domain: null})).toBe('//null.com/abc');
    expect(router.generateUri('domainParam', {domain: undefined})).toBe('//undefined.com/abc');
    expect(router.generateUri('domainParam', {})).toBe('//undefined.com/abc');
    expect(router.generateUri('domainParam')).toBe('//undefined.com/abc');
});

test('Domain part is matched and generated correctly by match object', () => {
    const routes = fillRoute({domain: {
        match: 'google.com',
        generate: 'facebook.com'
    }});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('domainParam', {domain: 'google.com'})).toBe('//google.com/abc');
    expect(router.generateUri('domainParam', {domain: 'facebook.com'})).toBe('//facebook.com/abc');
    expect(router.generateUri('domainParam')).toBe('//facebook.com/abc');
    expect(router.matchUri('//facebook.com/abc').length).toBe(0);
    expect(router.matchUri('//google.com/abc').length).toBe(1);
    expect(router.matchUri('//GOOGLE.COM/abc').length).toBe(1);
});

test('Domain part is matched and generated correctly if param is not specified', () => {
    const routes = fillRoute({});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('domainParam', {domain: 'google.com'})).toBe('//google.com/abc');
    expect(router.generateUri('domainParam')).toBe('/abc');
    expect(router.matchUri('//google.com/abc').length).toBe(1);
    expect(router.matchUri('//facebook.com/abc').length).toBe(1);
    expect(router.matchUri('//LOCALHOST/abc').length).toBe(1);
});

test('Domain part is matched and generated correctly if presented by constant', () => {
    const routes = fillRoutes({
        domainConst: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('domainConst', {domain: 'google.com'})).toBe('//localhost/abc');
    expect(router.generateUri('domainConst')).toBe('//localhost/abc');
    expect(router.matchUri('//google.com/abc').length).toBe(0);
    expect(router.matchUri('//localhost/abc').length).toBe(1);
    expect(router.matchUri('//LOCALHOST/abc').length).toBe(1);
});


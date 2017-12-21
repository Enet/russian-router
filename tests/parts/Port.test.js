import RussianRouter from 'russian-router';
import {
    fillRoutes
} from 'utils';

function fillRoute (params) {
    return fillRoutes({
        portParam: {params}
    });
}

const options = {
    dataConsistency: false,
    caseSensitive: true
};

test('Port part is matched correctly by string or number', () => {
    for (let port of ['8080', 8080]) {
        const routes = fillRoute({port});
        const router = new RussianRouter(routes, options);

        expect(router.matchUri('//localhost:8080/abc').length).toBe(1);
        expect(router.matchUri('//localhost:80/abc').length).toBe(0);
        expect(router.matchUri('//localhost/abc').length).toBe(0);
        expect(() => router.matchUri('//localhost:/abc').length).toThrow();
    }
});

test('Port part is generated correctly by string or number', () => {
    const routes = fillRoute({port: '8080'});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('portParam')).toBe('//localhost:8080/abc');
    expect(router.generateUri('portParam', {port: null})).toBe('//localhost:8080/abc');
    expect(router.generateUri('portParam', {port: undefined})).toBe('//localhost:8080/abc');
    expect(router.generateUri('portParam', {port: ''})).toBe('//localhost:8080/abc');
    expect(router.generateUri('portParam', {port: '0'})).toBe('//localhost:8080/abc');
    expect(router.generateUri('portParam', {port: '1234'})).toBe('//localhost:1234/abc');
    expect(router.generateUri('portParam', {port: 0})).toBe('//localhost:8080/abc');
    expect(router.generateUri('portParam', {port: 1234})).toBe('//localhost:1234/abc');
    expect(router.generateUri('portParam', {port: 8080})).toBe('//localhost:8080/abc');
});

test('Port part is matched correctly by regular expression', () => {
    const routes = fillRoute({port: /^80(\d)\1$/});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('//localhost:8088/abc').length).toBe(1);
    expect(router.matchUri('//localhost:8011/abc').length).toBe(1);
    expect(router.matchUri('//localhost:8000/abc').length).toBe(1);
    expect(router.matchUri('//localhost:8080/abc').length).toBe(0);
    expect(router.matchUri('//localhost/abc').length).toBe(0);
    expect(router.matchUri('//localhost:0/abc').length).toBe(0);
});

test('Port part is generated correctly by regular expression', () => {
    const routes = fillRoute({port: /^80(\d)\1$/});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('portParam')).toBe('//localhost/abc');
    expect(router.generateUri('portParam', {port: null})).toBe('//localhost/abc');
    expect(router.generateUri('portParam', {port: undefined})).toBe('//localhost/abc');
    expect(router.generateUri('portParam', {port: ''})).toBe('//localhost/abc');
    expect(router.generateUri('portParam', {port: '8088'})).toBe('//localhost:8088/abc');
    expect(router.generateUri('portParam', {port: '8080'})).toBe('//localhost:8080/abc');
    expect(router.generateUri('portParam', {port: 8000})).toBe('//localhost:8000/abc');
    expect(router.generateUri('portParam', {port: 0})).toBe('//localhost/abc');
});

test('Port part is matched correctly by function', () => {
    const routes = fillRoute({port: function (userUri, {partName, paramName, MatchFragment}) {
        const userUriPart = userUri.getParsedUri(partName);
        const userUriPartNumber = +userUriPart || 0;
        if (userUriPartNumber < 1000) {
            return null;
        }
        const params = {[paramName]: userUriPartNumber};
        return new MatchFragment(userUriPartNumber, params);
    }});
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('//localhost:1000/abc').length).toBe(1);
    expect(router.matchUri('//localhost:8080/abc').length).toBe(1);
    expect(router.matchUri('//localhost/abc').length).toBe(0);
    expect(router.matchUri('//localhost:99999/abc').length).toBe(1);
    expect(router.matchUri('//localhost:0/abc').length).toBe(0);
    expect(() => router.matchUri('//localhost:z/abc').length).toThrow();
});

test('Port part is generated correctly by function', () => {
    const routes = fillRoute({port: {
        generate: function (userParams, {paramName}) {
            return '80' + (1 * userParams[paramName] || 0);
        }
    }});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('portParam', {port: '80'})).toBe('//localhost:8080/abc');
    expect(router.generateUri('portParam', {port: '0'})).toBe('//localhost:800/abc');
    expect(router.generateUri('portParam', {port: ''})).toBe('//localhost:800/abc');
    expect(router.generateUri('portParam', {port: null})).toBe('//localhost:800/abc');
    expect(router.generateUri('portParam', {port: undefined})).toBe('//localhost:800/abc');
    expect(router.generateUri('portParam', {})).toBe('//localhost:800/abc');
    expect(router.generateUri('portParam')).toBe('//localhost:800/abc');
});

test('Port part is matched and generated correctly by match object', () => {
    const routes = fillRoute({port: {
        match: 4444,
        generate: 8888
    }});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('portParam', {port: 8888})).toBe('//localhost:8888/abc');
    expect(router.generateUri('portParam', {port: 9999})).toBe('//localhost:9999/abc');
    expect(router.generateUri('portParam')).toBe('//localhost:8888/abc');
    expect(router.matchUri('//localhost/abc').length).toBe(0);
    expect(router.matchUri('//localhost:8888/abc').length).toBe(0);
    expect(router.matchUri('//localhost:4444/abc').length).toBe(1);
});

test('Port part is matched and generated correctly if param is not specified', () => {
    const routes = fillRoute({});
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('portParam', {port: 8080})).toBe('//localhost:8080/abc');
    expect(router.generateUri('portParam')).toBe('//localhost/abc');
    expect(router.matchUri('//localhost/abc').length).toBe(1);
    expect(router.matchUri('//localhost:1234/abc').length).toBe(1);
    expect(router.matchUri('//localhost:8080/abc').length).toBe(1);
});

test('Port part is matched and generated correctly if presented by constant', () => {
    const routes = fillRoutes({
        portConst: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('portConst', {port: 8888})).toBe('//localhost:1234/abc');
    expect(router.generateUri('portConst')).toBe('//localhost:1234/abc');
    expect(router.matchUri('//localhost/abc').length).toBe(0);
    expect(router.matchUri('//localhost:8888/abc').length).toBe(0);
    expect(router.matchUri('//localhost:1234/abc').length).toBe(1);
});



import RussianRouter from 'russian-router';
import {
    fillRoutes
} from 'utils';

const options = {
    dataConsistency: false
};

test('Simple relative path works correctly', () => {
    const routes = fillRoutes({
        relativePath: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/hello/world').length).toBe(1);
    expect(router.matchUri('/hello/world/').length).toBe(1);
    expect(router.matchUri('/hello/world?asdf=1234').length).toBe(1);
    expect(router.matchUri('/and/hello/world').length).toBe(1);
    expect(router.matchUri('/and/hello/world/').length).toBe(1);
    expect(router.matchUri('/and/hello/world/?asdf=1234').length).toBe(1);
    expect(router.matchUri('/hello/my/world/').length).toBe(0);
    expect(router.matchUri('/hello/world/my').length).toBe(0);
    expect(router.matchUri('/hello/world/my/').length).toBe(0);
    expect(router.matchUri('/abchello/world').length).toBe(0);
    expect(router.generateUri('relativePath')).toBe('hello/world');
});

test('Simple relative query works correctly', () => {
    const routes = fillRoutes({
        relativeQuery: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/?x=1&y=2').length).toBe(1);
    expect(router.matchUri('/?x=1&y=2&z=3').length).toBe(1);
    expect(router.matchUri('/?y=2&x=1').length).toBe(1);
    expect(router.matchUri('/?y=2&x=1&y=2&x=1').length).toBe(1);
    expect(router.matchUri('/hello?y=2&x=1').length).toBe(1);
    expect(router.matchUri('/hello/world/?y=2&x=1').length).toBe(1);
    expect(router.matchUri('/hello/?w&x=1&y=2&z=3').length).toBe(1);
    expect(router.matchUri('/hello/?x=1&y=2#asdf').length).toBe(1);
    expect(router.matchUri('/?x=2&y=2').length).toBe(0);
    expect(router.matchUri('/?x=&y=2').length).toBe(0);
    expect(router.matchUri('/?x=1&y=2&y').length).toBe(0);
    expect(router.matchUri('/?x=1&y=2&x').length).toBe(0);
    expect(router.matchUri('/?').length).toBe(0);
    expect(router.generateUri('relativeQuery')).toBe('?x=1&y=2');
});

test('Simple relative hash works correctly', () => {
    const routes = fillRoutes({
        relativeHash: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/#zzz').length).toBe(1);
    expect(router.matchUri('/hello#zzz').length).toBe(1);
    expect(router.matchUri('/hello/world/#zzz').length).toBe(1);
    expect(router.matchUri('/hello/?#zzz').length).toBe(1);
    expect(router.matchUri('/hello/?x=1#zzz').length).toBe(1);
    expect(router.matchUri('/hello/?x=1&y=2#zzz').length).toBe(1);
    expect(router.matchUri('/hello/?x=1&y=2#zzzz').length).toBe(0);
    expect(router.matchUri('/hello/?x=1&y=2#yzzz').length).toBe(0);
    expect(router.matchUri('/hello/?x=1&y=2#').length).toBe(0);
    expect(router.matchUri('/hello/?x=1&y=2').length).toBe(0);
    expect(router.matchUri('/?#').length).toBe(0);
    expect(router.matchUri('/#').length).toBe(0);
    expect(router.generateUri('relativeHash')).toBe('#zzz');
});

test('Relative path + query work correctly', () => {
    const routes = fillRoutes({
        relativePathQuery: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/hello/world?x=1&y=2').length).toBe(1);
    expect(router.matchUri('/and/hello/world?x=1&y=2').length).toBe(1);
    expect(router.matchUri('/hello/world/?x=1&y=2').length).toBe(1);
    expect(router.matchUri('/hello/world?y=2&x=1').length).toBe(1);
    expect(router.matchUri('/hello/world?x=1&y=2&z=3').length).toBe(1);
    expect(router.matchUri('/hello/world?x=1&y=2#').length).toBe(1);
    expect(router.matchUri('/hello/world?x=1&y=2#asdf').length).toBe(1);
    expect(router.matchUri('/?x=1&y=2').length).toBe(0);
    expect(router.matchUri('/hello/world?').length).toBe(0);
    expect(router.generateUri('relativePathQuery')).toBe('hello/world?x=1&y=2');
});

test('Relative path + hash work correctly', () => {
    const routes = fillRoutes({
        relativePathHash: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/hello/world#zzz').length).toBe(1);
    expect(router.matchUri('/and/hello/world#zzz').length).toBe(1);
    expect(router.matchUri('/hello/world/#zzz').length).toBe(1);
    expect(router.matchUri('/hello/world?#zzz').length).toBe(1);
    expect(router.matchUri('/hello/world?x=1&y=2#zzz').length).toBe(1);
    expect(router.matchUri('/hello/world?xyz#zzz').length).toBe(1);
    expect(router.matchUri('/hello/world#zzz?xyz=123').length).toBe(0);
    expect(router.matchUri('/hello/world#asdf').length).toBe(0);
    expect(router.matchUri('/#zzz').length).toBe(0);
    expect(router.matchUri('/hello/world#').length).toBe(0);
    expect(router.matchUri('/hello/world').length).toBe(0);
    expect(router.generateUri('relativePathHash')).toBe('hello/world#zzz');
});

test('Relative query + hash work correctly', () => {
    const routes = fillRoutes({
        relativeQueryHash: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/?x=1&y=2#zzz').length).toBe(1);
    expect(router.matchUri('/?y=2&x=1&#zzz').length).toBe(1);
    expect(router.matchUri('/?y=2&x=1&&&#zzz').length).toBe(1);
    expect(router.matchUri('/hello?y=2&x=1&&&#zzz').length).toBe(1);
    expect(router.matchUri('/hello/?y=2&x=1&&&#zzz').length).toBe(1);
    expect(router.matchUri('/hello/#zzz?y=2&x=1').length).toBe(0);
    expect(router.matchUri('/hello/?y=2&x=1#zzzz').length).toBe(0);
    expect(router.matchUri('/hello/?y=1&x=1#zzz').length).toBe(0);
    expect(router.matchUri('/hello/?y&x#zzz').length).toBe(0);
    expect(router.matchUri('/hello/?x=1&y=2&x=#zzz').length).toBe(0);
    expect(router.generateUri('relativeQueryHash')).toBe('?x=1&y=2#zzz');
});

test('Relative path + query + hash work correctly', () => {
    const routes = fillRoutes({
        relativePathQueryHash: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/hello/world?x=1&y=2#zzz').length).toBe(1);
    expect(router.matchUri('/hello/world/?y=2&x=1&#zzz').length).toBe(1);
    expect(router.matchUri('/hello/world?y=2&x=1&&&#zzz').length).toBe(1);
    expect(router.matchUri('/hello/world/?y=2&x=1&&&#zzz').length).toBe(1);
    expect(router.matchUri('/hello/world?y=2&x=1&&&#zzz').length).toBe(1);
    expect(router.matchUri('/and/hello/world/?x=1&y=2#zzz').length).toBe(1);
    expect(router.matchUri('/and/hello/world?y=2&x=1&#zzz').length).toBe(1);
    expect(router.matchUri('/and/hello/world/?y=2&x=1&&&#zzz').length).toBe(1);
    expect(router.matchUri('/and/hello/world?y=2&x=1&&&#zzz').length).toBe(1);
    expect(router.matchUri('/and/hello/world/?y=2&x=1&&&#zzz').length).toBe(1);
    expect(router.matchUri('/hello/world#zzz?y=2&x=1').length).toBe(0);
    expect(router.matchUri('/hello/world?y=2&x=1#zzzz').length).toBe(0);
    expect(router.matchUri('/hello/world/?y=1&x=1#zzz').length).toBe(0);
    expect(router.matchUri('/hello/world/?y&x#zzz').length).toBe(0);
    expect(router.matchUri('/hello/world?x=1&y=2&x=#zzz').length).toBe(0);
    expect(router.matchUri('/hello/my/world?x=1&y=2#zzz').length).toBe(0);
    expect(router.matchUri('/hello/world/and?x=1&y=2#zzz').length).toBe(0);
    expect(router.generateUri('relativePathQueryHash')).toBe('hello/world?x=1&y=2#zzz');
});

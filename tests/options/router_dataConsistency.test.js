import RussianRouter from 'russian-router';
import {
    fillRoutes
} from 'utils';

test('Router option dataConsistency works correctly', () => {
    let router;
    const routes = fillRoutes({
        indexOneParam: {
            params: {x: /\d+/}
        }
    });

    // default value
    router = new RussianRouter(routes, {});
    expect(() => router.generateUri('indexOneParam', {x: 12345})).not.toThrow();
    expect(() => router.generateUri('indexOneParam', {x: 'abc'})).toThrow();

    // true
    router = new RussianRouter(routes, {dataConsistency: true});
    expect(() => router.generateUri('indexOneParam', {x: 12345})).not.toThrow();
    expect(() => router.generateUri('indexOneParam', {x: 'abc'})).toThrow();

    // false
    router = new RussianRouter(routes, {dataConsistency: false});
    expect(() => router.generateUri('indexOneParam', {x: 12345})).not.toThrow();
    expect(() => router.generateUri('indexOneParam', {x: 'abc'})).not.toThrow();
});

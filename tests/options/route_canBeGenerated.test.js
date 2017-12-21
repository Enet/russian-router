import RussianRouter from 'russian-router';
import {
    fillRoutes
} from 'utils';

test('Route option canBeGenerated works correctly', () => {
    let router;
    const routes = fillRoutes({
        indexUpperCase: {
            options: {canBeGenerated: false}
        },
        indexLowerCase: {
            options: {canBeGenerated: true}
        },
        indexRandomCase: {}
    });

    router = new RussianRouter(routes, {});
    expect(() => router.generateUri('indexUpperCase')).toThrow();
    expect(() => router.generateUri('indexLowerCase')).not.toThrow();
    expect(() => router.generateUri('indexRandomCase')).not.toThrow();
});

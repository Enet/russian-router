import RussianRouter from 'russian-router';
import {
    fillRoutes
} from 'utils';

const options = {
    dataConsistency: false
};

test('Constant empty path component works correctly', () => {
    const routes = fillRoutes({
        constPathComponent: {}
    });
    expect(() => new RussianRouter(routes, options)).toThrow();
});

test('Required empty path component works correctly', () => {
    const routes = fillRoutes({
        requiredPathComponent: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/2/plus/3/is/5').length).toBe(1);
    expect(router.matchUri('/2/ /3/is/5').length).toBe(1);
    expect(router.matchUri('/2//3/is/5').length).toBe(1);
    expect(router.matchUri('/2/3/is/5').length).toBe(0);
    expect(() => router.generateUri('requiredPathComponent')).toThrow();
    expect(() => router.generateUri('requiredPathComponent', {x: null})).toThrow();
    expect(() => router.generateUri('requiredPathComponent', {x: undefined})).toThrow();
    expect(() => router.generateUri('requiredPathComponent', {x: ''})).toThrow();
});

test('Optional empty path component works correctly', () => {
    const routes = fillRoutes({
        optionalPathComponent: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/2/plus/3/is/5').length).toBe(1);
    expect(router.matchUri('/2/ /3/is/5').length).toBe(1);
    expect(router.matchUri('/2//3/is/5').length).toBe(1);
    expect(router.matchUri('/2/3/is/5').length).toBe(1);
    expect(router.generateUri('optionalPathComponent')).toBe('/2/3/is/5');
    expect(router.generateUri('optionalPathComponent', {x: null})).toBe('/2/3/is/5');
    expect(router.generateUri('optionalPathComponent', {x: undefined})).toBe('/2/3/is/5');
    expect(router.generateUri('optionalPathComponent', {x: ''})).toBe('/2/3/is/5');
    expect(router.generateUri('optionalPathComponent', {x: 'plus'})).toBe('/2/plus/3/is/5');
});

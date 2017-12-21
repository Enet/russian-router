import RussianRouter from 'russian-router';
import {
    fillRoutes
} from 'utils';

const options = {
    dataConsistency: false
};

test('Constant empty query component works correctly', () => {
    const routes = fillRoutes({
        constQueryComponent: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/?x&y&z=3').length).toBe(1);
    expect(router.matchUri('/?x=&y&z=3').length).toBe(1);
    expect(router.matchUri('/?x=&y=&z=3').length).toBe(1);
    expect(router.matchUri('/?x&y=&z=3').length).toBe(1);
    expect(router.matchUri('/?x&y=&z=3&').length).toBe(1);
    expect(router.matchUri('/?x&y=&z=3&w').length).toBe(1);
    expect(router.matchUri('/?x&z=3&y=').length).toBe(1);
    expect(router.matchUri('/?z=3&y=').length).toBe(0);
    expect(router.matchUri('/?z=3&y=&').length).toBe(0);
    expect(router.matchUri('/?z=3&y=1&x=').length).toBe(0);
    expect(router.matchUri('/?z=3&y&x=1').length).toBe(0);
    expect(router.generateUri('constQueryComponent')).toBe('/?x=&y=&z=3');
});

test('Required empty query component works correctly', () => {
    const routes = fillRoutes({
        requiredQueryComponent: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/?x').length).toBe(1);
    expect(router.matchUri('/?x=').length).toBe(1);
    expect(router.matchUri('/?y=2&x=').length).toBe(1);
    expect(router.matchUri('/?y=2&x').length).toBe(1);
    expect(router.matchUri('/?x=1').length).toBe(1);
    expect(router.matchUri('/?y=1').length).toBe(0);
    expect(router.matchUri('/?y').length).toBe(0);
    expect(router.generateUri('requiredQueryComponent', {x: 1})).toBe('/?x=1');
    expect(router.generateUri('requiredQueryComponent', {x: null})).toBe('/?x=');
    expect(router.generateUri('requiredQueryComponent', {x: undefined})).toBe('/?x=');
    expect(router.generateUri('requiredQueryComponent', {x: ''})).toBe('/?x=');
    expect(router.generateUri('requiredQueryComponent')).toBe('/?x=');
});

test('Optional empty query component works correctly', () => {
    const routes = fillRoutes({
        optionalQueryComponent: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/?x').length).toBe(1);
    expect(router.matchUri('/?x=').length).toBe(1);
    expect(router.matchUri('/?y=2&x=').length).toBe(1);
    expect(router.matchUri('/?x=1').length).toBe(1);
    expect(router.matchUri('/?y=1').length).toBe(1);
    expect(router.matchUri('/?y').length).toBe(1);
    expect(router.matchUri('/').length).toBe(1);
    expect(router.generateUri('optionalQueryComponent', {x: 1})).toBe('/?x=1');
    expect(router.generateUri('optionalQueryComponent', {x: null})).toBe('/');
    expect(router.generateUri('optionalQueryComponent', {x: undefined})).toBe('/');
    expect(router.generateUri('optionalQueryComponent', {x: ''})).toBe('/?x=');
    expect(router.generateUri('optionalQueryComponent')).toBe('/');
});

import Route from '../../src/Route.js';

test('Route provides its own options', () => {
    const route = new Route('index', {
        uri: '/',
        options: {
            canBeGenerated: false
        }
    });

    expect(typeof route.getParsedOptions()).toBe('object');
    expect(route.getParsedOptions().canBeGenerated).toBeFalsy();
});

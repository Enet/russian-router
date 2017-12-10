import RussianRouter from '../src/index.js';

const routes = {
    index: {
        uri: '/hello/{name}/',
        params: {
            name: ['world', 'people']
        }
    }
};
const options = {};
const router = new RussianRouter(routes, options);

// Test coverage is about 100 percents
test('Router generates uri', () => {
    expect(router.generateUri('index')).toBe('/hello/world/');
    expect(router.generateUri('index', {name: 'people'})).toBe('/hello/people/');
});

test('Router matches uri', () => {
    expect(router.matchUri('/hello/world/').length).toBe(1);
    expect(router.matchUri('/hello/people/').length).toBe(1);
    expect(router.matchUri('/hello/there/').length).toBe(0);
    expect(router.matchUri('/hello/world/')[0].params.name).toBe('world');
    expect(router.matchUri('/hello/people/')[0].params.name).toBe('people');
});

import RussianRouter from '../index.js';

const routes = {
    index: {
        uri: '/hello/world'
    }
};

const options = {

};

let router;

beforeEach(() => {
    router = new RussianRouter(routes, options);
});

test('Generate correct url', () => {
    expect(router.generateUri('index')).toBe('/hello/world');
});

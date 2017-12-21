import RussianRouter from 'russian-router';

test('Paths are normalized', () => {
    const router = new RussianRouter({
        index: {
            uri: '/hello/../world/.'
        }
    });
    expect(router.matchUri('/world').length).toBe(1);
});

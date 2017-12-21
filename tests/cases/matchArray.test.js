import RussianRouter from 'russian-router';

test('Match items can be presented by array', () => {
    const router = new RussianRouter({
        index: {
            uri: '/{x}',
            params: {
                x: [null, undefined, null, undefined, 'abc', 'cba']
            }
        }
    });

    expect(router.matchUri('/').length).toBe(0);
    expect(router.matchUri('/null').length).toBe(0);
    expect(router.matchUri('/undefined').length).toBe(0);
    expect(router.matchUri('/abc').length).toBe(1);
    expect(router.matchUri('/cba').length).toBe(1);
    expect(router.generateUri('index', {x: 'cba'})).toBe('/cba');
    expect(router.generateUri('index')).toBe('/abc');
});

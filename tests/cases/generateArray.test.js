import RussianRouter from 'russian-router';

test('Generate items can be presented by array', () => {
    const router = new RussianRouter({
        index: {
            uri: '/{x}',
            params: {
                x: {
                    match: [1, 2, 3],
                    generate: [
                        null,
                        undefined,
                        null,
                        undefined,
                        () => null,
                        () => undefined,
                        '3'
                    ]
                }
            }
        }
    });

    expect(router.matchUri('/1').length).toBe(1);
    expect(router.matchUri('/2').length).toBe(1);
    expect(router.matchUri('/3').length).toBe(1);
    expect(router.generateUri('index')).toBe('/3');
});

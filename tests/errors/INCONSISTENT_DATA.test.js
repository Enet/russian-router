import RussianRouter from 'russian-router';

test('Error INCONSISTENT_DATA happens', () => {
    const router = new RussianRouter({
        index: {
            uri: '/{x}',
            params: {
                x: /hello/
            }
        }
    }, {
        dataConsistency: true
    });
    expect(() => router.generateUri('index', {x: 'world'})).toThrow(/\bINCONSISTENT_DATA\b/);
});

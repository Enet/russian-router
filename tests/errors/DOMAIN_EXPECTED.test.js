import RussianRouter from 'russian-router';

test('Error DOMAIN_EXPECTED happens', () => {
    const router = new RussianRouter({
        index: {
            uri: '{protocol}://{domain}/hello/world'
        }
    }, {});
    expect(() => router.generateUri('index', {
        protocol: 'https'
    })).toThrow(/\bDOMAIN_EXPECTED\b/);
});

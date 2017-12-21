import RussianRouter from 'russian-router';

test('Error INVALID_PATH_STRUCTURE happens', () => {
    const router = new RussianRouter({
        index: {
            uri: '//{domain}{path}'
        }
    }, {});

    expect(() => router.generateUri('index', {
        domain: 'localhost',
        path: 'relative'
    })).toThrow(/\bINVALID_PATH_STRUCTURE\b/);

    expect(() => new RussianRouter({
        index: {
            uri: '//{domain}:80relative'
        }
    })).toThrow(/\bINVALID_PATH_STRUCTURE\b/);
});

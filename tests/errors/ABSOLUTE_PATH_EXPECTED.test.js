import RussianRouter from 'russian-router';

test('Error ABSOLUTE_PATH_EXPECTED happens', () => {
    const router = new RussianRouter({
        index: {
            uri: 'relative/path'
        }
    });
    expect(() => router.matchUri('/relative/path')).not.toThrow();
    expect(() => router.matchUri('relative/path')).toThrow(/\bABSOLUTE_PATH_EXPECTED\b/);
});

import RussianRouter from 'russian-router';

test('Error FUNCTION_EXPECTED happens', () => {
    expect(() => new RussianRouter({
        index: {
            uri: '//localhost{path}',
            params: {path: /\d/}
        }
    })).toThrow(/\bFUNCTION_EXPECTED\b/);
});

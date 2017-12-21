import * as namespace from 'russian-router';

test('Russian router exports correct values', () => {
    expect(namespace.RussianRouter).toBeDefined();
    expect(namespace.RouterError).toBeDefined();
    expect(namespace.MatchFragment).toBeDefined();
    expect(namespace.utils).toBeDefined();
});

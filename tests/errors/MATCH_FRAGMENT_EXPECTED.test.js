import RussianRouter from 'russian-router';

test('Error MATCH_FRAGMENT_EXPECTED happens', () => {
    const router = new RussianRouter({
        index: {
            uri: '/hello/{entity}',
            params: {
                entity: function (userUri, {MatchFragment}) {
                    return 'world';
                }
            }
        }
    });

    expect(() => router.matchUri('/hello/world')).toThrow(/\bMATCH_FRAGMENT_EXPECTED\b/);
});

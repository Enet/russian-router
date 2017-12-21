import RussianRouter from 'russian-router';

test('Error INVALID_ROUTE_NAME happens', () => {
    const router = new RussianRouter({}, {});
    expect(() => router.generateUri('nonExistent')).toThrow(/\bINVALID_ROUTE_NAME\b/);
});

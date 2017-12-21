import RussianRouter from 'russian-router';

test('Russian router provides useful methods to be extended', () => {
    const router = new RussianRouter();
    expect(typeof router.getParsedRoutes()).toBe('object');
    expect(typeof router.getParsedOptions()).toBe('object');
    expect(() => router.destructor()).not.toThrow();
});

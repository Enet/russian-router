import RussianRouter from 'russian-router';

class CustomRussianRouter extends RussianRouter {

}

CustomRussianRouter.prototype.getDefaultPart = null;

test('Error INVALID_DEFAULT_GETTER happens', () => {
    expect(() => new CustomRussianRouter({}, {})).toThrow(/\bINVALID_DEFAULT_GETTER\b/);
});

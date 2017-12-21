import {
    RouterError
} from 'russian-router';

test('Error CUSTOM_ERROR happens', () => {
    expect(function () {
        throw new RouterError(RouterError.CUSTOM_ERROR, {
            message: 'Ooops!'
        });
    }).toThrow(/\bCUSTOM_ERROR\b/);
});

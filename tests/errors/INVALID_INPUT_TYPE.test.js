import RussianRouter from 'russian-router';

test('Error INVALID_INPUT_TYPE happens', () => {
    expect(() => new RussianRouter({}, 'options')).toThrow(/\bINVALID_INPUT_TYPE\b/);
    expect(() => new RussianRouter({
        index: {uri: true}
    }, {})).toThrow(/\bINVALID_INPUT_TYPE\b/);
    expect(() => new RussianRouter({
        index: {params: true}
    }, {})).toThrow(/\bINVALID_INPUT_TYPE\b/);
    expect(() => new RussianRouter({
        index: {options: true}
    }, {})).toThrow(/\bINVALID_INPUT_TYPE\b/);
});

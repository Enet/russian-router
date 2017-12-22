import {
    utils
} from 'russian-router';

test('Functions from utils work correctly', () => {
    expect(utils.toLowerCase('HELLO')).toBe('hello');
    expect(utils.toTitleCase('hello')).toBe('Hello');
    expect(utils.toUpperCase('hello')).toBe('HELLO');
    expect(utils.toLowerCase()).toBe('');
    expect(utils.toTitleCase()).toBe('');
    expect(utils.toUpperCase()).toBe('');
    expect(utils.splitUri('//localhost:8080', utils.getRegExp('uri')).path).toBe('/');
});

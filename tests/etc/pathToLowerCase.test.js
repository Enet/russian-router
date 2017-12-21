import Path from '../../src/Path.js';

test('Path cannot be transformed to lower case', () => {
    const path = new Path('/Hello/World/');
    expect(path.toLowerCase()).toBe(path);
});

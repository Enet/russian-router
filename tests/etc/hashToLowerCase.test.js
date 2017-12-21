import Hash from '../../src/Hash.js';

test('Hash is transformed to lower case correctly', () => {
    let hash;
    hash = new Hash(undefined);
    expect(hash.toLowerCase()).toBe(hash);
    hash = new Hash(null);
    expect(hash.toLowerCase()).toBe(hash);
    hash = new Hash('');
    expect(hash.toLowerCase()).toBe(hash);
});

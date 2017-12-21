import {
    utils
} from 'russian-router';
import Uri from '../../src/Uri.js';

test('Uri instance has necessary methods to get splitted, parsed and raw uris', () => {
    const rawUri = '//localhost/hello/world?x=1#zzz';
    const uri = new Uri(rawUri);

    expect(uri.getRawUri()).toBe(rawUri);

    expect(typeof uri.getSplittedUri()).toBe('object');
    expect(uri.getSplittedUri('protocol')).toBe(null);
    expect(uri.getSplittedUri('domain')).toBe('localhost');
    expect(uri.getSplittedUri('port')).toBe(null);
    expect(uri.getSplittedUri('path')).toBe('/hello/world');
    expect(uri.getSplittedUri('query')).toBe('x=1');
    expect(uri.getSplittedUri('hash')).toBe('zzz');

    expect(typeof uri.getParsedUri()).toBe('object');
    expect(uri.getParsedUri('protocol')).toBeInstanceOf(utils.getPartConstructor('protocol'));
    expect(uri.getParsedUri('domain')).toBeInstanceOf(utils.getPartConstructor('domain'));
    expect(uri.getParsedUri('port')).toBeInstanceOf(utils.getPartConstructor('port'));
    expect(uri.getParsedUri('path')).toBeInstanceOf(utils.getPartConstructor('path'));
    expect(uri.getParsedUri('query')).toBeInstanceOf(utils.getPartConstructor('query'));
    expect(uri.getParsedUri('hash')).toBeInstanceOf(utils.getPartConstructor('hash'));
});

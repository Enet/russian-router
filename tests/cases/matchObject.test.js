import RussianRouter from 'russian-router';

test('Structure of match object is correct', () => {
    const router = new RussianRouter({
        index: {
            uri: '{xprotocol}://{xdomain}:{xport}/hello/{xpath}?x=1&y=2&z={xz}#{xhash}',
            options: {
                canBeGenerated: false
            },
            key: 'kkk',
            payload: 'IndexPage',
            data: {ddd: 'ddd'}
        }
    });

    const matchObject = router.matchUri('https://localhost:8080/hello/world?z=3&y=2&x=1#HHH')[0];

    expect(matchObject.name).toBe('index');

    expect(matchObject.protocol).toBe('https');
    expect(matchObject.domain).toBe('localhost');
    expect(matchObject.port).toBe('8080');
    expect(matchObject.path).toBe('/hello/world');
    expect(matchObject.query.x).toBe('1');
    expect(matchObject.query.y).toBe('2');
    expect(matchObject.query.z).toBe('3');
    expect(matchObject.hash).toBe('HHH');

    expect(matchObject.payload).toBe('IndexPage');
    expect(matchObject.key).toBe('kkk');
    expect(matchObject.data.ddd).toBe('ddd');

    expect(typeof matchObject.options.caseSensitive).toBe('boolean');
    expect(typeof matchObject.options.trailingSlashSensitive).toBe('boolean');
    expect(typeof matchObject.options.dataConsistency).toBe('boolean');
    expect(typeof matchObject.options.onlyRoute).toBe('boolean');
    expect(typeof matchObject.options.canBeMatched).toBe('boolean');
    expect(typeof matchObject.options.canBeGenerated).toBe('boolean');
    expect(typeof matchObject.options.priority).toBe('number');
    expect(typeof matchObject.options.processMatchObjects).toBe('function');

    expect(matchObject.params.xprotocol).toBe('https');
    expect(matchObject.params.xdomain).toBe('localhost');
    expect(matchObject.params.xport).toBe('8080');
    expect(matchObject.params.xpath).toBe('world');
    expect(matchObject.params.xz).toBe('3');
    expect(matchObject.params.xhash).toBe('HHH');
});

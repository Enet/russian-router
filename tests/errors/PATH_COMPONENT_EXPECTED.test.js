import RussianRouter from 'russian-router';

test('Error PATH_COMPONENT_EXPECTED happens', () => {
    const router = new RussianRouter({
        index: {
            uri: '/hello/{x}/world'
        }
    }, {});
    expect(() => router.generateUri('index', {
        component: ''
    })).toThrow(/\bPATH_COMPONENT_EXPECTED\b/);
    expect(() => new RussianRouter({
        index: {uri: '/hello//world'}
    })).toThrow(/\bPATH_COMPONENT_EXPECTED\b/);
});

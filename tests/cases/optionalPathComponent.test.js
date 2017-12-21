import RussianRouter from 'russian-router';
import {
    fillRoutes
} from 'utils';

const options = {
    dataConsistency: false
};

// Absolute

test('One optional absolute path component works correctly', () => {
    const routes = fillRoutes({
        oneOptionalAbsolutePathComponent: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/hello').length).toBe(1);
    expect(router.matchUri('/hello')[0].params.noun).toBe('');
    expect(router.matchUri('/hello/').length).toBe(1);
    expect(router.matchUri('/hello/')[0].params.noun).toBe('');
    expect(router.matchUri('/hello/there').length).toBe(1);
    expect(router.matchUri('/hello/there')[0].params.noun).toBe('there');
    expect(router.matchUri('/hello/there/').length).toBe(1);
    expect(router.matchUri('/hello/there/z').length).toBe(0);
    expect(router.matchUri('/z/hello/there').length).toBe(0);
    expect(router.matchUri('/').length).toBe(0);
    expect(router.matchUri('/hello/there/my/dear/friend').length).toBe(0);

    expect(router.generateUri('oneOptionalAbsolutePathComponent', {noun: 'abc'})).toBe('/hello/abc');
    expect(router.generateUri('oneOptionalAbsolutePathComponent', {noun: ''})).toBe('/hello');
    expect(router.generateUri('oneOptionalAbsolutePathComponent', {noun: null})).toBe('/hello');
    expect(router.generateUri('oneOptionalAbsolutePathComponent', {})).toBe('/hello');
});

test('Two optional absolute path components work correctly', () => {
    const routes = fillRoutes({
        twoOptionalAbsolutePathComponent: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/hello').length).toBe(1);
    expect(router.matchUri('/hello')[0].params.noun).toBe('');
    expect(router.matchUri('/hello')[0].params.adjective).toBe('');

    expect(router.matchUri('/hello/dear/').length).toBe(1);
    expect(router.matchUri('/hello/dear/')[0].params.adjective).toBe('dear');
    expect(router.matchUri('/hello/dear/')[0].params.noun).toBe('');

    expect(router.matchUri('/hello/dear/friend').length).toBe(1);
    expect(router.matchUri('/hello/dear/friend')[0].params.adjective).toBe('dear');
    expect(router.matchUri('/hello/dear/friend')[0].params.noun).toBe('friend');

    expect(router.matchUri('/').length).toBe(0);
    expect(router.matchUri('/asdf/qwerty').length).toBe(0);
    expect(router.matchUri('/hello/there/my/dear/friend').length).toBe(0);
    expect(router.matchUri('/hello/dear/friend/asdf').length).toBe(0);

    expect(router.generateUri('twoOptionalAbsolutePathComponent', {

    })).toBe('/hello/');
    expect(router.generateUri('twoOptionalAbsolutePathComponent', {
        adjective: 'dear'
    })).toBe('/hello/dear/');
    expect(router.generateUri('twoOptionalAbsolutePathComponent', {
        noun: 'friend'
    })).toBe('/hello/friend/');
    expect(router.generateUri('twoOptionalAbsolutePathComponent', {
        adjective: 'dear',
        noun: 'friend'
    })).toBe('/hello/dear/friend/');
});

test('Two optional absolute path components can be used with params', () => {
    const routes = fillRoutes({
        twoOptionalAbsolutePathComponent: {
            params: {adjective: 'dear'}
        }
    });
    const router = new RussianRouter(routes, {
        dataConsistency: true
    });

    const rawUri = router.generateUri('twoOptionalAbsolutePathComponent', {noun: 'friend'});
    expect(rawUri).toBe('/hello/dear/friend/');
    expect(router.matchUri(rawUri).length).toBe(1);
    expect(router.matchUri(rawUri)[0].params.adjective).toBe('dear');
    expect(router.matchUri(rawUri)[0].params.noun).toBe('friend');
});

test('Two optional absolute path components can be the cause of non-critical data inconsistency', () => {
    const routes = fillRoutes({
        twoOptionalAbsolutePathComponent: {}
    });
    const router = new RussianRouter(routes, {
        dataConsistency: true
    });

    const rawUri = router.generateUri('twoOptionalAbsolutePathComponent', {noun: 'friend'});
    expect(rawUri).toBe('/hello/friend/');
    expect(router.matchUri(rawUri).length).toBe(1);
    expect(router.matchUri(rawUri)[0].params.adjective).toBe('friend');
    expect(router.matchUri(rawUri)[0].params.noun).toBe('');
});

test('Three optional absolute path components work correctly', () => {
    const routes = fillRoutes({
        threeOptionalAbsolutePathComponent: {}
    });
    const router = new RussianRouter(routes, options);

    expect(router.generateUri('threeOptionalAbsolutePathComponent', {
        pronoun: 'my',
        adjective: 'dear',
        noun: 'friend'
    })).toBe('/hello/my/dear/friend');
    expect(router.generateUri('threeOptionalAbsolutePathComponent', {})).toBe('/hello');
    expect(router.generateUri('threeOptionalAbsolutePathComponent', {adjective: 'dear'})).toBe('/hello/dear');

    expect(router.matchUri('/hello/my/dear')[0].params.pronoun).toBe('my');
    expect(router.matchUri('/hello/my/dear')[0].params.adjective).toBe('dear');
    expect(router.matchUri('/hello/my/dear')[0].params.noun).toBe('');

    expect(router.matchUri('/hello/my/')[0].params.pronoun).toBe('my');
    expect(router.matchUri('/hello/my/')[0].params.adjective).toBe('');
    expect(router.matchUri('/hello/my/')[0].params.noun).toBe('');
});

test('Three optional absolute path components work correctly', () => {
    const routes = fillRoutes({
        threeOptionalAbsolutePathComponent: {
            params: {adjective: /^\d+$/}
        }
    });
    const router = new RussianRouter(routes, options);

    expect(router.matchUri('/hello/my/friend')[0].params.pronoun).toBe('my');
    expect(router.matchUri('/hello/my/friend')[0].params.adjective).toBe('');
    expect(router.matchUri('/hello/my/friend')[0].params.noun).toBe('friend');

    expect(router.matchUri('/hello/my/')[0].params.pronoun).toBe('my');
    expect(router.matchUri('/hello/my/')[0].params.adjective).toBe('');
    expect(router.matchUri('/hello/my/')[0].params.noun).toBe('');

    expect(router.matchUri('/hello/my/dear/friend').length).toBe(0);
    expect(router.matchUri('/hello/my/123/friend').length).toBe(1);
});

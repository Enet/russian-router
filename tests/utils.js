const routeUris = {
    indexUpperCase: 'HTTP://LOCALHOST/MY/PATH?XXX=YYY#ZZZ',
    indexLowerCase: 'http://localhost/my/path?xxx=yyy#zzz',
    indexRandomCase: 'Http://Localhost/My/Path?Xxx=Yyy#Zzz',
    indexHasTrailingSlash: '/my/path/',
    indexNoTrailingSlash: '/my/path',
    indexOneParam: '/{x}',

    protocolParam: '{protocol}://localhost/abc',
    protocolConst: 'http://localhost/abc',
    domainParam: '//{domain}/abc',
    domainConst: '//localhost/abc',
    portParam: '//localhost:{port}/abc',
    portConst: '//localhost:1234/abc',
    pathParam: '{path}',
    pathConst: '/hello/world',
    pathComponentParam: '/hello/{component}',
    pathComponentConst: '/hello/world',
    queryParam: '?{query}',
    queryConst: '/?www&xxx=111&YYY=bbb&zzz=',
    queryComponentParam: '/?XXX=111&yyy=&zzz={component}',
    queryComponentConst: '/?XXX=111&yyy=&zzz=333',
    hashParam: '/#{hash}',
    hashConst: '/#hello',

    relativePath: 'hello/world',
    relativeQuery: '?x=1&y=2',
    relativeHash: '#zzz',
    relativePathQuery: 'hello/world?x=1&y=2',
    relativePathHash: 'hello/world#zzz',
    relativeQueryHash: '?x=1&y=2#zzz',
    relativePathQueryHash: 'hello/world?x=1&y=2#zzz',

    constQueryComponent: '/?x&y=&z=3',
    requiredQueryComponent: '/?x={x}',
    optionalQueryComponent: '/?x={x*}',

    constPathComponent: '/2//3/is/5',
    requiredPathComponent: '/2/{x}/3/is/5',
    optionalPathComponent: '/2/{x*}/3/is/5',

    oneOptionalAbsolutePathComponent: '/hello/{noun*}',
    twoOptionalAbsolutePathComponent: '/hello/{adjective*}/{noun*}/',
    threeOptionalAbsolutePathComponent: '/hello/{pronoun*}/{adjective*}/{noun*}',
    oneOptionalRelativePathComponent: 'hello/{noun*}',
    twoOptionalRelativePathComponent: 'hello/{adjective*}/{noun*}/',
    threeOptionalRelativePathComponent: 'hello/{pronoun*}/{adjective*}/{noun*}',
    mixedAbsolutePathComponent: '/hello/{adjective}/{noun*}/',
    mixedRelativePathComponent: 'hello/{adjective}/{noun*}/'
};

export function getRouteUri (routeName) {
    return routeUris[routeName];
}

export function fillRoutes (routes) {
    for (let r in routes) {
        routes[r].uri = routeUris[r];
    }
    return routes;
}

export const defaultRoutes = {
    index: {
        uri: '/'
    },
    paramProtocol: {
        uri: '{protocol}://localhost/'
    },
    paramDomain: {
        uri: 'http://{domain}/'
    },
    paramPort: {
        uri: 'http://localhost:{port}/'
    },
    paramWholePath: {
        uri: 'http://localhost{path}'
    },
    paramPath: {
        uri: 'http://localhost/path/{to}'
    },
    paramWholeQuery: {
        uri: '/path/to/?{query}'
    },
    paramQuery: {
        uri: '/path/to/?q={q}'
    },
    paramHash: {
        uri: '/path/to/#{hash}'
    },
    hasTrailingSlash: {
        uri: '/trailing/slash/'
    },
    noTrailingSlash: {
        uri: '/trailing/slash'
    },
    constRandomCase: {
        uri: 'hTtP://lOcAlHoSt:1234/pAtH/tO?qUeRy=QuErY#hAsH'
    },
    paramRandomCase: {
        uri: '{protocol}://{domain}:{port}/pAtH/{to}?qUeRy={query}#{hash}'
    },
    priorityX: {
        uri: '/priority/checking',
        options: {
            priority: -1
        }
    },
    priorityY: {
        uri: '/priority/checking',
        options: {
            priority: 0
        }
    },
    priorityZ: {
        uri: '/priority/checking',
        options: {
            priority: 1
        }
    },
    priorityD: {
        uri: '/priority/checking'
    },
    dataConsistency: {
        uri: '{protocol}://{domain}:{port}/{path}/?query={query}#{hash}',
        params: {
            protocol: /http/,
            domain: /localhost/,
            port: () => 8080,
            path: /hello/,
            query: /world/,
            hash: /asdf/
        }
    }
};

export const defaultOptions = {
    caseSensitive: false,
    trailingSlashSensitive: false,
    dataConsistency: true,
    onlyRoute: false,
    sortMatchedRoutes: true
};

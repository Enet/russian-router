export const defaultRoutes = {
    index: {
        url: '/'
    },
    paramProtocol: {
        url: '{protocol}://localhost/'
    },
    paramDomain: {
        url: 'http://{domain}/'
    },
    paramPort: {
        url: 'http://localhost:{port}/'
    },
    paramWholePath: {
        url: 'http://localhost{path}'
    },
    paramPath: {
        url: 'http://localhost/path/{to}'
    },
    paramWholeQuery: {
        url: '/path/to/?{query}'
    },
    paramQuery: {
        url: '/path/to/?q={q}'
    },
    paramHash: {
        url: '/path/to/#{hash}'
    },
    hasTrailingSlash: {
        url: '/trailing/slash/'
    },
    noTrailingSlash: {
        url: '/trailing/slash'
    },
    constRandomCase: {
        url: 'hTtP://lOcAlHoSt:1234/pAtH/tO?qUeRy=QuErY#hAsH'
    },
    paramRandomCase: {
        url: '{protocol}://{domain}:{port}/pAtH/{to}?qUeRy={query}#{hash}'
    },
    priorityX: {
        url: '/priority/checking',
        options: {
            priority: -1
        }
    },
    priorityY: {
        url: '/priority/checking',
        options: {
            priority: 0
        }
    },
    priorityZ: {
        url: '/priority/checking',
        options: {
            priority: 1
        }
    },
    priorityD: {
        url: '/priority/checking'
    },
    dataConsistency: {
        url: '{protocol}://{domain}:{port}/{path}/?query={query}#{hash}',
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

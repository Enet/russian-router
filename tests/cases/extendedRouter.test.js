import {
    RussianRouter,
    utils
} from 'russian-router';
import {
    fillRoutes
} from 'utils';

const Protocol = utils.getPartConstructor('protocol');
const Domain = utils.getPartConstructor('domain');
const Port = utils.getPartConstructor('port');
const Path = utils.getPartConstructor('path');

const currentProtocol = 'http';
const currentDomain = 'localhost';
const currentPort = '80';
const currentPath = '/about';
const currentQuery = '';

const options = {
    dataConsistency: false,
    currentProtocol,
    currentDomain,
    currentPort
};

class CustomRussianRouter extends RussianRouter {
    constructor (routes, options) {
        super(...arguments);
        const {currentProtocol, currentDomain, currentPort} = options;
        Object.assign(this, {currentProtocol, currentDomain, currentPort});
    }

    getDefaultPart (partName) {
        switch (partName) {
            case 'protocol':
                return new Protocol(this.currentProtocol);
            case 'domain':
                return new Domain(this.currentDomain);
            case 'port':
                return new Port(this.currentPort);
            default:
                return super.getDefaultPart(...arguments);
        }
    }

    resolveUri (rawUri) {
        const splittedUri = utils.splitUri(rawUri, utils.getRegExp('uri'));
        const path = new Path(splittedUri.path);
        if (splittedUri.protocol || splittedUri.domain || splittedUri.port || path.isAbsolute()) {
            return rawUri;
        } else {
            let absoluteUri = currentPath;
            const isPathEmpty = !path.toString();
            if (!isPathEmpty) {
                absoluteUri = currentPath.replace(/\/$/, '') + '/' + path.toString();
            }
            if (splittedUri.query) {
                absoluteUri += '?' + splittedUri.query;
            } else if (isPathEmpty) {
                absoluteUri += currentQuery;
            }
            if (splittedUri.hash) {
                absoluteUri += '#' + splittedUri.hash;
            }
            return absoluteUri;
        }
    }
}

test('Extended router omits unnecessary uri parts', () => {
    const routes = fillRoutes({
        indexLowerCase: {},
        externalUri: {}
    });
    const router = new CustomRussianRouter(routes, options);

    expect(router.generateUri('indexLowerCase')).toBe('/my/path?xxx=yyy#zzz');
    expect(router.matchUri('http://localhost:80/my/path?xxx=yyy#zzz').length).toBe(1);
    expect(router.matchUri('http://localhost/my/path?xxx=yyy&www#zzz').length).toBe(1);
    expect(router.matchUri('http://google.com:80/my/path?xxx=yyy&www#zzz').length).toBe(0);
    expect(router.matchUri('https://localhost:80/my/path?xxx=yyy&www#zzz').length).toBe(0);
    expect(router.matchUri('//localhost/my/path?xxx=yyy&www#zzz').length).toBe(1);
    expect(router.generateUri('externalUri')).toBe('https://google.com/');
});

test('Extended router omits unnecessary port', () => {
    const routes = {
        index: {
            uri: '{protocol}://{domain}:{port}/hello/world'
        }
    };
    const router = new CustomRussianRouter(routes, Object.assign(options, {
        currentPort: 8080
    }));

    expect(router.generateUri('index', {
        protocol: 'http',
        domain: 'localhost',
        port: 8080
    })).toBe('/hello/world');
});

test('Extended router matches relative paths', () => {
    const routes = fillRoutes({
        relativePathQuery: {}
    });
    const router = new CustomRussianRouter(routes, options);

    expect(router.matchUri(router.resolveUri('hello/world?y=2&x=1')).length).toBe(1);
});

test('Extended router generates relative paths', () => {
    const routes = fillRoutes({
        relativePathQuery: {}
    });
    const router = new CustomRussianRouter(routes, options);

    expect(router.resolveUri(router.generateUri('relativePathQuery'))).toBe('/about/hello/world?x=1&y=2');
});

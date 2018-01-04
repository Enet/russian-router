# :ru: russian-router

<img src="https://raw.githubusercontent.com/Enet/russian-router/master/russian-router.svg?sanitize=true" width="210" height="210" />

[![npm version](https://img.shields.io/npm/v/russian-router.svg)](https://www.npmjs.com/package/russian-router)
[![gzip size](http://img.badgesize.io/https://npmcdn.com/russian-router/dist/russian-router.min.js?compression=gzip)](https://npmcdn.com/russian-router/dist/russian-router.min.js?compression=gzip)
[![test coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/Enet/russian-router)
[![stepan zhevak](https://img.shields.io/badge/stepan-zhevak-1a8b8e.svg)](https://zhevak.name)

Russian router is an abstract javascript router. Despite of a short list of methods the package has powerful features. The main of ones is **matching and generating uris using the same template**. This router by itself provides only low level API and most likely you need to take a look at another packages like [server-russian-router](https://github.com/Enet/server-russian-router), [browser-russian-router](https://github.com/Enet/browser-russian-router) or [react-russian-router](https://github.com/Enet/react-russian-router).

- :dog: [Installation](#dog-installation)
- :mouse: [Concepts](#mouse-concepts)
- :hamster: [Users API](#hamster-users-api)
- :rabbit: [Developers API](#rabbit-developers-api)
- :koala: [Examples](#koala-examples)
- :bear: [Contributors](#bear-contributors)

# :dog: Installation
To install the current version with **npm** use the command below:
```sh
npm install --save russian-router
```
Or if you prefer **yarn**:
```sh
yarn add russian-router
```

Now the package is installed and you can start using it in different environments.

For **ES6** modules:
```javascript
import {RussianRouter} from 'russian-router';
```

For **CommonJS** modules:
```javascript
const {RussianRouter} = require('russian-router');
```

Or you can add **UMD** bundle just to your HTML code:
```html
<script src="russian-router/dist/russian-router.js"></script>
<!-- Minified version is available russian-router/dist/russian-router.min.js -->
```

# :mouse: Concepts
To understand how it works and start using all the power of russian-router, it's recommended to read the section below carefully.

## Matching and Generating
Router should be able to match and generate uris using the same template. It's exactly what russian-router does. So there are two basic and the most important methods: `matchUri` and `generateUri`, which are described further. To perform the job router needs routes' table.

Any uri consists of a number of parts (so called uri components: protocol, domain, port, path, query, hash). Matching and generating are done part by part. If uri is matched, it means all the uri's parts are matched. When uri is generated, it means all the uri's parts are generated separately and joined together.

When a router is matching some custom uri, it looks for only those routes from the routes' table that can describe the uri. Finally the router returns an array of so called match objects, which contain the detailed information about matched uri in the context of a route.

When a router is generating uri using some data, it gets a specific route from the routes' table and replaces all parameters with custom data. The router cares about default values and another nuances. Finally it returns a string, that is uri.

Ideally generated uri should be always matched (if the same routes' table is used). In fact shit happens. To help avoid painful situations russian-router can test all the generated uris. It's called data consistency and strongly recommended for use in the development environment.

## Routes' Table
The table of routes consists of... the routes! First of all russian-router takes an object, called `rawRoutes`. It seems like this:
```javascript
// Don't worry, only looks too complex
const rawRoutes = {
    index: {
        uri: 'http://{domain}/hello/world/{optional*}?asdf={x}',
        params: {/* Params domain, optional, x described here */},
        options: {/* Route's options here */},
        key: (matchObject) => matchObject.params.optional,
        data: {custom: 'user data'},
        payload: 'IndexPage'
    }
};
```

Here is only one route, named index. It has parametrized uri (`domain`, `optional` and `x` are parameters). All the parameters should be described in the next section `params` that is omitted here. Below there is `options` section, applied to the route only. Fields `key`, `data` and `payload` are needed to understand what to do with a match object in the future.

In the next step the router parses `rawRoutes` and gets `parsedRoutes`. It uses parsed routes' table during all the lifecycle, which means you can't change a routes' table after initialization. Avoid those cases, when you need to modify routes in runtime. Nevertheless if you need to, new instance could be always created.

## Route's Uri
Route's uri is a string that parsed internally by regular expression. It contains six parts: protocol, domain, port, path, query and hash. Some of them could be omitted. Note that empty part is equal to the lack of part. Each part could be presented by constant value like `http` or parameter like `{protocol}`. Path and query are special ones, because they mix constants and parameters.

> Also there is one very important detail. The fact is the default values are not specified and russian-router even doesn't care about your environment. If protocol, domain or port are omitted, they are likely equal to empty strings. It's because you probably need [browser-russian-router](https://github.com/Enet/browser-russian-router), [server-russian-router](https://github.com/Enet/server-russian-router), [react-russian-router](https://github.com/Enet/react-russian-router) or override the method `getDefaultPart`.

Parameters' names must contain latin letters and numbers only (letter case matters despite of the option `caseSensitive`). Some part-specific features are described further.

#### protocol
Only latin letters are allowed. Letter case doesn't matter.

#### domain
Latin letters, numbers, hyphens and dots are allowed. Letter case doesn't matter.

#### port
Only numbers are allowed. Default value depends on protocol (80 for http, 443 for https). If protocol is not defined, special method `getDefaultPart` is used.

#### path
If the whole path is presented by parameter, the parameter must be a function. Path and query are the only parts, where optional parameters are allowed. Letter case matters.

#### query
If the whole query is presented by parameter, the parameter must be a function. Only query values could be parametrized (not query keys). Query and path are the only parts, where optional parameters are allowed. Letter case matters both for keys and values.

#### hash
Letter case matters.

<details><summary><strong>Take a look at some examples.</strong></summary>

```javascript
// Port by default is 80, because protocol is http
'http://{domain}:{port}/my/path/';
// The same as previous, because protocol's letter case doesn't matter
'HTTP://{domain}:{port}/my/path/';
// The same as previous, but parameter's name is changed (letter case matters)
'http://{Domain}:{port}/my/path/';
// Protocol is omitted, path contains one optional parameter
'//localhost/my/{super*}/path/?xxx=111&yyy={q}';
// Parameter myCustomPath presents the whole path; try to avoid this pattern
'//localhost{myCustomPath}';
// Here is the same with query, myCustomQuery must be a function; avoid this pattern
'//localhost/?{myCustomQuery}';
// Parametrized hash
'//localhost/some/path/#{hash}';
// Trailing slashes matter or not, depends on trailingSlashSensitive option
'//localhost/some/path#{hash}';
// Domain is omitted, absolute path is presented
'/some/path#{hash}';
// Domain is omitted, relative path is presented
'some/path';
// Domain is omitted, relative path is presented; be careful
'localhost/some/path';
// Remember the hash is not parsed, so here is just a string without params
'/my/path/#zzz={zzz}';
// Here is only one parameter yyy, because query keys couldn't be parametrized
'/my/path/?{xxx}={yyy}';
// Query parameter is optional here
'/my/path/?xxx={yyy*}';
```

</details>

## Route's Params
As you can see above, any uri's part could be parametrized. And all used parameters could be described like this:
```javascript
const rawRoutes = {
    userItem: {
        uri: '/user/{id}',
        params: {
            id: /*
                How to describe parameter with the name id?
                How to match it? How to generate it?
                Read below!
            */
        }
    }
};
```

**Step 1**. Router transforms parameter to so called match-generate object. For example, if you set parameter's value to `'asdf'`, router will transform that string to an object.
```javascript
{
    match: ['asdf'],
    generate: []
}
```

**Step 2**. Router tries to complete empty generate array from match array. Of course, regular expressions or functions cannot be transformed to constant values, but numbers, strings, booleans can be as well.
```javascript
{
    match: ['asdf'],
    generate: ['asdf']
}
```

**Step 3**. Router transforms all the items of match-generate object to corresponding functions.
```javascript
{
    match: [(userUri, partName, paramName, routeOptions) => {
        const parsedUserUriPart = userUri.getParsedUri(partName);
        if (!isEqual(parsedUserUriPart, 'asdf', routeOptions)) {
            return null;
        }
        const matchedValue = parsedUserUriPart.toString();
        const matchedParams = {[paramName]: matchedValue};
        return new MatchFragment(matchedValue, matchedParams);
    }],
    generate: [(userParams, generatingItem, partName, paramName, routeOptions) => {
        return userParams[paramName] || 'asdf';
    }]
}
```

**Step 4**. To compare value router calls functions from match array, to generate uri part it calls functions from generate array. The description above is super simplified, but it's enough to understand parameters of russian-router.

In summary you have to describe each parameter using match-generate object. But neither the match nor the generate section are not required and could be omitted. If match section is omitted, router matches any value. If generate section is omitted, router tries to fill it.

To describe match section:
- use regular expression;
- use so called match function from the step 3;
- use any another value (strings are preferred);
- use array containing items above.

To describe generate section:
- use so called generate function from the step 3;
- use any another value (strings are preferred);
- use array containing items above.

<details><summary><strong>Take a look at some examples.</strong></summary>

```javascript
import {RussianRouter, MatchFragment} from 'russian-router';
const availableSortings = ['id', 'name', 'time'];
const rawRoutes = {
    'userList': {
        uri: '{protocol}://{domain}:{port}/user/list/{banned*}?sorting={sorting}',
        params: {
            protocol: ['http', 'https'],
            domain: {
                generate: 'localhost'
            },
            port: null,
            banned: 'banned',
            sorting: {
                match: (userUri, partName, paramName, routeOptions) => {
                    // Be careful when you use functions
                    const userUriQuery = userUri
                        .getParsedUri('query')
                        .toLowerCase(!routeOptions.caseSensitive)
                        .toObject();
                    // Because you need to know how russian-router works exactly
                    const userSorting = (userUriQuery.sorting || '').toLowerCase();
                    if (availableSortings.indexOf(userSorting) === -1) {
                        return null;
                    }
                    return new MatchFragment(userSorting, {sorting: userSorting});
                },
                generate: availableSortings
            }
        }
    }
};
const rawOptions = {};
const router = new RussianRouter(rawRoutes, rawOptions);
// Matched [{...}]
router.matchUri('http://google.com/user/list/?sorting=id');
// Matched [{...}]
router.matchUri('https://localhost/user/list/banned?sorting=name');
// Matched [{...}]
router.matchUri('https://localhost/user/list/banned?SORTING=NAME');
// Matched [{...}]
router.matchUri('https://localhost/user/list/banned?sorting=name&something=else');
// Matched []
router.matchUri('http://google.com/user/list/');
// Generated http://localhost/user/list/banned?sorting=id
router.generateUri('userList', {});
// Generated http://localhost/user/list/?sorting=id
router.generateUri('userList', {
    banned: ''
});
// Generated https://facebook.com/user/list/banned?sorting=time
router.generateUri('userList', {
    protocol: 'https',
    domain: 'facebook.com',
    sorting: 'time'
});
```

</details>


## Internal Structure
This section is recommended reading for those, who wants to extend russian-router or understand how it works.

Actually all the source files of russian-router could be splitted into a number of categories: parts, templates, options, uris, etc. You can read short description for each one below.

At the moment it's impossible to substitute one class to another. But there is an idea to implement DI container over the router. So things can change in the future.

<details><summary><strong>Read short classes' descriptions.</strong></summary>

- parts
    - `Part` *// abstract uri's part*
    - `Protocol` *// uri's parsed protocol*
    - `Domain` *// uri's parsed domain*
    - `Port` *// uri's parsed port*
    - `Path` *// uri's parsed path*
    - `PathComponent` *// uri's parsed path component*
    - `Query` *// uri's parsed query*
    - `QueryComponent` *// uri's parsed query component*
    - `Hash` *// uri's parsed hash*
- templates
    - `DefaultTemplate` *// abstract template*
    - `ConstUniversalTemplate` *// abstract template for constant*
    - `ConstProtocolTemplate` *// protocol template for constant*
    - `ConstDomainTemplate` *// domain template for constant*
    - `ConstPortTemplate` *// port template for constant*
    - `ConstPathTemplate` *// path template for constant*
    - `ConstQueryTemplate` *// query template for constant*
    - `ConstHashTemplate` *// hash template for constant*
    - `ParamUniversalTemplate` *// abstract template for parameter*
    - `ParamProtocolTemplate` *// protocol template for parameter*
    - `ParamDomainTemplate` *// domain template for parameter*
    - `ParamPortTemplate` *// port template for parameter*
    - `ParamPathTemplate` *// path template for parameter*
    - `ParamQueryTemplate` *// query template for parameter*
    - `ParamHashTemplate` *// hash template for parameter*
- options
    - `Options` *// abstract options*
    - `RouterOptions` *// options for a router*
    - `RouteOptions` *// options for a route*
- uris
    - `Uri` *// abstract parsed uri*
    - `TemplateUri` *// parsed route's uri*
    - `UserUri` *// parsed user uri that will be matched*
- etc
    - `index` *// external interface*
    - `RussianRouter` *// router itself*
    - `Route` *// parsed route for routes' table*
    - `RouteParams` *// parsed route's parameters (match-generate objects)*
    - `MatchFragment` *// special interface to join matches into a single match object*
    - `RouterError` *// errors generator*
    - `utils` *// bunch of important functions*

</details>

# :hamster: Users API
## `new RussianRouter(rawRoutes, rawOptions)`
Creates a new instance of russian-router with provided routes and options.

#### `rawOptions`
Options are presented by a plain object.

<details><summary><strong>Read more about router options.</strong></summary>

```javascript
const rawOptions = {
    /* Is router sensitive to uri letter case or not? */
    caseSensitive: false,

    /* Is router sensitive to trailing slash at the end of uri or not? */
    trailingSlashSensitive: false,

    /* Does router stop searching matches, when the first one is found?
    This option is recommended for performance reasons. */
    onlyRoute: false,

    /* Does router test that generated uri matches the same template or not?
    It's strongly recommended for development environment! */
    dataConsistency: true,

    /* Actually this option is always transformed to function.
    If false, processing is disabled. If true, router sorts routes by priority.
    Also could be given function that sorts or filters match objects. */
    processMatchObjects: true
};
```

</details>

#### `rawRoutes`
Routes are presented by a plain object, where keys are routes' names.

<details><summary><strong>Read more about routes' table.</strong></summary>

```javascript
// Read concepts section above to get more details
const rawRoutes = {
    index: {
        uri: '/',
        payload: 'IndexPage'
    },

    // Key is the route's name
    user: {
        // Parametrized route's uri is required
        uri: '/user/{id}',
        // Optional descriptions for all parameters
        params: {
            id: /\d+/
        },
        options: {
            // The same options as for router
            caseSensitive: true,
            trailingSlashSensitive: false,
            dataConsistence: true,
            // Priority is used to sort routes, by default is 0
            priority: 0,
            // Route can be invisible for matching
            canBeMatched: true,
            // Route can be invisible for generating
            canBeGenerated: true
        },
        // Payload is used by third-party libraries to define entry point
        payload: 'UserPage',
        // Optional data for the route used by third-party libraries
        data: {},
        // Optional key generator for the route used by third-party libraries
        key: (matchObject) => matchObject.id
    }
};
```

</details>

## `router.destructor()`
Does nothing. But you should respect this method, because it's used by the most of wrappers around russian-router.

## `router.generateUri(routeName, userParams, parsedRoutes)`
Generates uri by route's name. Third argument is optional and you don't need it, if you just use the router.

<details><summary><strong>See the usage example.</strong></summary>

```javascript
const router = new RussianRouter({
    userItem: {
        uri: '/user/{id}?filter={filter}'
    }
}, {});

// Generates /user/123
router.generateUri('userItem', {
    id: 123,
    filter: null
});

// Generates /user/123?filter=positive
router.generateUri('userItem', {
    id: 123,
    filter: 'positive'
});
```

</details>

## `router.matchUri(rawUri, parsedRoutes)`
Matches uri with parsed routes and returns match objects. Second argument is optional and you don't need it, if you just use the router.

<details><summary><strong>See the usage example.</strong></summary>

```javascript
const router = new RussianRouter({
    userItem: {
        uri: '/user/{id}?filter={filter}',
        payload: 'UserItemComponent'
    }
}, {});

/* Matches [{
    name: 'userItem',
    params: {
        id: '456',
        filter: 'positive'
    },
    protocol: '',
    domain: '',
    port: '',
    path: '/user/456',
    query: {
        filter: 'positive'
    },
    hash: '',
    data: undefined,
    key: undefined,
    payload: 'UserItemComponent',
    options: {...}
}] */
router.matchUri('/user/456?filter=positive');
```

</details>

# :rabbit: Developers API
## `router.getDefaultPart(partName)`
Returns default uri part for the current environment. Most likely you need to override the method for protocol, domain and port. But it's strongly not recommended to override the method for path, query and hash parts. To get constructor of requested part, use the utility `getPartConstructor`.

See the packages [browser-russian-router](https://github.com/Enet/browser-russian-router) and [server-russian-router](https://github.com/Enet/server-russian-router) as examples. 

<details><summary><strong>See example.</strong></summary>

```javascript
import RussianRouter, {utils} from 'russian-router';

const Protocol = utils.getPartConstructor('protocol');
const Domain = utils.getPartConstructor('domain');
const Port = utils.getPartConstructor('port');

export default CustomRussianRouter extends RussianRouter {
    getDefaultPart (partName) {
        if (partName === 'protocol') {
            return new Protocol('http');
        } else if (partName === 'domain') {
            return new Domain('my.custom.domain');
        } else if (partName === 'port') {
            return new Port(80);
        }
        return super.getDefaultPart(...arguments);
    }
}
```

</details>

## `router.getParsedRoutes()`
Returns an object of parsed routes (so called routes' table). Don't change that object and don't touch routes inside! You can read only returned data.

## `router.getParsedOptions()`
Returns an object of parsed options. Don't modify it, if you want to get working router!

## `this._parseOptions(rawOptions)`
Returns an instance of `RouterOptions` based on `rawOptions`. It's called only once during initialization. Most likely you don't need to modify options, but you probably want to attach the cache. See [server-russian-router](https://github.com/Enet/server-russian-router) as an example.

## `this._parseRoutes(rawRoutes)`
Returns an object containing `Route` instances. It's called only once during initialization. Most likely you don't need to modify routes' table, but you probably want to attach the cache. See [server-russian-router](https://github.com/Enet/server-russian-router) as an example.

# :koala: Examples
Look for examples in [tests](https://github.com/Enet/russian-router/tree/master/tests) directory. Test coverage is 100% so most likely you'll find what you need. Below is only the simplest example.

```javascript
import RussianRouter from 'russian-router';

const options = {};
const routes = {
    customRouteName: {
        uri: '/hello/{entity*}?x=1&y={y*}',
        params: {
            entity: /\w+/
        }
    }
};

const router = new RussianRouter(routes, options);

router.matchUri('/hello/?x=1&y=3').length; // 1
router.matchUri('/hello/world?x=1&y=3').length; // 1
router.matchUri('/hello/матрёшка?x=1&y=3').length; // 0
router.matchUri('/hello/world').length; // 0
router.matchUri('/hello/world?x=1').length; // 1
router.matchUri('/hello/my/world?x=1').length; // 0
router.matchUri('/hello/world?y=3&x=1').length; // 1
router.matchUri('/hello/world?y=3&x=1&z=123').length; // 1
router.matchUri('/hello/world?x=1&y').length; // 1

router.generateUri('customRouteName'); // '/hello?x=1'
router.generateUri('customRouteName', {entity: 'world'}); // '/hello/world?x=1'
router.generateUri('customRouteName', {y: 1}); // '/hello?x=1&y=1'
router.generateUri('customRouteName', {entity: 'user', y: 2}); // '/hello/user?x=1&y=2'
router.generateUri('customRouteName', {entity: 'матрёшка'}); // error, because data is inconsistent
```

# :bear: Contributors
Pull requests are welcome :feet: Let improve the package together. But, please, respect the code style.

If you don't understand how to use the router or you have additional questions about internal structure, be free to write me at [enet@protonmail.ch](enet@protonmail.ch). Also if you are looking for front-end software developer, be aware that I'm looking for a job. Check out my portfolio at [https://zhevak.name](https://zhevak.name) :hatched_chick:

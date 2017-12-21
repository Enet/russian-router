import Part from './Part.js';

export default class Path extends Part {
    constructor (rawPath) {
        super(rawPath);
        rawPath = this._value;

        let isAbsolute = false;
        let hasTrailingSlash = false;
        let components = [];

        if (rawPath) {
            isAbsolute = rawPath[0] === '/';
            hasTrailingSlash = rawPath.length > 1 && rawPath[rawPath.length - 1] === '/';
            components = rawPath.split('/');
            components = components.slice(+isAbsolute, -hasTrailingSlash + components.length);
        }

        let depthLevel = 0;
        components = components
            .reverse()
            .filter((component) => component !== '.')
            .filter((component) => {
                if (component === '..') {
                    depthLevel++;
                    return false;
                }
                if (depthLevel === 0) {
                    return true;
                }
                depthLevel = Math.max(depthLevel - 1, 0);
                return false;
            })
            .reverse()
            .map(decodeURIComponent);

        this._value = {
            isAbsolute,
            hasTrailingSlash,
            rawPath,
            components
        };
    }

    isAbsolute () {
        return this._value.isAbsolute;
    }

    hasTrailingSlash () {
        return this._value.hasTrailingSlash;
    }

    isEmpty () {
        return this._value.rawPath === null;
    }

    toString () {
        const value = this._value;
        let rawPath = value.components.map(encodeURIComponent).join('/');
        if (value.isAbsolute) {
            rawPath = '/' + rawPath;
        }
        if (value.hasTrailingSlash) {
            rawPath += '/';
        }
        return rawPath;
    }

    toArray () {
        return this._value.components;
    }

    toLowerCase () {
        return this;
    }
}

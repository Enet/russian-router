import Part from './Part.js';

export default class Path extends Part {
    constructor (rawPath) {
        super(rawPath);

        rawPath = ((rawPath || '') + '') || null;
        let isAbsolute = false;
        let hasTrailingSlash = false;
        let components = [];
        if (rawPath) {
            isAbsolute = rawPath[0] === '/';
            hasTrailingSlash = rawPath.length > 1 && rawPath[rawPath.length - 1] === '/';
            components = rawPath.split('/').slice(+isAbsolute, -hasTrailingSlash);
        }
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
        let rawPath = value.components.join('/');
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

    toLowerCase (condition) {
        if (!condition) {
            return this;
        }
        return new Path(this._value.rawPath.toLowerCase());
    }
}

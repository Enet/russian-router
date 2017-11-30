import Part from './Part.js';

const keyToKey = (key) => key;
const keyToLowerCase = (key) => key.toLowerCase();

export default class Query extends Part {
    constructor (rawQuery) {
        super(rawQuery);
        rawQuery = this._value;

        let components = {};
        if (rawQuery) {
            const queryCouples = rawQuery.split('&');
            queryCouples.forEach((queryCouple) => {
                const equalIndex = queryCouple.indexOf('=');
                if (equalIndex === -1) {
                    components[decodeURIComponent(queryCouple)] = '';
                } else {
                    const queryCoupleKey = decodeURIComponent(queryCouple.substr(0, equalIndex));
                    const queryCoupleValue = decodeURIComponent(queryCouple.substr(equalIndex + 1));
                    components[queryCoupleKey] = queryCoupleValue;
                }
            });
        }

        this._value = {
            rawQuery,
            components
        };
    }

    isEmpty () {
        return this._value.rawQuery === null;
    }

    toString (transformKey=keyToKey) {
        const components = this.toObject();
        const queryCouples = [];
        for (let c in components) {
            const queryCoupleKey = encodeURIComponent(transformKey(c));
            const queryCoupleValue = encodeURIComponent(components[c]);
            queryCouples.push(queryCoupleKey + '=' + queryCoupleValue);
        }
        const rawQuery = queryCouples.join('&');
        return rawQuery;
    }

    toObject () {
        return this._value.components;
    }

    toLowerCase (condition) {
        if (!condition) {
            return this;
        }
        const PartConstructor = this.constructor;
        return new PartConstructor(this.toString(keyToLowerCase));
    }
}

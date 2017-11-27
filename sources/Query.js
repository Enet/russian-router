import Part from './Part.js';

export default class Query extends Part {
    constructor (rawQuery) {
        super(rawQuery);

        rawQuery = ((rawQuery || '') + '') || null;
        let components = {};
        if (rawQuery) {
            const queryCouples = rawQuery.split('&');
            queryCouples.forEach((queryCouple) => {
                const equalIndex = queryCouple.indexOf('=');
                if (equalIndex === -1) {
                    components[queryCouple] = '';
                } else {
                    const queryKey = queryCouple.substr(0, equalIndex);
                    const queryValue = queryCouple.substr(equalIndex + 1);
                    components[decodeURIComponent(queryKey)] = decodeURIComponent(queryValue);
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

    toString () {
        let rawQuery = [];
        for (let c in components) {
            rawQuery.push(encodeURIComponent(c) + '=' + encodeURIComponent(components[c]));
        }
        rawQuery = rawQuery.join('&');
        return rawQuery;
    }

    toObject () {
        return this._value.components;
    }

    toLowerCase (condition) {
        if (!condition) {
            return this;
        }
        return new Query(this._value.rawQuery.toLowerCase());
    }
}

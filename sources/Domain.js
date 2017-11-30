import Part from './Part.js';

export default class Domain extends Part {
    toLowerCase () {
        return super.toLowerCase(true);
    }

    static isEqual (domain1, domain2) {
        domain1 = domain1.toString().toLowerCase();
        domain2 = domain2.toString().toLowerCase();
        return domain1 === domain2;
    }
}

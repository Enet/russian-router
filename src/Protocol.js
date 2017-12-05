import Part from './Part.js';

export default class Protocol extends Part {
    toLowerCase () {
        return super.toLowerCase(true);
    }

    static isEqual (protocol1, protocol2) {
        protocol1 = protocol1.toString().toLowerCase();
        protocol2 = protocol2.toString().toLowerCase();
        return protocol1 === protocol2;
    }
}

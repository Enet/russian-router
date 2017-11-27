import Part from './Part.js';

export default class Protocol extends Part {
    toLowerCase () {
        return super.toLowerCase(true);
    }
}

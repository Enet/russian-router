import Part from './Part.js';

export default class Protocol extends Part {
    isCaseSensitive () {
        return false;
    }

    toLowerCase () {
        return super.toLowerCase(true);
    }
}

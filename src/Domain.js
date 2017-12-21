import Part from './Part.js';

export default class Domain extends Part {
    isCaseSensitive () {
        return false;
    }

    toLowerCase () {
        return super.toLowerCase(true);
    }
}

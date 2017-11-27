import Part from './Part.js';

export default class Domain extends Part {
    toLowerCase () {
        return super.toLowerCase(true);
    }
}

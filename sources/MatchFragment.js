export default class MatchFragment {
    constructor (value, params) {
        if (!params || typeof params !== 'object') {
            params = {};
        }

        this.value = value;
        this.params = params;
    }
}

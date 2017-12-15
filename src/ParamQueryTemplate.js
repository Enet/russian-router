import ParamPathTemplate from './ParamPathTemplate.js';

export default class ParamQueryTemplate extends ParamPathTemplate {
    _getPartName () {
        return 'query';
    }
}

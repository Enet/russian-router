import {
    getPartConstructor,
    getPortByUri
} from './utils.js';
import ParamUniversalTemplate from './ParamUniversalTemplate.js';

export default class ParamPortTemplate extends ParamUniversalTemplate {
    _getGenerateFunctions (partName, templateUri) {
        const PartConstructor = getPartConstructor(partName);
        const paramName = this._paramName;
        const generateFunctions = super._getGenerateFunctions(...arguments);
        generateFunctions[generateFunctions.length - 1] = (userParams) => {
            const userParam = userParams[paramName];
            let parsedValue = new PartConstructor(userParam);
            if (parsedValue.isEmpty()) {
                parsedValue = getPortByUri(templateUri);
            }
            return parsedValue;
        };
        return generateFunctions;
    }
}

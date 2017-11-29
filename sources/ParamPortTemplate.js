import {
    getPartConstructor,
    getPortByParsedUri
} from './utils.js';
import ParamUniversalTemplate from './ParamUniversalTemplate.js';

export default class ParamPortTemplate extends ParamUniversalTemplate {
    _getGenerateFunctions (partName, templateUri) {
        const PartConstructor = getPartConstructor(partName);
        const generateFunctions = super(...arguments);
        generateFunctions[generateFunctions.length - 1] = (userParams) => {
            const userParam = userParams[paramName];
            let parsedValue = new PartConstructor(userParam);
            if (parsedValue.isEmpty()) {
                parsedValue = getPortByParsedUri(templateUri);
            }
            return parsedValue;
        };
        return generateFunctions;
    }
}

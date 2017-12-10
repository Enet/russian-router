import {
    getPortByParsedUri,
    emulateParsedUri
} from './utils.js';
import ParamUniversalTemplate from './ParamUniversalTemplate.js';

export default class ParamPortTemplate extends ParamUniversalTemplate {
    _getGenerateFunctions (partName, templateUri, routeOptions) {
        const generateFunctions = super._getGenerateFunctions(...arguments);
        generateFunctions[generateFunctions.length - 1] = (userParams, generatingUri) => {
            const emulatedParsedUri = emulateParsedUri(templateUri, generatingUri);
            const parsedValue = getPortByParsedUri(emulatedParsedUri, routeOptions.getDefaultPart);
            return parsedValue;
        };
        return generateFunctions;
    }
}

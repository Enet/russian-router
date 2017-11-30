import {
    getPartConstructor,
    getPortByParsedUri
} from './utils.js';
import ParamUniversalTemplate from './ParamUniversalTemplate.js';

export default class ParamPortTemplate extends ParamUniversalTemplate {
    _getGenerateFunctions (partName, templateUri) {
        const PartConstructor = getPartConstructor(partName);
        const paramName = this._paramName;
        const generateFunctions = super._getGenerateFunctions(...arguments);
        generateFunctions[generateFunctions.length - 1] = (userParams, generatingUri) => {
            const emulatedParsedUri = {
                protocol: generatingUri.protocol,
                domain: generatingUri.domain,
                port: templateUri.getParsedUri('port')
            };
            const parsedValue = getPortByParsedUri(emulatedParsedUri);
            return parsedValue;
        };
        return generateFunctions;
    }
}

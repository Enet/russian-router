import {
    getPortByParsedUri,
    emulateParsedUri
} from './utils.js';
import ParamUniversalTemplate from './ParamUniversalTemplate.js';

export default class ParamPortTemplate extends ParamUniversalTemplate {
    _getGenerateFunctions (templateUri) {
        const generateFunctions = super._getGenerateFunctions(...arguments);
        generateFunctions[generateFunctions.length - 1] = (userParams, contextOptions) => {
            const emulatedParsedUri = emulateParsedUri(templateUri, contextOptions.generatingUri);
            const parsedValue = getPortByParsedUri(emulatedParsedUri, contextOptions);
            return parsedValue;
        };
        return generateFunctions;
    }

    _getPartName () {
        return 'port';
    }
}

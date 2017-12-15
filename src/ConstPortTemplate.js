import {
    getPortByParsedUri,
    emulateParsedUri
} from './utils.js';
import ConstUniversalTemplate from './ConstUniversalTemplate.js';
import MatchFragment from './MatchFragment.js';

export default class ConstPortTemplate extends ConstUniversalTemplate {
    _getMatchFunctions (templateUri) {
        return [(userUri, contextOptions) => {
            const {partName} = contextOptions;
            const emulatedParsedUri = emulateParsedUri(templateUri, userUri.getParsedUri());
            const templateUriPort = getPortByParsedUri(emulatedParsedUri, contextOptions);
            const templateUriPortString = templateUriPort.toString();
            const userUriPort = userUri.getParsedUri(partName);
            const userUriPortString = userUriPort.toString();
            if (userUriPortString === templateUriPortString) {
                return new MatchFragment(userUriPortString);
            }
            return null;
        }];
    }

    _getGenerateFunctions (templateUri) {
        return [(userParams, contextOptions) => {
            const emulatedParsedUri = emulateParsedUri(templateUri, contextOptions.generatingUri);
            const parsedValue = getPortByParsedUri(emulatedParsedUri, contextOptions);
            return parsedValue;
        }];
    }

    _getPartName () {
        return 'port';
    }
}

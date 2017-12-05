import {
    getPortByParsedUri,
    emulateParsedUri
} from './utils.js';
import ConstUniversalTemplate from './ConstUniversalTemplate.js';
import MatchFragment from './MatchFragment.js';

export default class ConstPortTemplate extends ConstUniversalTemplate {
    _getMatchFunctions (partName, templateUri, routeOptions) {
        return [(userUri) => {
            const emulatedParsedUri = emulateParsedUri(templateUri, userUri.getParsedUri());
            const templateUriPort = getPortByParsedUri(emulatedParsedUri, routeOptions.getDefaultPart);
            const templateUriPortString = templateUriPort.toString();
            const userUriPort = userUri.getParsedUri(partName);
            const userUriPortString = userUriPort.toString();
            if (userUriPortString === templateUriPortString) {
                return new MatchFragment(userUriPortString);
            }
            return null;
        }];
    }

    _getGenerateFunctions (partName, templateUri, routeOptions) {
        return [(userParams, generatingUri) => {
            const emulatedParsedUri = emulateParsedUri(templateUri, generatingUri);
            const parsedValue = getPortByParsedUri(emulatedParsedUri, routeOptions.getDefaultPart);
            return parsedValue;
        }];
    }
}

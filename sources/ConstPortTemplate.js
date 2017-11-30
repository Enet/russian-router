import {
    getPortByParsedUri
} from './utils.js';
import ConstUniversalTemplate from './ConstUniversalTemplate.js';
import MatchFragment from './MatchFragment.js';

export default class ConstPortTemplate extends ConstUniversalTemplate {
    _getMatchFunctions (partName, templateUri, routeOptions) {
        return [(userUri) => {
            const emulatedParsedUri = {
                protocol: userUri.getParsedUri('protocol'),
                domain: userUri.getParsedUri('domain'),
                port: templateUri.getParsedUri('port')
            };
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
            const emulatedParsedUri = {
                protocol: generatingUri.protocol,
                domain: generatingUri.domain,
                port: templateUri.getParsedUri('port')
            };
            const parsedValue = getPortByParsedUri(emulatedParsedUri, routeOptions.getDefaultPart);
            return parsedValue;
        }];
    }
}

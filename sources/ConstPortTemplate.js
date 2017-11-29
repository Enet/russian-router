import {
    getPortByParsedUri
} from './utils.js';
import ConstUniversalTemplate from './ConstUniversalTemplate.js';
import MatchFragment from './MatchFragment.js';

export default class ConstPortTemplate extends ConstUniversalTemplate {
    _getMatchFunctions (partName, templateUri) {
        return [(userUri) => {
            const templateUriPort = getPortByParsedUri(templateUri);
            const templateUriPortString = templateUriPort.toString();
            const userUriPort = userUri.getParsedUri(partName);
            const userUriPortString = userUriPort.toString();
            if (userUriPortString === templateUriPortString) {
                return new MatchFragment(userUriPortString);
            }
            return null;
        }];
    }

    _getGenerateFunctions (partName, templateUri) {
        return [(userParams) => {
            const parsedValue = getPortByParsedUri(templateUri);
            return parsedValue;
        }];
    }
}

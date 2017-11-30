import DefaultTemplate from './DefaultTemplate.js';
import MatchFragment from './MatchFragment.js';

export default class ConstUniversalTemplate extends DefaultTemplate {
    constructor () {
        super(...arguments);
        this._initMatchGenerateFunctions(...arguments);
    }

    _getMatchFunctions (partName, templateUri, routeOptions) {
        return [(userUri) => {
            let templateUriPart = templateUri.getParsedUri(partName);
            if (templateUriPart.isEmpty()) {
                templateUriPart = routeOptions.getDefaultPart(partName);
            }
            const templateUriPartString = templateUriPart.toLowerCase(!routeOptions.caseSensitive).toString();

            let userUriPart = userUri.getParsedUri(partName);
            if (userUriPart.isEmpty()) {
                userUriPart = routeOptions.getDefaultPart(partName);
            }
            const userUriPartString = userUriPart.toLowerCase(!routeOptions.caseSensitive).toString();

            if (templateUriPart.isEmpty() || userUriPartString === templateUriPartString) {
                return new MatchFragment(userUriPart.toString());
            }

            return null;
        }];
    }

    _getGenerateFunctions (partName, templateUri, routeOptions) {
        return [(userParams) => {
            const parsedValue = templateUri.getParsedUri(partName);
            return parsedValue;
        }];
    }
}

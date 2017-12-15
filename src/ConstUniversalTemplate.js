import DefaultTemplate from './DefaultTemplate.js';
import MatchFragment from './MatchFragment.js';

export default class ConstUniversalTemplate extends DefaultTemplate {
    constructor () {
        super(...arguments);
        this._initMatchGenerateFunctions(...arguments);
    }

    _getMatchFunctions (templateUri) {
        return [(userUri, contextOptions) => {
            const {partName} = contextOptions;
            let templateUriPart = templateUri.getParsedUri(partName);
            if (templateUriPart.isEmpty()) {
                templateUriPart = contextOptions.router.getDefaultPart(partName);
            }
            const templateUriPartString = templateUriPart.toLowerCase(!contextOptions.caseSensitive).toString();

            let userUriPart = userUri.getParsedUri(partName);
            if (userUriPart.isEmpty()) {
                userUriPart = contextOptions.router.getDefaultPart(partName);
            }
            const userUriPartString = userUriPart.toLowerCase(!contextOptions.caseSensitive).toString();

            if (templateUriPart.isEmpty() || userUriPartString === templateUriPartString) {
                return new MatchFragment(userUriPart.toString());
            }

            return null;
        }];
    }

    _getGenerateFunctions (templateUri) {
        return [(userParams, contextOptions) => {
            const {partName} = contextOptions;
            const parsedValue = templateUri.getParsedUri(partName);
            return parsedValue;
        }];
    }
}

import {
    getDefaultPart
} from './utils.js';
import DefaultTemplate from './DefaultTemplate.js';

export default class ConstUniversalTemplate extends DefaultTemplate {
    matchParsedValue (userUri) {
        const templateUri = this._templateUri;
        const routeOptions = this._routeOptions;
        const partName = this._partName;

        let userUriPart = userUri.getParsedUri(partName);
        let userUriPartString = userUriPart.toLowerCase(!routeOptions.caseSensitive).toString();
        let templateUriPart = templateUri.getParsedUri(partName);
        if (templateUriPart.isEmpty()) {
            templateUriPart = getDefaultPart(partName);
        }
        if (templateUriPart.isEmpty()) {
            return new MatchFragment(userUriPartString);
        }

        let templateUriPartString = templateUriPart.toLowerCase(!routeOptions.caseSensitive).toString();
        if (userUriPartString === templateUriPartString) {
            return new MatchFragment(userUriPartString);
        }

        return null;
    }

    generateParsedValue (userParams) {
        const templateUri = this._templateUri;
        const routeOptions = this._routeOptions;
        const partName = this._partName;

        let parsedValue = templateUri.getParsedUri(partName);
        return parsedValue.toLowerCase(!routeOptions.caseSensitive);
    }
}

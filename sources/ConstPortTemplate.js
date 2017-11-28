import {
    getDefaultPart,
    getPortByProtocol
} from './utils.js';
import ConstUniversalTemplate from './ConstUniversalTemplate.js';
import MatchFragment from './MatchFragment.js';
import Port from './Port.js';

export default class ConstPortTemplate extends ConstUniversalTemplate {
    matchParsedValue (userUri) {
        const templateUri = this._templateUri;
        const routeOptions = this._routeOptions;
        const partName = this._partName;

        let userUriPart = userUri.getParsedUri(partName);
        if (userUriPart.isEmpty()) {
            const userPortByProtocol = getPortByProtocol(userUri.getParsedUri('protocol'));
            userUriPart = new Port(userPortByProtocol);
        }
        if (userUriPart.isEmpty()) {
            userUriPart = getDefaultPart(partName);
        }

        let templateUriPart = templateUri.getParsedUri(partName);
        if (templateUriPart.isEmpty()) {
            const templateUriProtocol = templateUri.getParsedUri('protocol').toLowerCase();
            const defaultProtocol = getDefaultPart('protocol').toLowerCase();
            if (templateUriProtocol.toString() === defaultProtocol.toString()) {
                templateUriPart = getDefaultPart(partName);
            }
            if (templateUriPart.isEmpty()) {
                const templatePortByProtocol = getPortByProtocol(templateUriProtocol);
                templateUriPart = new Port(templatePortByProtocol);
            }
        }

        let userUriPartString = userUriPart.toString();
        if (userUriPartString === templateUriPart.toString()) {
            return new MatchFragment(userUriPartString);
        }

        return null;
    }
}

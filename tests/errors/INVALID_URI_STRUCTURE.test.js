import Uri from '../../src/Uri.js';
import TemplateUri from '../../src/TemplateUri.js';

class CustomUri extends Uri {
    _getRegExp () {
        return /^\d$/
    }
}

class CustomTemplateUri extends TemplateUri {
    _getRegExp () {
        return /^\d$/
    }
}

test('Error INVALID_URI_STRUCTURE happens', () => {
    expect(() => new CustomUri('abc')).toThrow(/\bINVALID_URI_STRUCTURE\b/);
    expect(() => new CustomTemplateUri('abc')).toThrow(/\bINVALID_URI_STRUCTURE\b/);
});

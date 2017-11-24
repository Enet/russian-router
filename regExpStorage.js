export const urlRegExp = /^(([A-z0-9]+:)?\/\/([A-z0-9.]+)(:[0-9]+)?)?([^?#]*)(\?[^#]*)?(#.*)?$/i;
export const templateRegExp = /^(((?:[A-z0-9]+|{[A-z0-9]+}):)?\/\/((?:[A-z0-9.]+|{[A-z0-9]+}))(:(?:[0-9]+|{[A-z0-9]+}))?)?([^?#]*)(\?[^#]*)?(#.*)?$/i;
export const queryKeyValueRegExp = /([A-z0-9]+)(=[A-z0-9]*|={[A-z0-9]+})?(?:&|#|$)/ig;
export const paramRegExp = /^{([^*}]*)(\*)?}$/;

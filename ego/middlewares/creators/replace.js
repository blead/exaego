function replaceCreator(patternSource, replacementSource) {
  return function ({ localContext, ...rest }) {
    const localMessage = localContext.message || { content: '' };
    const pattern = typeof patternSource === 'function' ?
      patternSource({ localContext, ...rest }) : patternSource;
    const replacement = typeof replacementSource === 'function' ?
      replacementSource({ localContext, ...rest }) : replacementSource;
    localContext.message = {
      ...localMessage,
      content: localMessage.content.replace(pattern, replacement).trim(),
    };
    return true;
  };
}

module.exports = replaceCreator;

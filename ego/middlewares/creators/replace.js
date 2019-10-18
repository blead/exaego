function replaceCreator(patternSource, replacementSource) {
  return function (message, localContext) {
    const localMessage = localContext.message || { content: '' };
    const pattern = typeof patternSource === 'function' ?
      patternSource(message, localContext) :
      patternSource;
    const replacement = typeof replacementSource === 'function' ?
      replacementSource(message, localContext) :
      replacementSource;
    localContext.message = {
      ...localMessage,
      content: localMessage.content.replace(pattern, replacement).trim(),
    };
    return true;
  };
}

module.exports = replaceCreator;

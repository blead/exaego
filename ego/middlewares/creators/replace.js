function replaceCreator(patternSource, replacementSource) {
  return function (message, connector, localContext, connectorContext, globalContext) {
    const localMessage = localContext.message || { content: '' };
    const pattern = typeof patternSource === 'function' ?
      patternSource(message, connector, localContext, connectorContext, globalContext) :
      patternSource;
    const replacement = typeof replacementSource === 'function' ?
      replacementSource(message, connector, localContext, connectorContext, globalContext) :
      replacementSource;
    localContext.message = {
      ...localMessage,
      content: localMessage.content.replace(pattern, replacement).trim(),
    };
    return true;
  };
}

module.exports = replaceCreator;

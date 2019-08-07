function iterateCreator(arraySource, callbackSource, ...args) {
  return function (message, connector, localContext, connectorContext, globalContext) {
    const array = typeof arraySource === 'function' ?
      arraySource(message, connector, localContext, connectorContext, globalContext) :
      arraySource;
    const callbacks = array.map(value => callbackSource(value, ...args));

    for(callback of callbacks) {
      if (!callback(message, connector, localContext, connectorContext, globalContext)) {
        return false;
      }
    }
    return true;
  };
}

module.exports = iterateCreator;

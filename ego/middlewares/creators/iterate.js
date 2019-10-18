function iterateCreator(arraySource, callbackSource, ...args) {
  return function (message, localContext) {
    const array = typeof arraySource === 'function' ?
      arraySource(message, localContext) :
      arraySource;
    const callbacks = array.map(value => callbackSource(value, ...args));

    for(callback of callbacks) {
      if (!callback(message, localContext)) {
        return false;
      }
    }
    return true;
  };
}

module.exports = iterateCreator;

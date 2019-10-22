function iterateCreator(arraySource, callbackSource, ...args) {
  return function (contexts) {
    const array = typeof arraySource === 'function' ? arraySource(contexts) : arraySource;
    const callbacks = array.map(value => callbackSource(value, ...args));

    for(callback of callbacks) {
      if (!callback(contexts)) {
        return false;
      }
    }
    return true;
  };
}

module.exports = iterateCreator;

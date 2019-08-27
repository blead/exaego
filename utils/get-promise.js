function getPromise(f, thisArg, ...args) {
  return new Promise((resolve, reject) => {
    (f.bind(thisArg))(...args, (error, result) => {
        if (error !== null) {
          reject(error);
        } else {
          resolve(result);
        }
    });
  });
}

module.exports = { getPromise };

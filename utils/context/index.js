const LocalContext = require('./local-context');
const PersistentContext = require('./persistent-context');

function createContext(type='local', options={}) {
  switch (type) {
    case 'local':
      return Promise.resolve(new LocalContext(options));
    case 'persistent':
      return new PersistentContext(options);
    default:
      return Promise.reject(new Error(`Context type ${type} not defined.`));
  }
}

module.exports = { createContext };

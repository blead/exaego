const Datastore = require('nedb');
const path = require('path');
const config = require('../../config');
const { getPromise } = require('../../utils/get-promise')

class PersistentContext {
  static compactionInterval = 86400000;
  static collections = [];
  contextManager;
  store;

  constructor({ id, collection='global', initialValue={} }, contextManager) {
    if (!PersistentContext.collections.includes(collection)) {
      const filename = path.join(config.storePath, collection);
      PersistentContext.collections[collection] = new Datastore({ filename, autoload: true });
      PersistentContext.collections[collection].persistence.setAutocompactionInterval(PersistentContext.compactionInterval);
      PersistentContext.collections[collection].ensureIndex({ fieldName: 'id', unique: true });
    }
    this.contextManager = contextManager;
    contextManager.register(id, this);
    this.store = PersistentContext.collections[collection];
    return getPromise(this.store.findOne, this.store, { id })
      .then(document => {
        if (document === null) {
          return getPromise(this.store.insert, this.store, {
            ...initialValue,
            id,
          });
        }
        return document;
      })
      .then(document => new Proxy(document, {
        set: (target, prop, value) => {
          this.store.update({ id }, {
            ...target,
            [prop]: value,
          });
          target[prop] = value;
          return true;
        },
        deleteProperty: (target, prop) => {
          this.store.update({ id }, {
            $unset: {
              [prop]: true,
            },
          });
          const props = prop.split('.');
          const lastProp = props.pop();
          delete props.reduce((target, prop) => target[prop], target)[lastProp];
          return true;
        },
      }));
  }
}

module.exports = PersistentContext;

class ContextManager {
  contexts = {};

  register(id, context) {
    if (id in this.contexts) {
      throw new Error(`Context id ${id} already exists,`);
    }
    this.contexts[id] = context;
  }

  deregister(id) {
    delete this.contexts[id];
  }

  getContext(id) {
    if (!(id in this.contexts)) {
      throw new Error(`Context id ${id} not found.`);
    }
    return this.contexts[id];
  }

  createContext(type='local', options={}) {
    switch (type) {
      case 'local':
        return Promise.resolve(new LocalContext(this, options));
      case 'persistent':
        return new PersistentContext(this, options);
      default:
        return Promise.reject(new Error(`Context type ${type} not defined.`));
    }
  }
}

module.exports = ContextManager;

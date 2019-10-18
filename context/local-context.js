class LocalContext {
  contextManager;

  constructor({ id=null, initialValue={} }, contextManager) {
    this.contextManager = contextManager;
    if (id) {
      contextManager.register(id, this);
    }
    return { ...initialValue };
  }
}

module.exports = LocalContext;

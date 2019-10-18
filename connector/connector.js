const EventEmitter = require('events');

class Connector extends EventEmitter {
  connectorManager;

  constructor(connectorManager, id) {
    this.connectorManager = connectorManager;
    connectorManager.register(id, this);
  }
}

module.exports = Connector;

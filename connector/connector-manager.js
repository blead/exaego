class ConnectorManager {
  connectors = {};

  register(id, connector) {
    if (id in this.connectors) {
      throw new Error(`Connector id ${id} already exists,`);
    }
    this.connectors[id] = connector;
  }

  deregister(id) {
    delete this.connectors[id];
  }

  getConnector(id) {
    if (!(id in this.connectors)) {
      throw new Error(`Connector id ${id} not found.`);
    }
    return this.connectors[id];
  }

  getConnectors() {
    return Object.values(this.connectors);
  }
}

module.exports = ConnectorManager;

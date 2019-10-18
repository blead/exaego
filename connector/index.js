const ConnectorManager = require('./connector-manager');
const DiscordConnector = require('./discord');

const connectorManager = new ConnectorManager();

module.exports = {
  connectorManager,
  connectors: [
    DiscordConnector,
  ],
};

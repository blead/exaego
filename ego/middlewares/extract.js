const { connectorManager } = require('../../connector');

function extract(message, localContext) {
  const connector = connectorManager.getConnector(localContext.connectorId);
  localContext.message = {
    ...localContext.message,
    content: connector.message.getMessageContent(message),
    ...connector.message.getMessageMetadata(message),
  };
  return true;
}

module.exports = extract;

function log(message, connector, localContext, connectorContext, globalContext) {
  connector.logger.log(localContext.message.content);
  return true;
}

module.exports = log;

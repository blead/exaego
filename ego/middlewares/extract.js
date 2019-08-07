function extract(message, connector, localContext, connectorContext, globalContext) {
  localContext.message = {
    ...localContext.message,
    content: connector.message.getMessageContent(message),
    ...connector.message.getMessageMetadata(message),
  };
  return true;
}

module.exports = extract;

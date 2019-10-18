function log(message, localContext) {
  connector.logger.log(localContext.message.content);
  return true;
}

module.exports = log;

const { connectorManager } = require('../../connector');
const { contextManager } = require('../../context');

function trigger(message, localContext) {
  const localMessage = localContext.message || {};
  const connector = connectorManager.getConnector(localContext.connectorId);
  const globalContext = contextManager.getContext(localContext.egoId);
  const connectorContext = contextManager.getContext(localContext.connectorId);
  if (localMessage.author == connector.user.self()) {
    return false;
  }
  if (connector.user.isBot(localMessage.author)) {
    return false;
  }
  if (connector.message.isMentioned(message, connector.user.self())) {
    return true;
  }
  const globalTriggers = globalContext.triggers[
    connector.guild.getId(localMessage.guild)
  ] || [];
  const connectorTriggers = connectorContext.triggers[
    connector.guild.getId(localMessage.guild)
  ] || [];
  if (
    [...globalTriggers, ...connectorTriggers]
      .reduce(
        (previous, current) => (previous || localMessage.content.startsWith(current)),
        false
      )
  ) {
    return true;
  }
  return false;
}

module.exports = trigger;

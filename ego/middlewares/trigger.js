function trigger(message, connector, localContext, connectorContext, globalContext) {
  const localMessage = localContext.message || {};
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

function getTriggers({ connector, localContext, connectorContext, globalContext }) {
  const localMessage = localContext.message || {};
  const globalTriggers = globalContext.triggers[
    connector.guild.getId(localMessage.guild)
  ] || [];
  const connectorTriggers = connectorContext.triggers[
    connector.guild.getId(localMessage.guild)
  ] || [];
  return globalTriggers.concat(connectorTriggers)
    .map(escapeRegex)
    .map(pattern => new RegExp(`^${pattern}`));
}

module.exports = getTriggers;

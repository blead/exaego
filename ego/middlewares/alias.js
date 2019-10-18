const { escapeRegex } = require('../../utils/regex');
const { connectorManager } = require('../../connector');
const { contextManager } = require('../../context');

function alias(message, localContext) {
  const localMessage = localContext.message || {};
  const connector = connectorManager.getConnector(localContext.connectorId);
  const globalContext = contextManager.getContext(localContext.egoId);
  const connectorContext = contextManager.getContext(localContext.connectorId);
  const globalAliases = globalContext.aliases[
    connector.guild.getId(localMessage.guild)
  ] || {};
  const connectorAliases = connectorContext.aliases[
    connector.guild.getId(localMessage.guild)
  ] || {};

  const newContent = [...Object.entries(globalAliases), ...Object.entries(connectorAliases)]
    .map(([name, value]) => ([new RegExp(`^${escapeRegex(name)}`), value]))
    .reduce(
      (content, [re, value]) => content.replace(re, value),
      localMessage.content,
    );
  localContext.message = {
    ...localMessage,
    content: newContent.trim(),
  };
  return true;
}

module.exports = alias;

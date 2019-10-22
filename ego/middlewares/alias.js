const { escapeRegex } = require('../../utils/regex');

function alias({ connector, localContext, connectorContext, globalContext }) {
  const localMessage = localContext.message || {};
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

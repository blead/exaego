function triggers(message, connector, localContext, connectorContext, globalContext) {
  const localMessage = localContext.message || {};
  const pattern = /^\s*trig(?:ger)?s?/i;
  if (!localMessage.content) {
    return true;
  }
  const matches = pattern.exec(localMessage.content);
  if (matches === null) {
    return true;
  }
  const channel = localMessage.channel;
  const guild = connector.guild.getName(localMessage.guild);
  const triggers = connectorContext.triggers[guild] || [];
  if (triggers.length === 0) {
    connector.channel.send(channel, 'There are no triggers active.');
  } else {
    connector.channel.send(channel, `Currently active triggers: \`${triggers.join('`, `')}\``);
  }
  return false;
}

module.exports = triggers;

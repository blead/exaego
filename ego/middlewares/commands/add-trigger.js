function addTrigger(message, connector, localContext, connectorContext, globalContext) {
  const localMessage = localContext.message || {};
  const pattern = /^\s*(addtrigger|at)(?:\s+(.+))*/i;
  if (!localMessage.content) {
    return true;
  }
  const matches = pattern.exec(localMessage.content);
  if (matches === null) {
    return true;
  }
  const channel = localMessage.channel;
  if (typeof matches[2] !== 'string') {
    connector.channel.send(channel, [
      'Usage:',
      '`addtrigger <trigger> ...`',
      '`at <trigger> ...`',
    ].join('\n'));
  } else {
    const arguments = matches[2].split(/\s+/);
    const guild = connector.guild.getName(localMessage.guild);
    const existingTriggers = connectorContext.triggers[guild] || [];
    connectorContext.triggers[guild] = [...new Set([...existingTriggers, ...arguments])];
    connector.channel.send(channel, 'Triggers added.');
  }
  return false;
}

module.exports = addTrigger;

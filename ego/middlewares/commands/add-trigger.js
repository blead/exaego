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
    const guild = connector.guild.getId(localMessage.guild);
    const existingTriggers = connectorContext.triggers[guild] || [];
    const newTriggers = [...new Set([...existingTriggers, ...arguments])];
    connectorContext.triggers = {
      ...connectorContext.triggers,
      [guild]: newTriggers,
    };
    connector.channel.send(channel, 'Triggers added.');
  }
  return false;
}

module.exports = addTrigger;

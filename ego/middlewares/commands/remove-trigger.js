function removeTrigger(message, connector, localContext, connectorContext, globalContext) {
  const localMessage = localContext.message || {};
  const pattern = /^\s*(removetrigger|rt)(?:\s+(.+))*/i;
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
      '`removetrigger <trigger> ...`',
      '`rt <trigger> ...`',
    ].join('\n'));
  } else {
    const arguments = matches[2].split(/\s+/);
    const guild = connector.guild.getName(localMessage.guild);
    const existingTriggers = connectorContext.triggers[guild] || [];
    connectorContext.triggers[guild] = arguments.reduce((triggers, trigger) => {
      const index = triggers.indexOf(trigger);
      if (index !== -1) {
        return triggers.slice(0, index).concat(triggers.slice(index + 1));
      }
      return triggers;
    }, existingTriggers);
    connector.channel.send(channel, 'Triggers removed.');
  }
  return false;
}

module.exports = removeTrigger;

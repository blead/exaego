function trigger(message, connector, localContext, connectorContext, globalContext) {
  const localMessage = localContext.message || {};
  const pattern = /(trigger)(?:\s+(.+))*/i;
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
      '`trigger list`',
      '`trigger add`',
      '`trigger remove`',
    ].join('\n'));
    return false;
  }
  const arguments = matches[2].split(/\s+/);
  const guild = connector.guild.getId(localMessage.guild);
  const triggers = connectorContext.triggers[guild] || [];
  if (arguments[0] === 'list') {
    if (triggers.length === 0) {
      connector.channel.send(channel, 'There are no triggers active.');
    } else {
      connector.channel.send(channel, `Currently active triggers: \`${triggers.join('`, `')}\``);
    }
  } else if (arguments[0] === 'add') {
    if (arguments.length > 1) {
      const newTriggers = [...new Set([...triggers, ...arguments.slice(1)])];
      connectorContext.triggers = {
        ...connectorContext.triggers,
        [guild]: newTriggers,
      };
      connector.channel.send(channel, 'Triggers added.');
    } else {
      connector.channel.send(channel, [
        'Usage:',
        '`trigger add <trigger> ...`',
      ].join('\n'));
    }
  } else if (arguments[0] === 'remove') {
    if (arguments.length > 1) {
      const newTriggers = arguments.slice(1).reduce((triggers, trigger) => {
        const index = triggers.indexOf(trigger);
        if (index !== -1) {
          return triggers.slice(0, index).concat(triggers.slice(index + 1));
        }
        return triggers;
      }, triggers);
      connectorContext.triggers = {
        ...connectorContext.triggers,
        [guild]: newTriggers,
      };
      connector.channel.send(channel, 'Triggers removed.');
    } else {
      connector.channel.send(channel, [
        'Usage:',
        '`trigger remove <trigger> ...`',
      ].join('\n'));
    }
  } else {
    return true;
  }
  return false;
}

module.exports = trigger;

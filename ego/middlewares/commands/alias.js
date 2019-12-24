const RESERVED_WORDS = [
  'add',
  'alias',
  'list',
  'remove',
];

function alias(message, connector, localContext, connectorContext, globalContext) {
  const localMessage = localContext.message || {};
  const pattern = /(alias)(?:\s+(.+))*/i;
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
      '`alias list`',
      '`alias add`',
      '`alias remove`',
    ].join('\n'));
    return false;
  }
  const arguments = matches[2].split(/\s+/);
  const guild = connector.guild.getId(localMessage.guild);
  const aliases = connectorContext.aliases[guild] || {};
  if (arguments[0] === 'list') {
    if (Object.keys(aliases).length === 0) {
      connector.channel.send(channel, 'There are no aliases.');
    } else {
      connector.channel.send(channel, [
        'Currently set aliases:',
        ...Object.entries(aliases).map(([key, value]) => `\`${key}\` → \`${value}\``),
      ].join('\n'));
    }
  } else if (arguments[0] === 'add') {
    const [name, value] = arguments.slice(1).join(' ').split('=').map(s => s.trim());
    if (RESERVED_WORDS.includes(name)) {
      connector.channel.send(channel, `\`${key}\` is reserved (not allowed as an alias).`);
    } else if (name && value) {
      const newAliases = {
        ...aliases,
        [name]: value,
      };
      connectorContext.aliases = {
        ...connectorContext.aliases,
        [guild]: newAliases,
      };
      connector.channel.send(channel, 'Alias set.');
    } else {
      connector.channel.send(channel, [
        'Usage:',
        '`alias add <name>=<value>`',
      ].join('\n'));
    }
  } else if (arguments[0] === 'remove') {
    if (arguments.length > 1) {
      const newAliases = { ...aliases };
      delete newAliases[arguments.slice(1).join(' ')];
      connectorContext.aliases = {
        ...connectorContext.aliases,
        [guild]: newAliases,
      };
      connector.channel.send(channel, 'Alias removed.');
    } else {
      connector.channel.send(channel, [
        'Usage:',
        '`alias remove <name>`',
      ].join('\n'));
    }
  } else {
    return true;
  }
  return false;
}

module.exports = alias;

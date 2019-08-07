const extract = require('./extract');
const trigger = require('./trigger');
const iterateCreator = require('./creators/iterate');
const replaceCreator = require('./creators/replace');
const commands = require('./commands');
const log = require('./log');
const { escapeRegex } = require('../../utils/regex');

function getTriggers(message, connector, localContext, connectorContext, globalContext) {
  const localMessage = localContext.message || {};
  const globalTriggers = globalContext.triggers[
    connector.guild.getName(localMessage.guild)
  ] || [];
  const connectorTriggers = connectorContext.triggers[
    connector.guild.getName(localMessage.guild)
  ] || [];
  return globalTriggers.concat(connectorTriggers)
    .map(escapeRegex)
    .map(pattern => new RegExp(`^${pattern}`));
}

module.exports = [
  extract,
  trigger,
  iterateCreator(getTriggers, replaceCreator, ''),
  iterateCreator(
    (message, connector) => [new RegExp(escapeRegex(connector.user.self().toString()), 'g')],
    replaceCreator,
    ''
  ),
  log,
  ...commands,
];

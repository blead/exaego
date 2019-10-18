const alias = require('./alias');
const extract = require('./extract');
const trigger = require('./trigger');
const iterateCreator = require('./creators/iterate');
const replaceCreator = require('./creators/replace');
const command = require('./command');
const log = require('./log');
const { connectorManager } = require('../../connector');
const { contextManager } = require('../../context');
const { escapeRegex } = require('../../utils/regex');

function getTriggers(message, localContext) {
  const localMessage = localContext.message || {};
  const connector = connectorManager.getConnector(localContext.connectorId);
  const globalContext = contextManager.getContext(localContext.egoId);
  const connectorContext = contextManager.getContext(localContext.connectorId);
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
  alias,
  command,
];

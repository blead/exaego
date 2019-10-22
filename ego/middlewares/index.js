const alias = require('./alias');
const extract = require('./extract');
const getTriggers = require('./get-triggers');
const isTrigger = require('./is-trigger');
const iterateCreator = require('./creators/iterate');
const replaceCreator = require('./creators/replace');
const commands = require('./commands');
const log = require('./log');
const { escapeRegex } = require('../../utils/regex');

module.exports = [
  extract,
  isTrigger,
  // remove triggers
  iterateCreator(getTriggers, replaceCreator, ''),
  // remove self mentions
  iterateCreator(
    ({ connector }) => [new RegExp(escapeRegex(connector.user.self().toString()), 'g')],
    replaceCreator,
    '',
  ),
  log,
  alias,
  ...commands,
];

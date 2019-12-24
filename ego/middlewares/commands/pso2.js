const { getDailyOrders, forecastDailyOrders } = require('../../../utils/pso2-do-forecast');
const { parseDateString } = require('../../../utils/date');

function pso2(message, connector, localContext, connectorContext, globalContext) {
  const localMessage = localContext.message || {};
  const pattern = /(pso2)(?:\s+(.+))*/i;
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
      '`pso2 daily`',
    ].join('\n'));
    return false;
  }
  const arguments = matches[2].split(/\s+/);
  if (arguments[0] === 'daily') {
    if (arguments[1] === 'list') {
      let targetDate = arguments[2] !== undefined ? parseDateString(arguments[2]) : new Date();
      if (!Number.isNaN(targetDate.getTime())) {
        orders = getDailyOrders(targetDate);
        connector.channel.send(channel, orders.join('\n'));
      } else {
        connector.channel.send(channel, 'Invalid date.');
      }
    } else if (arguments[1] === 'when' && arguments[2] !== undefined) {
      results = forecastDailyOrders(arguments[2], new Date());
      if (results.length > 10) {
        connector.channel.send(channel, 'Too many results.');
      } else if (results.length === 0) {
        connector.channel.send(channel, 'No orders found.');
      } else {
        connector.channel.send(channel, results.join('\n'));
      }
    } else {
      connector.channel.send(channel, [
        'Usage:',
        `\`pso2 ${arguments[0]} list\``,
        `\`pso2 ${arguments[0]} when <name>\``,
      ].join('\n'));
    }
  }
  return false;
}

module.exports = pso2;

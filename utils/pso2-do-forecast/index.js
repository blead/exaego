const ORDER_DATA = require('./pso2-do-data.json')
  .map(order => ({ ...order, recordedDate: new Date(order.recordedDate) }));
const MIDNIGHT_JST = 15;
const DAY_MS = 86400000;

function convertDate(date) {
  const convertedDate = new Date(date.getTime());
  if (date.getUTCHours() >= MIDNIGHT_JST) {
    convertedDate.setUTCDate(convertedDate.getUTCDate() + 1);
  }
  convertedDate.setUTCHours(0, 0, 0, 0);
  return convertedDate;
}

function getDateDifference(dateA, dateB) {
  return (dateA.getTime() - dateB.getTime())/DAY_MS;
}

function formatDate(date, format='Y-m-d') {
  return format
    .replace('Y', date.getUTCFullYear().toString())
    .replace('m', (date.getUTCMonth() + 1).toString().padStart(2, '0'))
    .replace('d', date.getUTCDate().toString().padStart(2, '0'));
}

function getDailyOrders(targetDate) {
  const convertedDate = convertDate(targetDate);
  return ORDER_DATA.reduce((results, order) => {
    const cycleDifference = getDateDifference(convertedDate, order.recordedDate) % order.cycleLength;
    if (
      order.intervals
        .reduce((remainder, interval) => remainder === 0 ? 0 : remainder - interval, cycleDifference)
      === 0
    ) {
      return [
        ...results,
        order.name,
      ];
    }
    return results;
  }, []);
}

function forecastDailyOrders(searchString, startingDate) {
  const convertedDate = convertDate(startingDate);
  return ORDER_DATA
    .reduce((results, order) => {
      if (order.name.toLowerCase().includes(searchString)) {
        const cycleDifference = getDateDifference(convertedDate, order.recordedDate) % order.cycleLength;
        const dateOffset = -(order.intervals
          .reduce((remainder, interval) => remainder <= 0 ? remainder : remainder - interval, cycleDifference));
        const forecastDate = new Date(convertedDate.getTime());
        forecastDate.setUTCDate(forecastDate.getUTCDate() + dateOffset);
        return [
          ...results,
          `${formatDate(forecastDate)} ${order.name}`,
        ];
      }
      return results;
    }, [])
    .sort();
}

module.exports = {
  getDailyOrders,
  forecastDailyOrders,
};

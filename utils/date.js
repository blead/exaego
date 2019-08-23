function parseDateString(dateString) {
  const now = new Date();
  if (dateString === 'now' || dateString === 'today') {
    return now;
  }
  if (dateString === 'tomorrow' || dateString === 'tmr') {
    return new Date(now.getTime()).setUTCDate(now.getUTCDate() + 1);
  }
  if (dateString === 'yesterday' || dateString === 'ytd') {
    return new Date(now.getTime()).setUTCDate(now.getUTCDate() - 1);
  }
  return new Date(dateString);
}

module.exports = {
  parseDateString,
};

function parseDateString(dateString) {
  const now = new Date();
  if (dateString === 'now' || dateString === 'today') {
    return now;
  }
  if (dateString === 'tomorrow' || dateString === 'tmr') {
    const tomorrow = new Date(now.getTime());
    tomorrow.setUTCDate(now.getUTCDate() + 1);
    return tomorrow;
  }
  if (dateString === 'yesterday' || dateString === 'ytd') {
    const yesterday = new Date(now.getTime());
    yesterday.setUTCDate(now.getUTCDate() - 1);
    return yesterday;
  }
  return new Date(dateString);
}

module.exports = {
  parseDateString,
};

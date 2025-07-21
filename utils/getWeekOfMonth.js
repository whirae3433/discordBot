function getWeekOfMonth(date = new Date()) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstDay.getDay();
  const adjustedDate = date.getDate() + dayOfWeek;
  return Math.ceil(adjustedDate / 7);
}

module.exports = getWeekOfMonth;

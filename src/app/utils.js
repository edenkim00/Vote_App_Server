function getWeekDateRange(year, month, week) {
  const paddedMonth = month.padStart(2, "0"); // 3 -> 03, 12 -> 12
  let startDate, endDate;
  if (week == "4") {
    startDate = moment(`${year}-${paddedMonth}`)
      .startOf("month")
      .add(week - 1, "week");
    endDate = moment(`${year}-${paddedMonth}`).endOf("month");
  } else {
    startDate = moment(`${year}-${paddedMonth}`)
      .startOf("month")
      .add(week - 1, "week");
    endDate = moment(`${year}-${paddedMonth}`)
      .startOf("month")
      .add(week, "week")
      .subtract(1, "day");
  }
  return {
    startDate: startDate.format("YYYY-MM-DD"),
    endDate: endDate.format("YYYY-MM-DD"),
    dateList: getWeekDateList(startDate, endDate),
  };
}

function getWeekDateList(startDate, endDate) {
  const dateList = [];
  let currentDate = startDate;
  while (currentDate <= endDate) {
    dateList.push(currentDate.format("YYYY-MM-DD"));
    currentDate = currentDate.clone().add(1, "d");
  }
  return dateList;
}
function getGrade(graduationYear) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const diff =
    13 - (graduationYear - currentYear) + (currentMonth >= 8 ? 1 : 0);
  return diff > 9 ? "HS" : "MS";
}

module.exports = {
  getWeekDateRange,
  getWeekDateList,
  getGrade,
};

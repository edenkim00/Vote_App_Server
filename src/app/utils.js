const moment = require("moment");
const DAYS_AVAILABLE = [
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI1",
  "FRI2",
  "SAT1",
  "SAT2",
];

const SPORTS_AVAILABLE = ["BASKETBALL", "BADMINTON", "VOLLEYBALL", "NONE"];
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

function isValidVoteData(year, month, voteData) {
  const today = new Date();
  const todayYear = parseInt(today.getFullYear());
  const todayMonth = parseInt(today.getMonth()) + 1;
  // 6001
  if (!(todayYear <= year && year <= todayYear + 1)) {
    return false;
  }

  // 6002
  if (year == todayYear + 1) {
    if (!(month == 1 && todayMonth == 12)) {
      return false;
    }
  }

  // 6003
  if (month <= todayMonth) {
    return false;
  }

  if (
    !voteData ||
    voteData
      .entries()
      .map(
        ([day, sport]) =>
          DAYS_AVAILABLE.includes(day) && SPORTS_AVAILABLE.includes(sport)
      )
      .some((x) => !x)
  ) {
    return false;
  }
  return true;
}

function isValidDateForVoteResult(year, month) {
  const today = new Date();
  const todayYear = parseInt(today.getFullYear());
  const todayMonth = parseInt(today.getMonth()) + 1;
  if (year > todayYear) {
    return false;
  }
  if (year == todayYear) {
    if (month > todayMonth) {
      return false;
    }
  }
}

function processVoteResult(voteResults) {
  const voteData = Object.fromEntries(
    DAYS_AVAILABLE.map((d) => [
      d,
      Object.entries(SPORTS_AVAILABLE.map((s) => [s, 0])),
    ])
  );
  for (const voteResult of voteResults) {
    const { day, sport, count } = voteResult;
    voteData[day][sport] = count;
  }

  return voteData;
}

module.exports = {
  getWeekDateRange,
  getWeekDateList,
  getGrade,
  isValidVoteData,
  isValidDateForVoteResult,
  processVoteResult,
};

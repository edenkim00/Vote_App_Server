const moment = require("moment");
const DAYS_AVAILABLE = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri1",
  "Fri2",
  "Sat1",
  "Sat2",
];

const SPORTS_AVAILABLE = [
  "Basketball",
  "Badminton",
  "Volleyball",
  "Netball",
  "None",
];
const WEIGHTS_FOR_VOTE_BY_PRIORITY = [3, 2];

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

function isValidVoteData(year, month, voteData, isAdmin) {
  const today = new Date();

  const aWeekLater = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 7
  );
  if (!isAdmin) {
    const cutOffYear = parseInt(aWeekLater.getFullYear());
    const cutoffMonth = parseInt(aWeekLater.getMonth()) + 1;
    // 6001
    if (!(cutOffYear <= year && year <= cutOffYear + 1)) {
      return false;
    }

    // 6002
    if (year == cutOffYear + 1) {
      if (!(month == 1 && cutoffMonth == 12)) {
        return false;
      }
    }

    // 6003
    if (month <= cutoffMonth) {
      return false;
    }
  }
  if (
    !voteData ||
    Object.entries(voteData)
      .map(
        ([day, sports]) =>
          DAYS_AVAILABLE.includes(day) &&
          sports?.length === 2 - (isAdmin ? 1 : 0) &&
          SPORTS_AVAILABLE.includes(sports[0]) &&
          (isAdmin ? true : SPORTS_AVAILABLE.includes(sports[1]))
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
  return true;
}

function processVoteResult(voteResults) {
  const voteData = Object.fromEntries(
    DAYS_AVAILABLE.map((d) => [
      d,
      Object.fromEntries(SPORTS_AVAILABLE.map((s) => [s, 0])),
    ])
  );
  if (!voteResults || !voteResults[0]) {
    return voteData;
  }
  for (const voteResult of voteResults[0]) {
    const { day, sport, vote_counts, priority } = voteResult;
    if (!(day && sport && vote_counts && priority)) {
      console.error("Invalid vote result", voteResults[0]);
      continue;
    }
    voteData[day][sport] +=
      parseInt(vote_counts) * WEIGHTS_FOR_VOTE_BY_PRIORITY[priority - 1];
  }

  return Object.fromEntries(
    Object.entries(voteData).map(([day, data]) => [day, getOrderedResult(data)])
  );
}

function getOrderedResult(result) {
  const entries = Object.entries(result);
  entries.sort((a, b) => b[1] - a[1]);
  return Object.fromEntries(entries.map((e, i) => [i + 1, e[0]]));
}

module.exports = {
  getWeekDateRange,
  getWeekDateList,
  getGrade,
  isValidVoteData,
  isValidDateForVoteResult,
  processVoteResult,
  DAYS_AVAILABLE,
};

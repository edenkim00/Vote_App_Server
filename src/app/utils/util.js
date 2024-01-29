const {
  DAYS_AVAILABLE,
  SPORTS_AVAILABLE,
  WEIGHTS_FOR_VOTE_BY_PRIORITY,
} = require("../lib/constants");

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

function getFullGradeFromGraduationYear(graduationYear) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  return 13 - (graduationYear - currentYear) + (currentMonth >= 8 ? 1 : 0);
}

function getGrade(graduationYear) {
  return getFullGradeFromGraduationYear(graduationYear) > 9 ? "HS" : "MS";
}

function getGrades(grade) {
  if (grade === "HS") {
    return [10, 11, 12, 13];
  } else {
    return [7, 8, 9];
  }
}

function isAdmin(userId) {
  return userId == 1;
}

function isValidConfirmedResult(confirmed) {
  if (!DAYS_AVAILABLE.every((day) => !!confirmed[day])) {
    return false;
  }
  if (
    !Object.values(confirmed).every((sports) =>
      SPORTS_AVAILABLE.includes(sports)
    )
  ) {
    return false;
  }
  return true;
}

function getKSTDateTimeString() {
  const now = new Date();
  const kstNow = now.toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
  });
  // format yyyy-mm-dd
  const splited = kstNow.split("/");
  const year = splited[0].toString();
  const month = splited[1].toString().padStart(2, "0");
  const day = splited[2].split(",")[0].toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

module.exports = {
  getGrade,
  getGrades,
  getFullGradeFromGraduationYear,
  isValidVoteData,
  processVoteResult,
  isAdmin,
  isValidConfirmedResult,
  getKSTDateTimeString,
};

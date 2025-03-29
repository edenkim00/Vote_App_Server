const { DAYS_AVAILABLE, NOT_SELECTED } = require("../lib/constants");

function isValidVoteData(voteData) {
  if (!voteData || !Object.keys(voteData).length) {
    return false;
  }
  for (const day of DAYS_AVAILABLE) {
    if (
      !voteData[day] ||
      !Array.isArray(voteData[day]) ||
      !(voteData[day].length === 2) ||
      (voteData[day][0] !== NOT_SELECTED &&
        voteData[day][0] == voteData[day][1])
    ) {
      return false;
    }
  }
  return true;
}

function getFullGradeFromGraduationYear(graduationYear) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  return 13 - (graduationYear - currentYear) + (currentMonth >= 8 ? 1 : 0);
}

function toGrade(graduationYear) {
  if (!graduationYear) {
    return undefined;
  }
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

function isValidConfirmedResult(confirmed, version = "v2") {
  if (version === "v2") {
    if (
      !DAYS_AVAILABLE.every((day) => !!confirmed[day][0] && !!confirmed[day][1])
    ) {
      return false;
    }

    return true;
  }

  if (!DAYS_AVAILABLE.every((day) => !!confirmed[day])) {
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
  const splited = kstNow.split(".").map((e) => e.trim());
  const year = splited[0].toString();
  const month = splited[1].toString().padStart(2, "0");
  const day = splited[2].split(",")[0].toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const pick = (obj, keys) =>
  keys.reduce((acc, key) => {
    if (obj && obj[key]) acc[key] = obj[key];
    return acc;
  }, {});

module.exports = {
  toGrade,
  getFullGradeFromGraduationYear,
  isValidVoteData,
  isAdmin,
  isValidConfirmedResult,
  getKSTDateTimeString,
  getGrades,
  pick,
};

const { pool } = require("../../config/database");
const Dao = require("./Dao");
const { DAYS_AVAILABLE } = require("./lib/constants");
const { getKSTDateTimeString } = require("./utils/util");
const _ = require("lodash");

async function select(f, params) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const result = await f(connection, params);
    connection.release();
    return result;
  } catch (err) {
    console.error(f, err);
    return;
  }
}

exports.getUserEmail = async function (email) {
  return await select(Dao.getUserByEmail, email);
};

exports.isUserExist = async function (params) {
  return await select(Dao.isUserExist, params);
};

exports.getUserInfo = async function (userId) {
  return await select(Dao.getUserInfo, userId);
};

exports.getGradeYearUser = async function (userId) {
  return await select(Dao.getGradeYearUser, userId);
};

exports.doubleCheckVote = async function (params) {
  return await select(Dao.doubleCheckVote, params);
};

exports.getAdminResult = async function (params) {
  return await select(Dao.getAdminResult, params);
};

exports.voteResult = async function (grade, year, month) {
  const adminResult = await getAdminVoteResult(year, month, grade);
  return adminResult ?? undefined;
};

async function getAdminVoteResult(year, month, grade) {
  try {
    const result = await select(Dao.getAdminVotingResult, [year, month, grade]);

    for (const day of DAYS_AVAILABLE) {
      if (!result.filter((r) => r.day === day).length) {
        return undefined;
      }
    }
    return Object.fromEntries(
      DAYS_AVAILABLE.map((d) => {
        return [
          d,
          { 1: result.filter((r) => r.day === d)[0]?.["sport"], 2: "None" },
        ];
      })
    );
  } catch (err) {
    console.error("[getAdminVoteResult]", err);
    return null;
  }
}

exports.prepareVoteDataForReport = async function (categoryId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const data = await Dao.getReportData(connection, [categoryId]);
    return data;
  } catch (err) {
    console.error("[prepareVoteDataForReport]", err);
  }
};
exports.selectVoteCategory = async function (params) {
  return await select(Dao.selectVoteCategory, params);
};

exports.selectVoteCategoryWithVoteNameAndGrade = async function (params) {
  return await select(Dao.selectVoteCategoryWithVoteNameAndGrade, params);
};

exports.selectVoteCategories = async function (grade, forAdmin = false) {
  if (forAdmin) {
    return await select(Dao.selectVoteCategories, []);
  }
  const now = getKSTDateTimeString();
  return await select(Dao.selectVoteCategories, [grade, now, now]);
};

exports.getConfirmedResult = async function (categoryId) {
  const data = await select(Dao.getConfirmedResult, [categoryId]);
  if (!data) {
    return undefined;
  }
  if (!data.length) {
    return [];
  }

  return Object.fromEntries(
    DAYS_AVAILABLE.map((d) => [
      d,
      data.filter((r) => r.day === d).map((r) => r.sports)[0] ?? undefined,
    ])
  );
};

exports.getConfirmedResult2 = async function (categoryId) {
  const data = await select(Dao.getConfirmedResult, [categoryId]);
  if (!data) {
    return undefined;
  }
  if (!data.length) {
    return [];
  }
  const groupedByDay = _.groupBy(data, "day");
  const daySorted = _.mapValues(groupedByDay, (dayResults) =>
    _.sortBy(
      dayResults.map((r) => ({
        sports: r.sports,
        priority: r.priority,
      })),
      "priority"
    )
  );

  const dayResult = {};
  for (const day of DAYS_AVAILABLE) {
    if (!daySorted[day]) {
      dayResult[day] = {
        1: undefined,
        2: undefined,
      };
    } else {
      dayResult[day] = {
        1: daySorted[day][0]?.sports ?? undefined,
        2: daySorted[day][1]?.sports ?? undefined,
      };
    }
  }

  return dayResult;
};

const { pool } = require("../../config/database");
const Dao = require("./Dao");
const { DAYS_AVAILABLE } = require("./utils");

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

// exports.voteResultForAdmin = async function (grade, year, month) {
//   try {
//     const result = await select(Dao.voteResult, [grade, year, month]);
//     return processVoteResult(result);
//   } catch (err) {
//     console.error(err);
//     return undefined;
//   }
// };

async function getAdminVoteResult(year, month, grade) {
  try {
    const result = await select(Dao.getAdminVotingResult, [year, month, grade]);
    console.log(result);
    console.log(result[0]);
    for (const day of DAYS_AVAILABLE) {
      if (!result.filter((r) => r.day === day).length) {
        return undefined;
      }
    }
    console.log("HERE");
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

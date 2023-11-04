const { pool } = require("../../config/database");
const Dao = require("./Dao");

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

exports.voteResult = async function (params) {
  try {
    const result = await select(Dao.voteResult, params);
    if (!(result && result.length)) {
      return null;
    }
    let votingResult = {};
    for (const item of result[0]) {
      const dateString = item.date.toISOString().split("T")[0];
      if (votingResult[dateString]) {
        if (parseInt(votingResult[dateString].point) < parseInt(item.point)) {
          votingResult[dateString] = {
            point: item.point,
            sports: item.sports,
          };
        }
      } else {
        votingResult[dateString] = {
          point: item.point,
          sports: item.sports,
        };
      }
    }
    return votingResult;
  } catch (err) {
    console.error("[VoteResult]", err);
  }
};

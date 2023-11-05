const { pool } = require("../../config/database");
const Dao = require("./Dao");
const { processVoteResult } = require("./utils");

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
  try {
    const result = await select(Dao.voteResult, [grade, year, month]);
    return processVoteResult(result);
  } catch (err) {
    console.error("[VoteResult]", err);
  }
};

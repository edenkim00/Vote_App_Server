const { pool } = require("../../config/database");
const Dao = require("./Dao");

exports.getUserEmail = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const result = await Dao.getUserByEmail(connection, email);
  connection.release();
  return result;
}

exports.forgotPassword = async function (params) {
  const connection = await pool.getConnection(async (conn) => conn);
  const result = await Dao.forgotPassword(connection, params);
  connection.release();
  return result;
}

exports.isUserExist = async function (params) {
  const connection = await pool.getConnection(async (conn) => conn);
  const result = await Dao.isUserExist(connection, params);
  connection.release();
  return result;
}

exports.getUserInfo = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const result = await Dao.getUserInfo(connection, userId);
  connection.release();
  return result;
}

exports.getGradeYearUser = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const result = await Dao.getGradeYearUser(connection, userId);
  connection.release();
  return result;
}

exports.doubleCheckVote = async function (params) {
  const connection = await pool.getConnection(async (conn) => conn);
  const result = await Dao.doubleCheckVote(connection, params);
  connection.release();
  return result;
}

exports.voteResult = async function (params, dateList) {
  const connection = await pool.getConnection(async (conn) => conn);
  const [result] = (await Dao.voteResult(connection, params));
  const voteResult = {};
  for (const date of dateList) {
    voteResult[date] = {
      basketball: 0,
      volleyball: 0,
      badminton: 0,
    }
  }

  for (const row of result) {
    if (!(voteResult[row.date] && voteResult[row.date][row.sports])) {
      continue;
    }
    voteResult[row.date][row.sports] = row.point;
  }
  connection.release();

  return voteResult;
}
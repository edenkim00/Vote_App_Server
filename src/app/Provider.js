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

exports.voteResult = async function (params) {
  const connection = await pool.getConnection(async (conn) => conn);
  const result = await Dao.voteResult(connection, params);
  if (!(result && result.length)) {
    return null;
  }
  let votingResult = {};
  for (const item of result[0]) {
    const dateString = item.date.toISOString().split('T')[0];
    if (votingResult[dateString]) {
      if (parseInt(votingResult[dateString].point) < parseInt(item.point)) {
        votingResult[dateString] = {
          point: item.point,
          sports: item.sports,
        }
      }
    }
    else {
      votingResult[dateString] = {
        point: item.point,
        sports: item.sports,
      }
    }
    console.log(votingResult)
    console.dir(votingResult)
  }
  connection.release();
  return votingResult;
}

exports.getAdminResult = async function (params) {
  const connection = await pool.getConnection(async (conn) => conn);
  const result = await Dao.getAdminResult(connection, params);
  connection.release();
  return result;
}
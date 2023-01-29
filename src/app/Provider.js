const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");

const Dao = require("./Dao");

// Provider: Read 비즈니스 로직 처리

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
  const [result] = (await Dao.voteResult(connection, params));

  let basketballCount = 0, badmintonCount = 0, volleyballCount = 0;
  let todaySports;
  for (const row of result) {
    if (row.sports == 'Badminton') {
      badmintonCount = row.count;
    }
    else if (row.sports == 'Basketball') {
      basketballCount = row.count;
    }
    else if (row.sports == 'Volleyball') {
      volleyballCount = row.count;
    }
  }
  if (volleyballCount >= basketballCount && volleyballCount >= badmintonCount) {
    todaySports = "Volleyball";
  }
  else if (basketballCount >= badmintonCount) {
    todaySports = "Basketball";
  }
  else {
    todaySports = "Badminton";
  }
  connection.release();
  return todaySports
}
const { pool } = require("../../config/database");
const Dao = require("./Dao");

exports.postUser = async function (params) {
  // params = [email, encodedPassword, name, graduationYear, votingWeight]
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    await Dao.postUser(connection, params);
    connection.release();
    return true;
  } catch (err) {
    console.error("[PostUser]", err);
  }
  return false;
};

exports.changePassword = async function (params) {
  // params : [email, newEncodedPassword]
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    await Dao.changePassword(connection, params);
    connection.release();
  } catch (err) {
    console.error("[ChangePassword]", err);
  }
  return false;
};

exports.vote = async function (userId, grade, voteData, year, month, edit) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    await Dao.vote(connection, userId, grade, voteData, year, month, edit);
    connection.release();
    return true;
  } catch (err) {
    console.error("[Vote]", err);
  }
  return false;
};

const { pool } = require("../../config/database");
const Dao = require("./Dao");

exports.postUser = async function (params) {
  // params = [email, encodedPassword, name, graduationYear, votingWeight]
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    connection.beginTransaction();
    await Dao.postUser(connection, params);
    connection.commit();
    return true;
  } catch (err) {
    connection.rollback();
    console.error("[PostUser]", err);
  } finally {
    connection.release();
  }
  return false;
};

exports.changePassword = async function (params) {
  // params : [email, newEncodedPassword]
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    connection.beginTransaction();
    await Dao.changePassword(connection, params);
    connection.commit();
  } catch (err) {
    connection.rollback();
    console.error("[ChangePassword]", err);
  } finally {
    connection.release();
  }
  return false;
};

exports.vote = async function (
  userId,
  grade,
  voteData,
  year,
  month,
  edit,
  isAdmin
) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    connection.beginTransaction();
    const indexList = isAdmin ? [1] : [1, 2];
    await Promise.all(
      indexList.map((priority) =>
        Dao.vote(
          connection,
          userId,
          grade,
          _filterVoteDataWithPriority(voteData, priority),
          year,
          month,
          priority,
          edit,
          isAdmin
        )
      )
    );
    connection.commit();
    return true;
  } catch (err) {
    connection.rollback();
    console.error("[Vote]", err);
  } finally {
    connection.release();
  }
  return false;
};

function _filterVoteDataWithPriority(voteData, priority) {
  return Object.fromEntries(
    Object.entries(voteData).map(([day, sports]) => [day, sports[priority - 1]])
  );
}



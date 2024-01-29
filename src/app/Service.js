const { pool } = require("../../config/database");
const Dao = require("./Dao");

exports.postUser = async function (params) {
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

exports.deleteAccount = async function (params) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    connection.beginTransaction();
    await Dao.deleteAccount(connection, params);
    connection.commit();
  } catch (err) {
    connection.rollback();
    console.error("[DeleteAccount]", err);
  } finally {
    connection.release();
  }
  return false;
};

exports.changePassword = async function (params) {
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

exports.confirm = async function (
  categoryId,
  grade,
  confirmedData,
  force = false
) {
  const toValues = (entry) =>
    `(${categoryId}, '${grade}', '${entry[0]}', '${entry[1]}')`;

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    connection.beginTransaction();
    if (force) {
      await Dao.deleteConfirmedData(connection, [categoryId, grade]);
    }

    const valuesClause = Object.entries(confirmedData).map(toValues).join(", ");
    await Dao.confirm(connection, valuesClause);

    connection.commit();
    return true;
  } catch (err) {
    connection.rollback();
    console.error("[Confirm]", err);
  } finally {
    connection.release();
  }
};

exports.postVoteCategory = async function (params) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    connection.beginTransaction();
    await Dao.postVoteCategory(connection, params);
    connection.commit();
    return true;
  } catch (err) {
    connection.rollback();
    console.error("[PostVoteCategory]", err);
  } finally {
    connection.release();
  }
  return false;
};

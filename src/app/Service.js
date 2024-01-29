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

exports.vote = async function (userId, categoryId, voteData, force = false) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const toValues = ([day, sports]) =>
      `(${userId}, '${day}', '${sports[0]}', ${categoryId}, 1), (${userId}, '${day}', '${sports[1]}', ${categoryId}, 2)`;
    connection.beginTransaction();
    const valuesClause = Object.entries(voteData).map(toValues).join(", ");
    if (force) {
      await Dao.deleteVotes(connection, [userId, categoryId]);
    }
    await Dao.vote(connection, valuesClause);
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

exports.confirm = async function (categoryId, confirmedData, force = false) {
  const toValues = (entry) => `(${categoryId}, '${entry[0]}', '${entry[1]}')`;
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    connection.beginTransaction();
    if (force) {
      await Dao.deleteConfirmedData(connection, [categoryId]);
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

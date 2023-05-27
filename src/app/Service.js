const { pool } = require("../../config/database");
const secret_config = require("../../config/secret");
const Provider = require("./Provider");
const Dao = require("./Dao");
// Service: Create, Update, Delete 비즈니스 로직 처리

exports.postUser = async function (params) {
    // params = [email, encodedPassword, name, graduationYear]
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const result = await Dao.postUser(connection, params);
        connection.release();
        return true
    } catch (err) {
        console.error('[PostUser]', err)
    }
    return false;
};

exports.changePassword = async function (params) {
    // params : [email, newEncodedPassword]
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const result = await Dao.changePassword(connection, params);
        connection.release();
    } catch (err) {
        console.error('[ChangePassword]', err)
    }
    return false;
}

exports.vote = async function (params) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const result = await Dao.vote(connection, params);
        connection.release();
        return true;
    } catch (err) {
        console.error('[Vote]', err)
    }
    return false;
}

exports.voteChange = async function (params) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const result = await Dao.voteChange(connection, params);
        connection.release();
        return true;
    } catch (err) {
        console.error('[VoteChange]', err)
    }
    return false;
}

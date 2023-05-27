const { pool } = require("../../config/database");
const Dao = require("./Dao");

exports.postUser = async function (params) {
    // params = [email, encodedPassword, name, graduationYear]
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        await Dao.postUser(connection, params);
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
        await Dao.changePassword(connection, params);
        connection.release();
    } catch (err) {
        console.error('[ChangePassword]', err)
    }
    return false;
}

exports.vote = async function (params) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        await Dao.vote(connection, params);
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
        await Dao.voteChange(connection, params);
        connection.release();
        return true;
    } catch (err) {
        console.error('[VoteChange]', err)
    }
    return false;
}

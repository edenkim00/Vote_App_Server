const { pool } = require("../../config/database");
const { getWeekDateRange } = require("../utils");
const Dao = require("./Dao");

exports.postUser = async function (params) {
    // params = [email, encodedPassword, name, graduationYear, votingWeight]
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
    // const params = [userId, grade, voteData, votingWeight, year, month, week];
    const votes = _caculateVotePoint(params[3], params[2]);
    console.log(votes)
    const paramsList = votes.map(vote => [params[0], vote.sports, vote.date, params[1], vote.userPoint, vote.pickPoint, vote.totalPoint]);
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        await Dao.vote(connection, paramsList);
        connection.release();
        return true;
    } catch (err) {
        console.error('[Vote]', err)
    }
    return false;
}

exports.voteDelete = async function (userId, year, month, week) {
    // const params = [userId, grade, voteData, votingWeight, year, month, week];
    const deleteDate = getWeekDateRange(year, month, week);
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        await Dao.voteDelete(connection, [userId, deleteDate.startDate, deleteDate.endDate]);
        connection.release();
        return true;
    } catch (err) {
        console.error('[voteDelete]', err)
    }
    return false;
}


function _caculateVotePoint(voteWeight, voteData) {
    const result = []
    const dateList = Object.keys(voteData)
    const voteDataValues = Object.values(voteData);

    for (let i = 0; i < dateList.length; i++) {
        const currentDate = dateList[i];
        const currentVoteData = voteDataValues[i];
        for (let j = 0; j < 3; j++) {
            result.push({
                date: currentDate,
                sports: currentVoteData[String(j + 1)],
                userPoint: voteWeight,
                pickPoint: j + 1,
                totalPoint: voteWeight * (j + 1),
            })
        }
    }
    return result;
}
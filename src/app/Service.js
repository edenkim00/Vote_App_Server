const {logger} = require("../../config/winston");
const {pool} = require("../../config/database");
const secret_config = require("../../config/secret");
const Provider = require("./Provider");
const Dao = require("./Dao");
const baseResponse = require("../../config/baseResponseStatus");
const {response} = require("../../config/response");
const {errResponse} = require("../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.postUser = async function (params) {
    // params = [email, encodedPassword, name, graduationYear]

    const connection = await pool.getConnection(async (conn) => conn);
    const result = await Dao.postUser(connection, params);
    connection.release();
    return;
   
};

exports.changePassword = async function(params){
    // params : [email, newEncodedPassword]
    const connection = await pool.getConnection(async (conn) => conn);
    const result = await Dao.changePassword(connection, params);
    connection.release();
    return;
}

exports.vote = async function(params){
    const connection = await pool.getConnection(async (conn) => conn);
    const result = await Dao.vote(connection, params);
    connection.release();
    return;
}



// TODO: After 로그인 인증 방법 (JWT)
exports.postSignIn = async function (email, password, isHashed) {
    try {
        // 이메일 여부 확인
        const emailRows = await userProvider.emailCheck(email);
        if (emailRows.length < 1) return errResponse(baseResponse.SIGNIN_EMAIL_WRONG);

        const selectEmail = emailRows[0].email

        // 비밀번호 확인
        if (!isHashed) {
            var hashedPassword = await crypto
                .createHash("sha512")
                .update(password)
                .digest("hex");
        }
        else var hashedPassword= password;
        const selectUserPasswordParams = [selectEmail, hashedPassword];
        const passwordRows = await userProvider.passwordCheck(selectUserPasswordParams);

        if (passwordRows[0].password !== hashedPassword) {
            return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
        }

        // 계정 상태 확인
        const userInfoRows = await userProvider.accountCheck(email);

        if (userInfoRows[0].status === "INACTIVE") {
            return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        } else if (userInfoRows[0].status === "DELETED") {
            return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        }

        console.log(userInfoRows[0].id) // DB의 userId

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userId: userInfoRows[0].id,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, {'userId': userInfoRows[0].id, 'jwt': token});

    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.editUser = async function (id, nickname, password, phoneNumber) {

        console.log("변경유저id: ", id);
        const connection = await pool.getConnection(async (conn) => conn);
        try {
            connection.beginTransaction();
            if(nickname) {
                const editUserResult = await userDao.updateUserInfo(connection, id, nickname);
            }
            if(password) {
                const hashedPassword = await crypto
                    .createHash("sha512")
                    .update(password)
                    .digest("hex");
                const result = await userDao.updateUserPassword(connection, id, hashedPassword);
            }
            if(phoneNumber) {
                const result2 = await userDao.updateUserPhoneNumber(connection, id, phoneNumber);
            }
            connection.commit();
            return response(baseResponse.SUCCESS);
        } catch (err) {
            connection.rollback();
            logger.error(`App - editUser Service error\n: ${err.message}`);
            return errResponse(baseResponse.DB_ERROR);
        } finally {
            connection.release();
        }
}

exports.deleteUser = async function (id) {
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        console.log("삭제유저id: ", id);
        const editUserResult = await userDao.deleteUser(connection, id);
        connection.commit();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - deleteUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}
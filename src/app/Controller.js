const jwtMiddleware = require("../../config/jwtMiddleware");
const Provider = require("../app/Provider");
const Service = require("../app/Service");
const baseResponse = require("../../config/baseResponseStatus");
const { response, errResponse } = require("../../config/response");
const regexEmail = require("regex-email");
const hmacSHA512 = require('crypto-js/hmac-sha512');
const jwt = require("jsonwebtoken");
const secret_config = require("../../config/secret");

var CryptoJS = require("crypto-js");
var SHA256 = require("crypto-js/sha256");
var Base64 = require("crypto-js/enc-base64");
const e = require("express");

const getGrade = (graduationYear) => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1;
    const diff = 13 - (graduationYear - currentYear) +
        (currentMonth >= 8 ? 1 : 0);
    return diff > 9 ? "HS" : "MS";
}

// 회원가입
exports.postUser = async function (req, res) {
    console.log("??")

    const { email, password, name, graduationYear } = req.body;

    // validation
    // 1001 : body에 빈값있음.
    if (email == null || password == null || name == null || graduationYear == null) {
        return res.send(errResponse(baseResponse.WRONG_BODY));
    }

    // 1002 : 이메일 검증
    const regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    if (!regex.test(email)) {
        return res.send(errResponse(baseResponse.WRONG_EMAIL));
    }

    // 1003 : 비밀번호 길이 문제
    if (password.length < 4 || password.length > 12) {
        return res.send(errResponse(baseResponse.WRONG_PASSWORD_LENGTH));
    }

    // 1004 : 중복확인
    const doubleCheck = await Provider.getUserEmail(email);
    if (doubleCheck.length > 0) {
        return res.send(errResponse(baseResponse.ALREADY_EXIST_EMAIL));
    }

    // password 암호화
    const encoedPassword = Base64.stringify(hmacSHA512(password, 'hojin-sportshall'))

    const queryParams = [email, encoedPassword, name, graduationYear];
    const result = await Service.postUser(queryParams);
    return res.send(response(baseResponse.SUCCESS));
};

exports.forgotPassword = async function (req, res) {
    const email = req.query.email
    const graduationYear = req.query.graduationYear
    const name = req.query.name

    // validation
    // 1. 빈값이 있는지 확인
    if (email == null || name == null || graduationYear == null) {
        return res.send(errResponse(baseResponse.WRONG_QUERY_STRING));
    }

    // 2. 이메일 형식이 맞는지
    const regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    if (!regex.test(email)) {
        return res.send(errResponse(baseResponse.WRONG_EMAIL));
    }

    const result = await Provider.forgotPassword([email, graduationYear, name]);
    // [{id : 11}] or []
    const isExistedUser = result.length > 0; // true false
    return res.send(response(baseResponse.SUCCESS, isExistedUser))
}

exports.changePassword = async function (req, res) {
    const { email, newPassword } = req.body;

    // 1001 : body에 빈값있음.
    if (!email || !newPassword) {
        return res.send(errResponse(baseResponse.WRONG_BODY));
    }

    // 1003 : 비밀번호 길이 
    if (newPassword.length < 4 || newPassword.length > 12) {
        return res.send(errResponse(baseResponse.WRONG_PASSWORD_LENGTH));
    }

    // 비밀번호 암호화
    const encoedPassword = Base64.stringify(hmacSHA512(newPassword, 'hojin-sportshall'))

    const result = await Service.changePassword([
        encoedPassword, email
    ]);
    return res.send(response(baseResponse.SUCCESS));
}

exports.signIn = async function (req, res) {
    const { email, password } = req.body;

    // 1001 : 바디에 빈 값이 있음.
    if (email == null || password == null) {
        return res.send(errResponse(baseResponse.WRONG_BODY));
    }

    // db에는 암호화된 형식으로 저장되어 있기 때문에 password 암호화해서! 물어봐야됨.
    const encoedPassword = Base64.stringify(hmacSHA512(password, 'hojin-sportshall'))

    const loginResult = await Provider.isUserExist([
        email,
        encoedPassword,
    ]);

    if (loginResult.length == 0) {
        return res.send(errResponse(baseResponse.NOT_EXIST_USER));
    }

    const userId = loginResult[0].id;
    const token = await jwt.sign(
        {
            userId: userId,
        }, // 토큰의 내용(payload)
        secret_config.jwtsecret, // 비밀키
        {
            expiresIn: "365d",
            subject: "userInfo",
        } // 유효 기간 365일
    );

    const result = {
        "userId": userId,
        "jwtToken": token,
    }
    return res.send(response(baseResponse.SUCCESS, result));
}

exports.mypageInfo = async function (req, res) {
    const userId = req.verifiedToken.userId;

    // 4001
    if (!userId) {
        return res.send(errResponse(baseResponse.TOKEN_ERROR));
    }

    const userInfo = await Provider.getUserInfo(userId);
    const { name, graduationYear } = userInfo[0]

    const grade = getGrade(graduationYear);
    const result = {
        "name": name,
        "grade": grade,
    }
    return res.send(response(baseResponse.SUCCESS, result));
}

exports.vote = async function (req, res) {
    const userId = req.verifiedToken.userId;
    // 4001
    if (userId == null) {
        return res.send(errResponse(baseResponse.TOKEN_ERROR));
    }

    const { date, sports } = req.body
    // 1001
    if (date == null || sports == null) {
        return res.send(errResponse(baseResponse.WRONG_BODY));
    }

    // 5001 
    const doubleCheckResult = await Provider.doubleCheckVote([userId, date]);
    if (doubleCheckResult.length > 0) {
        return res.send(errResponse(baseResponse.ALREADY_EXIST_VOTE));
    }

    const gradeYear = await Provider.getGradeYearUser(userId);
    if (gradeYear.length == 0) {
        // 3001
        return res.send(errResponse(baseResponse.NOT_EXIST_USER));
    }
    const grade = getGrade(gradeYear[0]); // HS or MS
    const params = [userId, sports, date, grade];

    const result = await Service.vote(params);
    return res.send(response(baseResponse.SUCCESS));
}

exports.voteResult = async function (req, res) {
    const { date, grade } = req.query
    // 2001
    if (date == null || grade == null) {
        return res.send(errResponse(baseResponse.WRONG_QUERY_STRING));
    }
    const currentDate = new Date()
    const requestDate = new Date(date)
    // 6001
    if (requestDate > currentDate) {
        return res.send(errResponse(baseResponse.DATE_ERROR));
    }
    // 1/8 homework : TODO => 쿼리 한번만 써서 가장 투표수 많은 종목 알아내는 방식으로 고쳐오기!

    const result = await Provider.voteResult([date, grade]);
    const maxResult = {
        "date": date,
        "voteResult": result
    }
    return res.send(response(baseResponse.SUCCESS, maxResult));
}
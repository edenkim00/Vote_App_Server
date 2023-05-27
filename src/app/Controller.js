const Provider = require("../app/Provider");
const Service = require("../app/Service");
const baseResponse = require("../../config/baseResponseStatus");
const { response, errResponse } = require("../../config/response");
const hmacSHA512 = require('crypto-js/hmac-sha512');
const jwt = require("jsonwebtoken");
const secret_config = require("../../config/secret");
const nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var Base64 = require("crypto-js/enc-base64");
require("dotenv").config();

const getGrade = (graduationYear) => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1;
    const diff = 13 - (graduationYear - currentYear) +
        (currentMonth >= 8 ? 1 : 0);
    return diff > 9 ? "HS" : "MS";
}

// 회원가입
exports.postUser = async function (data, verifiedToken) {
    const { email, password, name, graduationYear } = data;
    // validation
    // 1001 : body에 빈값있음.
    if (email == null || password == null || name == null || graduationYear == null) {
        return errResponse(baseResponse.WRONG_BODY);
    }

    // 1002 : 이메일 검증
    const regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    if (!regex.test(email)) {
        return errResponse(baseResponse.WRONG_EMAIL);
    }

    // 1003 : 비밀번호 길이 문제
    if (password.length < 4 || password.length > 12) {
        return errResponse(baseResponse.WRONG_PASSWORD_LENGTH);
    }

    // 1004 : 중복확인
    const doubleCheck = await Provider.getUserEmail(email);
    if (doubleCheck.length > 0) {
        return errResponse(baseResponse.ALREADY_EXIST_EMAIL);
    }

    // password 암호화
    const encoedPassword = Base64.stringify(hmacSHA512(password, process.env.PASSWORD_HASHING_NAMESPACE))

    const queryParams = [email, encoedPassword, name, graduationYear];
    await Service.postUser(queryParams);
    return response(baseResponse.SUCCESS);
};

exports.forgotPassword = async function (data, verifiedToken) {
    const email = data.email
    const graduationYear = data.graduationYear
    const name = data.name

    // validation
    // 1. 빈값이 있는지 확인
    if (email == null || name == null || graduationYear == null) {
        return errResponse(baseResponse.WRONG_QUERY_STRING);
    }

    // 2. 이메일 형식이 맞는지
    const regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    if (!regex.test(email)) {
        return errResponse(baseResponse.WRONG_EMAIL);
    }

    const result = await Provider.forgotPassword([email, graduationYear, name]);
    // [{id : 11}] or []
    const isExistedUser = result.length > 0; // true false
    return response(baseResponse.SUCCESS, isExistedUser)
}

exports.changePassword = async function (data, verifiedToken) {
    const { email, newPassword } = data;

    // 1001 : body에 빈값있음.
    if (!email || !newPassword) {
        return errResponse(baseResponse.WRONG_BODY);
    }

    // 1003 : 비밀번호 길이 
    if (newPassword.length < 4 || newPassword.length > 12) {
        return errResponse(baseResponse.WRONG_PASSWORD_LENGTH);
    }

    // 비밀번호 암호화
    const encoedPassword = Base64.stringify(hmacSHA512(newPassword, 'hojin-sportshall'))

    const result = await Service.changePassword([
        encoedPassword, email
    ]);
    return response(baseResponse.SUCCESS);
}

exports.signIn = async function (data, verifiedToken) {
    const { email, password } = data;

    // 1001 : 바디에 빈 값이 있음.
    if (email == null || password == null) {
        return errResponse(baseResponse.WRONG_BODY);
    }

    // db에는 암호화된 형식으로 저장되어 있기 때문에 password 암호화해서! 물어봐야됨.
    const encoedPassword = Base64.stringify(hmacSHA512(password, 'hojin-sportshall'))

    const loginResult = await Provider.isUserExist([
        email,
        encoedPassword,
    ]);

    if (loginResult.length == 0) {
        return errResponse(baseResponse.NOT_EXIST_USER);
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
    return response(baseResponse.SUCCESS, result);
}

exports.mypageInfo = async function (data, verifiedToken) {
    const userId = verifiedToken.userId;
    // 4001
    if (!userId) {
        return errResponse(baseResponse.TOKEN_ERROR);
    }

    const userInfo = await Provider.getUserInfo(userId);
    const { name, graduationYear } = userInfo[0]

    const grade = getGrade(graduationYear);
    const result = {
        "name": name,
        "grade": grade,
    }
    return response(baseResponse.SUCCESS, result);
}

exports.vote = async function (data, verifiedToken) {
    const userId = verifiedToken.userId;
    // 4001
    if (userId == null) {
        return errResponse(baseResponse.TOKEN_ERROR);
    }

    const { date, sports } = data
    // 1001
    if (date == null || sports == null) {
        return errResponse(baseResponse.WRONG_BODY);
    }

    // 5001 
    const doubleCheckResult = await Provider.doubleCheckVote([userId, date]);
    if (doubleCheckResult.length > 0) {
        return errResponse(baseResponse.ALREADY_EXIST_VOTE);
    }

    const gradeYear = await Provider.getGradeYearUser(userId);
    if (gradeYear.length == 0) {
        // 3001
        return errResponse(baseResponse.NOT_EXIST_USER);
    }
    const grade = getGrade(gradeYear[0]); // HS or MS
    const params = [userId, sports, date, grade];

    const result = await Service.vote(params);
    return response(baseResponse.SUCCESS);
}

exports.voteChange = async function (data, verifiedToken) {
    const userId = verifiedToken.userId;
    // 4001
    if (userId == null) {
        return errResponse(baseResponse.TOKEN_ERROR);
    }

    const { date, sports } = data
    // 1001
    if (date == null || sports == null) {
        return errResponse(baseResponse.WRONG_BODY);
    }

    const gradeYear = await Provider.getGradeYearUser(userId);
    if (gradeYear.length == 0) {
        // 3001
        return errResponse(baseResponse.NOT_EXIST_USER);
    }
    const grade = getGrade(gradeYear[0]); // HS or MS
    const params = [sports, userId, date, grade];
    const result = await Service.voteChange(params);
    return response(baseResponse.SUCCESS);
}

exports.voteResult = async function (data, verifiedToken) {
    const { date, grade } = data
    // 2001
    if (date == null || grade == null) {
        return errResponse(baseResponse.WRONG_QUERY_STRING);
    }
    const currentDate = new Date()
    const requestDate = new Date(date)
    // 6001
    if (requestDate > currentDate) {
        return errResponse(baseResponse.DATE_ERROR);
    }

    const result = await Provider.voteResult([grade, date]);
    const maxResult = {
        "date": date,
        "voteResult": result.sports,
        "count": result.count
    }
    return response(baseResponse.SUCCESS, maxResult);
}

exports.sendEmail = async function (data, verifiedToken) {
    const email = data.email;
    let authNum = Math.random().toString().substr(2, 6);
    // 7001
    if (email == null || email == '') return response(baseResponse.EMAILEMPTY);
    const mailPoster = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        auth: {
            user: 'nlcsjejusportshall@gmail.com',
            pass: process.env.EMAIL_AUTH_PASSWORD,

        },

    }));

    const mailOptions = {
        from: 'nlcsjejusportshall@gmail.com',
        to: email,
        subject: '[NLCS-JEJU-Sportshall] 이메일 인증번호를 안내해드립니다.',
        text: '인증번호는 ' + authNum + ' 입니다.'
    };

    const sendMail = (mailOption) => {
        mailPoster.sendMail(mailOption, function (error, info) {
            if (error) {
                //7002
                return errResponse(baseResponse.EMAIL_SEND_ERROR)
            }
            else {
                return response(baseResponse.SUCCESS, { "code": authNum });
            }
        })
    };
    sendMail(mailOptions)
}

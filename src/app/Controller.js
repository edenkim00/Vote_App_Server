const Provider = require("../app/Provider");
const Service = require("../app/Service");
const baseResponse = require("../../config/baseResponseStatus");
const { response, errResponse } = require("../../config/response");
const hmacSHA512 = require('crypto-js/hmac-sha512');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var Base64 = require("crypto-js/enc-base64");
require("dotenv").config();
const { getWeekDateRange } = require('../utils');

function getGrade(graduationYear) {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1;
    const diff = 13 - (graduationYear - currentYear) +
        (currentMonth >= 8 ? 1 : 0);
    return diff > 9 ? "HS" : "MS";
}

// 회원가입
exports.postUser = async function (data, verifiedToken) {
    const { email, password, name, graduationYear, votingWeight } = data;

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

    // 1006: votingWeight은 4~8 사이의 정수
    if (votingWeight < 4 || votingWeight > 8) {
        return errResponse(baseResponse.WRONG_VOTING_WEIGHT);
    }

    // password 암호화
    const encoedPassword = Base64.stringify(hmacSHA512(password, process.env.PASSWORD_HASHING_NAMESPACE))

    const queryParams = [email, encoedPassword, name, graduationYear, votingWeight];
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
    const encoedPassword = Base64.stringify(hmacSHA512(password, process.env.PASSWORD_HASHING_NAMESPACE))

    const loginResult = await Provider.isUserExist([
        email,
        encoedPassword,
    ]);

    if (loginResult.length == 0) {
        return errResponse(baseResponse.NOT_EXIST_USER);
    }
    if (!(loginResult[0]?.id && loginResult[0]?.votingWeight)) {
        return errResponse(baseResponse.NOT_EXIST_USER);
    }
    const userId = loginResult[0].id;
    const votingWeight = loginResult[0].votingWeight;
    const token = await jwt.sign(
        {
            userId: userId,
        }, // 토큰의 내용(payload)
        process.env.JWT_SECRET, // 비밀키
        {
            expiresIn: "365d",
            subject: "userInfo",
        } // 유효 기간 365일
    );

    const result = {
        "userId": userId,
        "jwtToken": token,
        "votingWeight": votingWeight,
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

    if (!(voteData && votingWeight && year && month && week)) {
        return errResponse(baseResponse.WRONG_BODY);
    }    /* date: String - "YYYY-MM-DD"
    // voteData: {
        "2023-01-12": {
            1: "basketball",
            2: "badminton",
            3: "volleyball",
        },
        "2023-03-13": {
            1: "basketball",
            2: "volleyball",
            3: "badminton",
        }
        ...
    }
    // votingWeight : Number - 4~8
    */

    // 1001
    if (date == null || voteData == null || votingWeight == null) {
        return errResponse(baseResponse.WRONG_BODY);
    }
    // validate date
    const voteStartAndEndDate = getWeekDateRange(year, month, week);
    // year 2023, month 05, week 4 -> startDate: 2023-05-22, endDate: 2023-05-31
    const dateList = Object.keys(voteData);
    for (let i = 0; i < dateList.length; i++) {
        const date = dateList[i];
        if (date < voteStartAndEndDate.startDate || date > voteStartAndEndDate.endDate) {
            // 8001
            return errResponse(baseResponse.WRONG_VOTE_DATA);
        }
        for (let j = 1; j <= 3; j++) {
            if (!voteData[date][String(j)]) {
                // 8001
                return errResponse(baseResponse.WRONG_VOTE_DATA);
            }
        }
    }

    const today = new Date()
    const todayDate = parseInt(today.getDate());
    const todayWeek = Math.min(((todayDate - 1) / 7) + 1, 4);
    const todayMonth = parseInt(today.getMonth()) + 1;
    const todayYear = parseInt(today.getFullYear());
    if (year <= todayYear) {
        if (year < todayYear) {
            // 8001
            return errResponse(baseResponse.WRONG_VOTE_DATA);
        }
        // year == todayYear
        if (month <= todayMonth) {
            // 8001
            return errResponse(baseResponse.WRONG_VOTE_DATA);
        }
        if (month == (todayMonth + 1) && week <= todayWeek) {
            // 8001
            return errResponse(baseResponse.WRONG_VOTE_DATA);
        }
    }




    // 5001 - TODO: Migration
    const doubleCheckResult = await Provider.doubleCheckVote([userId, dateList[0]]);
    if (doubleCheckResult.length > 0) {
        return errResponse(baseResponse.ALREADY_EXIST_VOTE);
    }

    const gradeYear = await Provider.getGradeYearUser(userId);
    if (gradeYear.length == 0) {
        // 3001
        return errResponse(baseResponse.NOT_EXIST_USER);
    }
    const grade = getGrade(gradeYear[0]); // HS or MS
    const params = [userId, grade, voteData, votingWeight, year, month, week];

    const result = await Service.vote(params);
    return response(baseResponse.SUCCESS);
}

exports.voteChange = async function (data, verifiedToken) {
    const userId = verifiedToken.userId;
    // 4001
    if (userId == null) {
        return errResponse(baseResponse.TOKEN_ERROR);
    }

    const { voteData, votingWeight, year, month, week } = data
    // 1001
    if (!(voteData && votingWeight && year && month && week)) {
        return errResponse(baseResponse.WRONG_BODY);
    }
    // validate date
    const voteStartAndEndDate = getWeekDateRange(year, month, week);
    // year 2023, month 05, week 4 -> startDate: 2023-05-22, endDate: 2023-05-31
    const dateList = Object.keys(voteData);
    for (let i = 0; i < dateList.length; i++) {
        const date = dateList[i];
        if (date < voteStartAndEndDate.startDate || date > voteStartAndEndDate.endDate) {
            // 8001
            return errResponse(baseResponse.WRONG_VOTE_DATA);
        }
        for (let j = 1; j <= 3; j++) {
            if (!voteData[date][String(j)]) {
                // 8001
                return errResponse(baseResponse.WRONG_VOTE_DATA);
            }
        }
    }

    const today = new Date()
    const todayDate = parseInt(today.getDate());
    const todayWeek = Math.min(((todayDate - 1) / 7) + 1, 4);
    const todayMonth = parseInt(today.getMonth()) + 1;
    const todayYear = parseInt(today.getFullYear());
    if (year <= todayYear) {
        if (year < todayYear) {
            // 8001
            return errResponse(baseResponse.WRONG_VOTE_DATA);
        }
        // year == todayYear
        if (month <= todayMonth) {
            // 8001
            return errResponse(baseResponse.WRONG_VOTE_DATA);
        }
        if (month == (todayMonth + 1) && week <= todayWeek) {
            // 8001
            return errResponse(baseResponse.WRONG_VOTE_DATA);
        }
    }

    const gradeYear = await Provider.getGradeYearUser(userId);
    if (gradeYear.length == 0) {
        // 3001
        return errResponse(baseResponse.NOT_EXIST_USER);
    }
    const grade = getGrade(gradeYear[0]); // HS or MS
    const params = [userId, grade, voteData, votingWeight, year, month, week];

    await Service.voteDelete(userId, year, month, week);
    await Service.vote(params);
    return response(baseResponse.SUCCESS);
}

// TODO
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

/* eslint-disable no-undef */
const Provider = require("../Provider");
const Service = require("../Service");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const hmacSHA512 = require("crypto-js/hmac-sha512");
const jwt = require("jsonwebtoken");
var Base64 = require("crypto-js/enc-base64");
const { getGrade } = require("../utils/util");
require("dotenv").config();

exports.postUser = async function (data) {
  const { email, password, name, graduationYear, sex } = data;

  // 1001 : Empty Body
  if (
    email == null ||
    password == null ||
    name == null ||
    graduationYear == null ||
    sex == null
  ) {
    return errResponse(baseResponse.WRONG_BODY);
  }

  // 1002 : Email Validation
  const regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
  if (!regex.test(email)) {
    return errResponse(baseResponse.WRONG_EMAIL);
  }

  // 1003 : Wrong Password Length
  if (password.length < 4 || password.length > 12) {
    return errResponse(baseResponse.WRONG_PASSWORD_LENGTH);
  }

  // 1004 : Already Exist Email
  const doubleCheck = await Provider.getUserEmail(email);
  if (doubleCheck.length > 0) {
    return errResponse(baseResponse.ALREADY_EXIST_EMAIL);
  }

  // password encryption
  const encodedPassword = Base64.stringify(
    hmacSHA512(password, process.env.PASSWORD_HASHING_NAMESPACE)
  );

  const queryParams = [email, encodedPassword, name, graduationYear, sex];
  await Service.postUser(queryParams);
  return response(baseResponse.SUCCESS);
};

exports.changePassword = async function (data) {
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
  const encoedPassword = Base64.stringify(
    hmacSHA512(newPassword, process.env.PASSWORD_HASHING_NAMESPACE)
  );

  await Service.changePassword([encoedPassword, email]);
  return response(baseResponse.SUCCESS);
};

exports.signIn = async function (data) {
  const { email, password } = data;

  // 1001 : 바디에 빈 값이 있음.
  if (email == null || password == null) {
    return errResponse(baseResponse.WRONG_BODY);
  }

  // db에는 암호화된 형식으로 저장되어 있기 때문에 password 암호화해서! 물어봐야됨.
  const encodedPassword = Base64.stringify(
    hmacSHA512(password, process.env.PASSWORD_HASHING_NAMESPACE)
  );
  const loginResult = await Provider.isUserExist([email, encodedPassword]);

  if (loginResult.length == 0) {
    return errResponse(baseResponse.NOT_EXIST_USER);
  }

  if (!(loginResult[0]?.id && loginResult[0]?.graduationYear)) {
    return errResponse(baseResponse.NOT_EXIST_USER);
  }
  const userId = loginResult[0].id;
  const graduationYear = loginResult[0].graduationYear;
  const token = jwt.sign(
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
    userId: userId,
    jwtToken: token,
    graduationYear: graduationYear,
  };
  return response(baseResponse.SUCCESS, result);
};

exports.userInfo = async function (_, verifiedToken) {
  const userId = verifiedToken.userId;
  // 4001
  if (!userId) {
    return errResponse(baseResponse.TOKEN_ERROR);
  }

  const userInfo = await Provider.getUserInfo(userId);
  const { name, graduationYear, sex } = userInfo[0];

  const grade = getGrade(graduationYear);
  const result = {
    userId,
    name,
    grade,
    graduationYear,
    sex,
  };
  return response(baseResponse.SUCCESS, result);
};

exports.deleteAccount = async function (_, verifiedToken) {
  const userId = verifiedToken.userId;
  const res = await Service.deleteAccount(userId);
  if (!res) {
    return errResponse(baseResponse.WRONG_BODY);
  }
  return response(baseResponse.SUCCESS);
};

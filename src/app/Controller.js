/* eslint-disable no-undef */
const Provider = require("../app/Provider");
const Service = require("../app/Service");
const baseResponse = require("../../config/baseResponseStatus");
const { response, errResponse } = require("../../config/response");
const hmacSHA512 = require("crypto-js/hmac-sha512");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var Base64 = require("crypto-js/enc-base64");
const fs = require("fs");
const path = require("path");
const csvFilePath = (grade) => path.join("/tmp", `data_${grade}.csv`);
const {
  getGrade,
  isValidVoteData,
  isValidDateForVoteResult,
} = require("./utils/util");
const CSVGenerator = require("./utils/CsvGenerator");
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

exports.vote = async function (data, verifiedToken) {
  const userId = verifiedToken.userId;
  // 4001
  if (userId == null) {
    return errResponse(baseResponse.TOKEN_ERROR);
  }

  const isAdmin = userId === 1;
  const { voteData, year, month, graduationYear, edit, gradeSelectedByAdmin } =
    data;
  // 1001
  if (!(userId && voteData && year && month && graduationYear)) {
    return errResponse(baseResponse.WRONG_BODY);
  }
  if (isAdmin && !gradeSelectedByAdmin) {
    return errResponse(baseResponse.WRONG_BODY);
  }
  if (!isValidVoteData(year, month, voteData, isAdmin)) {
    return errResponse(baseResponse.INVALID_VOTE_DATA);
  }

  if (!edit) {
    const doubleCheckResult = await Provider.doubleCheckVote([
      userId,
      year,
      month,
    ]);
    if (doubleCheckResult.length > 0) {
      return errResponse(baseResponse.ALREADY_EXIST_VOTE);
    }
  }

  const grade = isAdmin
    ? gradeSelectedByAdmin
    : getGrade(parseInt(graduationYear)); // HS or MS

  const result = await Service.vote(
    userId,
    grade,
    voteData,
    year,
    month,
    edit,
    isAdmin
  );
  if (!result) {
    return errResponse(baseResponse.WRONG_VOTE_DATA);
  }
  return response(baseResponse.SUCCESS);
};

exports.voteResult = async function (data, verifiedToken) {
  const userId = verifiedToken.userId;
  // 4001
  if (userId == null) {
    return errResponse(baseResponse.TOKEN_ERROR);
  }
  const { grade, year, month } = data;
  // 2001
  if (!(grade && year && month)) {
    return errResponse(baseResponse.WRONG_QUERY_STRING);
  }

  // 6002
  if (!isValidDateForVoteResult(year, month)) {
    return errResponse(baseResponse.VOTE_NOT_END);
  }
  try {
    const result = await Provider.voteResult(grade, year, month);
    if (!result) {
      return errResponse(baseResponse.NOT_CONFIRMED_BY_ADMIN);
    }
    return response(baseResponse.SUCCESS, result);
  } catch (err) {
    return errResponse(baseResponse.WRONG_VOTE_DATA);
  }
};

exports.sendEmail = async function (data) {
  const { email, shouldExist } = data;
  if (shouldExist) {
    const doubleCheck = await Provider.getUserEmail(email);
    if (doubleCheck.length == 0) {
      return errResponse(baseResponse.NOT_EXIST_USER_FOR_SENDING_EMAIL);
    }
  }

  let authNum = Math.random().toString().substring(2, 8);
  // 7001
  if (email == null || email == "") return response(baseResponse.EMAILEMPTY);
  const mailPoster = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      auth: {
        user: "nlcsjejusportshall@gmail.com",
        // eslint-disable-next-line no-undef
        pass: process.env.EMAIL_AUTH_PASSWORD,
      },
    })
  );

  const mailOptions = {
    from: "nlcsjejusportshall@gmail.com",
    to: email,
    subject: "[NLCS-JEJU-Sportshall] 이메일 인증번호를 안내해드립니다.",
    text: "인증번호는 " + authNum + " 입니다.",
  };
  return new Promise((resolve) => {
    mailPoster.sendMail(mailOptions, function (error) {
      if (error) {
        //7002
        console.error("[Send Email]: ", error);
        return resolve(errResponse(baseResponse.EMAIL_SEND_ERROR));
      } else {
        resolve(response(baseResponse.SUCCESS, { code: authNum }));
      }
    });
  });
};

exports.sendingEmailResult = async function (data, verifiedToken) {
  const userId = verifiedToken.userId;
  if (userId != 1) {
    return errResponse(baseResponse.TOKEN_ERROR);
  }
  const { email, year, month } = data;
  if (!(email && year && month)) {
    return errResponse(baseResponse.WRONG_BODY);
  }
  const GRADES = ["MS", "HS"];
  const attachments = [];
  for (const grade of GRADES) {
    const csvRawString = await CSVGenerator.generate(year, month, grade);
    if (!csvRawString) {
      return errResponse(baseResponse.WRONG_VOTE_DATA);
    }
    const path = csvFilePath(grade);
    fs.writeFileSync(path, csvRawString);
    attachments.push({
      filename: `${year}_${month}_Voting_Result_${grade}.csv`,
      path: path,
    });
  }
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "nlcsjejusportshall@gmail.com",
      pass: "jpqiebiijnmdatoh",
    },
  });

  const mailOptions = {
    from: "nlcsjejusportshall@gmail.com",
    to: data.email,
    subject: `${year}.${month} Sports Hall Vote Result`,
    text: "",
    attachments: attachments,
  };
  const promise = new Promise((resolve) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }

      fs.unlinkSync(path);
      resolve();
    });
  });
  try {
    await promise;
  } catch (err) {
    console.error("Email sending to admin: ", err);
    return errResponse(baseResponse.EMAIL_SEND_ERROR);
  }

  return response(baseResponse.SUCCESS);
};

exports.deleteAccount = async function (data, verifiedToken) {
  const userId = verifiedToken.userId;
  const res = await Service.deleteAccount(userId);
  if (!res) {
    return errResponse(baseResponse.WRONG_BODY);
  }
  return response(baseResponse.SUCCESS);
}
// function getMaxSports(basketball, volleyball, badminton) {
//   if (basketball >= volleyball && basketball >= badminton) {
//     return "Basketball";
//   } else if (volleyball >= basketball && volleyball >= badminton) {
//     return "Volleyball";
//   }
//   return "Badminton";
// }

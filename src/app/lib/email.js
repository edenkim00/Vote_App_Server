const Provider = require("../Provider");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
const fs = require("fs");
const path = require("path");

const { generateCsv } = require("../utils/report");
require("dotenv").config();

exports.sendEmail = async function (data) {
  const { email, shouldExist } = data;
  if (shouldExist) {
    const doubleCheck = await Provider.getUserEmail(email);
    if (doubleCheck.length == 0) {
      return errResponse(baseResponse.NOT_EXIST_USER_FOR_SENDING_EMAIL);
    }
  }

  let authNum = Math.random().toString().substring(2, 8);
  console.log(authNum);
  // 7001
  if (email == null || email == "") return response(baseResponse.WRONG_BODY);
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
  const { email, category_id } = data;
  if (!(email && category_id)) {
    return errResponse(baseResponse.WRONG_BODY);
  }
  const categoryInfo = await Provider.selectVoteCategory(category_id);
  if (!categoryInfo?.length) {
    return errResponse(baseResponse.WRONG_BODY);
  }
  const category = categoryInfo[0];
  const categoryName = category.name;

  const attachments = [];
  const csvRawString = await generateCsv(category_id);
  if (!csvRawString) {
    return errResponse(baseResponse.SERVER_ISSUE);
  }
  const csvPath = path.join("/tmp", `data.csv`);
  fs.writeFileSync(csvPath, csvRawString);

  attachments.push({
    filename: `Voting_Result.csv`, //TODO:
    path: csvPath,
  });

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
    subject: `Sports Hall Vote Result (${categoryName})`,
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

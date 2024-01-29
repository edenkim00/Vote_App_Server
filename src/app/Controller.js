require("dotenv").config();
const {
  vote,
  voteResult,
  confirm,
  getVoteCategory,
  postVoteCategory,
  getConfirmedResult,
} = require("./lib/vote");
const { sendEmail, sendingEmailResult } = require("./lib/email");
const {
  postUser,
  deleteAccount,
  signIn,
  userInfo,
  changePassword,
} = require("./lib/user");

exports = {
  vote,
  voteResult,
  confirm,
  getVoteCategory,
  postVoteCategory,
  getConfirmedResult,
  sendEmail,
  sendingEmailResult,
  postUser,
  deleteAccount,
  signIn,
  userInfo,
  changePassword,
};

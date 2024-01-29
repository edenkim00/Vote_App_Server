const { sendEmail, sendingEmailResult } = require("./lib/email");
const {
  vote,
  voteResult,
  confirm,
  getVoteCategories,
  postVoteCategory,
  getConfirmedResult,
} = require("./lib/vote");
const {
  postUser,
  deleteAccount,
  signIn,
  userInfo,
  changePassword,
} = require("./lib/user");

/* for only admin */
exports.confirm = confirm;
exports.getVoteCategory = getVoteCategories;
exports.postVoteCategory = postVoteCategory;

exports.vote = vote;
exports.voteResult = voteResult;
exports.getConfirmedResult = getConfirmedResult;

exports.sendEmail = sendEmail;
exports.reportAnalysis = sendingEmailResult;

exports.postUser = postUser;
exports.signIn = signIn;
exports.deleteAccount = deleteAccount;
exports.userInfo = userInfo;
exports.changePassword = changePassword;

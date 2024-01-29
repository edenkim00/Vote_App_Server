/* */
const {
  confirm,
  getVoteCategory,
  postVoteCategory,

  vote,
  getConfirmedResult,

  sendEmail,
  reportAnalysis,

  postUser,
  signIn,
  deleteAccount,
  userInfo,
  changePassword,
} = require("./src/app/Controller.js");

const test = confirm;
const userId = 1;
const data = {};

test(data, { userId }).then((res) => {
  console.log(res);
});

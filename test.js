/* */
const {
  postVoteCategory,
  confirm,
  getVoteCategory,

  vote,
  getConfirmedResult,

  sendEmail,
  reportAnalysis,
  postUser,
  signIn,
  deleteAccount,
  userInfo,
  changePassword,
  getSports,
} = require("./src/app/Controller.js");

const test = getSports;
const userId = 1;
// const data = {
//   category_id: 12,
//   version: "2",
// };
const data = {
  category_id: 14,
  confirmed_data: {
    Mon: ["Basketball", "Badminton"],
    Tue: ["Volleyball", "Basketball"],
    Wed: ["Basketball", "Netball"],
    Thu: ["Basketball", "Volleyball"],
    Fri1: ["Basketball", "Netball"],
    Fri2: ["Volleyball", "Basketball"],
    Sat1: ["Volleyball", "Badminton"],
    Sat2: ["Basketball", "Badminton"],
  },
  version: "v2",
};

test(data, { userId }).then((res) => {
  console.log(res);
});

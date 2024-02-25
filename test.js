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
} = require("./src/app/Controller.js");

const test = reportAnalysis;
const userId = 1;
const data = {
  email: "eotjd0986@gmail.com",
  category_id: "1",
};
// const data = {
//   category_id: 1,
//   force: true,
//   vote_data: {
//     Mon: ["None", "None"],
//     Tue: ["Basketball", "Badminton"],
//     Wed: ["Basketball", "Badminton"],
//     Thu: ["Basketball", "Badminton"],
//     Fri1: ["Basketball", "Badminton"],
//     Fri2: ["Basketball", "Badminton"],
//     Sat1: ["Basketball", "Badminton"],
//     Sat2: ["Basketball", "Badminton"],
//   },
// };

test(data, { userId }).then((res) => {
  console.log(res);
});

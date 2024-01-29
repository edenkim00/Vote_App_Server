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

const test = confirm;
const userId = 1;
const data = {
  category_id: 1,
  force: true,
  confirmed_data: {
    Mon: "Basketball",
    Tue: "Basketball",
    Wed: "Basketball",
    Thu: "Basketball",
    Fri1: "Basketball",
    Fri2: "Basketball",
    Sat1: "Netball",
    Sat2: "Netball",
  },
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

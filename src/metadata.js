const Controller = require("./app/Controller");
const ENDPOINT_METADATA = {
  "/app/user-signup": {
    method: "POST",
    tokenRequired: false,
    next: Controller.postUser,
  },
  "/app/signin": {
    method: "POST",
    tokenRequired: false,
    next: Controller.signIn,
  },
  "/app/change-password": {
    method: "PATCH",
    tokenRequired: false,
    next: Controller.changePassword,
  },
  "/app/request-email-validation": {
    method: "POST",
    tokenRequired: false,
    next: Controller.sendEmail,
  },
  "/app/vote": {
    method: "POST",
    tokenRequired: true,
    next: Controller.vote,
  },
  "/app/vote-result": {
    method: "GET",
    tokenRequired: true,
    next: Controller.voteResult,
  },
  "/app/vote-change": {
    method: "PATCH",
    tokenRequired: true,
    next: Controller.voteChange,
    extraData: {
      edit: true,
    },
  },
  "/app/user-info": {
    method: "GET",
    tokenRequired: true,
    next: Controller.userInfo,
  },
  "/app/report-vote-result": {
    method: "POST",
    tokenRequired: true,
    next: Controller.sendingEmailResult,
  },
};

module.exports = {
  ENDPOINT_METADATA,
};

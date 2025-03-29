const Controller = require("./app/Controller");
const ENDPOINT_METADATA = {
  /* for user */
  "/app/user-signup": {
    method: "POST",
    tokenRequired: false,
    next: Controller.postUser,
  },
  "/app/delete-account": {
    method: "POST",
    tokenRequired: true,
    next: Controller.deleteAccount,
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
  "/app/user-info": {
    method: "GET",
    tokenRequired: true,
    next: Controller.userInfo,
  },

  /* for admin */
  "/app/report-vote-result": {
    method: "POST",
    tokenRequired: true,
    next: Controller.reportAnalysis,
  },
  "/app/confirm": {
    method: "POST",
    tokenRequired: true,
    next: Controller.confirm,
  },

  /* for vote_category */
  "/app/vote-categories": {
    method: "GET",
    tokenRequired: true,
    next: Controller.getVoteCategories,
  },
  "/app/open-vote": {
    method: "POST",
    tokenRequired: true,
    next: Controller.postVoteCategory,
  },
  "/app/confirmed-result": {
    method: "GET",
    tokenRequired: false,
    next: Controller.getConfirmedResult,
  },

  /* for vote */
  "/app/vote": {
    method: "POST",
    tokenRequired: true,
    next: Controller.vote,
  },

  /* for sports */
  "/app/sports": {
    method: "GET",
    tokenRequired: true,
    next: Controller.getSports,
  },

  "/app/register-sports": {
    method: "POST",
    tokenRequired: true,
    next: Controller.postSports,
  },
};

module.exports = {
  ENDPOINT_METADATA,
};

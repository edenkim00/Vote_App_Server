module.exports = {
  // Success
  SUCCESS: { isSuccess: true, code: 1000, message: "성공" },
  WRONG_BODY: {
    isSuccess: false,
    code: 1001,
    message: "Fail.",
  },

  WRONG_EMAIL: {
    isSuccess: false,
    code: 1002,
    message: "Email is wrong.",
  },

  WRONG_PASSWORD_LENGTH: {
    isSuccess: false,
    code: 1003,
    message: "Password length must be 8~20.",
  },

  ALREADY_EXIST_EMAIL: {
    isSuccess: false,
    code: 1004,
    message: "Already exist email.",
  },

  TOKEN_VERIFICATION_FAILURE: {
    isSuccess: false,
    code: 1005,
    message: "Authentication expired. Please log in again.",
  },

  INVALID_REQUEST: {
    isSuccess: false,
    code: 2000,
    message: "Invalid request.",
  },

  WRONG_QUERY_STRING: {
    isSuccess: false,
    code: 2001,
    message: "Fail.",
  },

  NOT_EXIST_USER: {
    isSuccess: false,
    code: 3001,
    message: "Check the email and password again.",
  },

  NOT_EXIST_USER_FOR_SENDING_EMAIL: {
    isSuccess: false,
    code: 3002,
    message: "This email is not registered.",
  },

  TOKEN_ERROR: { isSuccess: false, code: 4001, message: "잘못된 토큰입니다." },

  ALREADY_EXIST_VOTE: {
    isSuccess: false,
    code: 5001,
    message: "You already voted.",
  },

  DATE_ERROR: {
    isSuccess: false,
    code: 6001,
    message: "Date is wrong.",
  },

  VOTE_NOT_END: {
    isSuccess: false,
    code: 6002,
    message: "The vote has not finished yet.",
  },

  CLOSED_VOTE: {
    isSuccess: false,
    code: 6003,
    message: "The vote has not finished yet.",
  },

  INVALID_VOTE_DATA: {
    isSuccess: false,
    code: 6004,
    message: "Invalid vote data.",
  },

  EMAILEMPTY: {
    isSuccess: false,
    code: 7001,
    message: "Please enter your email.",
  },
  EMAIL_SEND_ERROR: {
    isSuccess: false,
    code: 7002,
    message: "Email send error.",
  },

  WRONG_VOTE_DATA: {
    isSuccess: false,
    code: 8001,
    message: "Wrong vote data.",
  },

  WRONG_VOTE_DATE: {
    isSuccess: false,
    code: 8002,
    message: "Wrong vote date.",
  },

  NOT_CONFIRMED_BY_ADMIN: {
    isSuccess: false,
    code: 8003,
    message: "Not confirmed by admin.",
  },

  SERVER_ISSUE: {
    isSuccess: false,
    code: 10001,
    message: "Temporary server issue occurred.",
  },
};

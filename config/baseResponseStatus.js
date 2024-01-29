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

  EMAIL_SEND_ERROR: {
    isSuccess: false,
    code: 7002,
    message: "Email send error.",
  },

  NOT_CONFIRMED_BY_ADMIN: {
    isSuccess: false,
    code: 8003,
    message: "Not confirmed by admin.",
  },

  ALREADY_EXIST_VOTE_CATEGORY_NAME: {
    isSuccess: false,
    code: 9001,
    message: "Already exist vote category name.",
  },

  SERVER_ISSUE: {
    isSuccess: false,
    code: 10001,
    message: "Temporary server issue occurred.",
  },
};

const SportsManager = require("./SportsManager");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");

exports.getSports = async function (data, verifiedToken) {
  const userId = verifiedToken.userId;

  const sports = await SportsManager.getSports(userId == 1);
  if (!sports) {
    return errResponse(baseResponse.SERVER_ISSUE);
  }

  return response(baseResponse.SUCCESS, {
    sports,
  });
};

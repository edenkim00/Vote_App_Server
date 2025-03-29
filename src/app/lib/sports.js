const SportsManager = require("./SportsManager");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");

exports.getSports = async function () {
  const sports = await SportsManager.getSports();
  if (!sports) {
    return errResponse(baseResponse.SERVER_ISSUE);
  }

  return response(baseResponse.SUCCESS, {
    sports,
  });
};

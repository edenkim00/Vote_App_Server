const baseResponse = require("./config/baseResponseStatus");
const { parseEvent, verifyAccessToken } = require("./src/utils");
require("dotenv").config();
exports.handler = async function (event) {
  const parsedData = parseEvent(event);

  if (!parsedData) {
    return {
      statusCode: 400,
      body: baseResponse.INVALID_REQUEST,
    };
  }
  if (parsedData.tokenRequired) {
    const verifiedToken = await verifyAccessToken(parsedData?.accessToken);
    if (!verifiedToken) {
      return {
        statusCode: 400,
        body: baseResponse.TOKEN_VERIFICATION_FAILURE,
      };
    }
    parsedData.verifiedToken = verifiedToken;
  }
  const { data, next, verifiedToken } = parsedData;
  try {
    const response = await next(data, verifiedToken);
    return {
      statusCode: 200,
      body: response,
    };
  } catch (err) {
    console.error("[Main]: err", err);
  }

  const response = {
    statusCode: 400,
    body: baseResponse.INVALID_REQUEST,
  };
  return response;
};

const Provider = require("../Provider");
const Service = require("../Service");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const {
  isValidVoteData,
  isAdmin,
  isValidConfirmedResult,
  toGrade,
} = require("../utils/util");
const { GRADES } = require("./constants");
require("dotenv").config();
const DEFAULT_VOTE_OPENED_DT = "2024-01-01";

exports.vote = async function (data, verifiedToken) {
  const userId = verifiedToken.userId;
  if (!userId) {
    return errResponse(baseResponse.TOKEN_ERROR);
  }

  const { category_id, force, vote_data } = data;
  if (!category_id || !vote_data || !isValidVoteData(vote_data)) {
    return errResponse(baseResponse.WRONG_BODY);
  }

  if (!force) {
    const exist = await Provider.doubleCheckVote([userId, category_id]);
    if (exist.length > 0) {
      return errResponse(baseResponse.ALREADY_EXIST_VOTE);
    }
  }

  const result = await Service.vote(userId, category_id, vote_data, force);
  if (!result) {
    return errResponse(baseResponse.SERVER_ISSUE);
  }
  return response(baseResponse.SUCCESS);
};

/* for only admin */
exports.confirm = async function (data, verifiedToken) {
  const userId = verifiedToken.userId;
  if (!isAdmin(userId)) {
    return errResponse(baseResponse.TOKEN_ERROR);
  }
  const { category_id, force, confirmed_data, version } = data;
  if (!(category_id && confirmed_data)) {
    return errResponse(baseResponse.WRONG_BODY);
  }
  if (!isValidConfirmedResult(confirmed_data, version)) {
    return errResponse(baseResponse.WRONG_BODY);
  }

  if (!force) {
    const exist = await Provider.getConfirmedResult(category_id);
    if (exist && Object.keys(exist).length > 0) {
      return errResponse(baseResponse.ALREADY_EXIST_VOTE);
    }
  }

  const result =
    version === "v2"
      ? await Service.confirm2(category_id, confirmed_data, force)
      : await Service.confirm(category_id, confirmed_data, force);

  if (!result) {
    return errResponse(baseResponse.SERVER_ISSUE);
  }
  return response(baseResponse.SUCCESS);
};

exports.postVoteCategory = async function (data, verifiedToken) {
  const userId = verifiedToken.userId;
  if (!isAdmin(userId)) {
    return errResponse(baseResponse.TOKEN_ERROR);
  }

  const { vote_name, grade, opened_dt, deadline } = data;
  if (!(vote_name && grade && deadline)) {
    return errResponse(baseResponse.WRONG_BODY);
  }

  const exist = await Provider.selectVoteCategoryWithVoteNameAndGrade([
    vote_name,
    grade,
  ]);
  if (exist?.length) {
    // 9001
    return errResponse(baseResponse.ALREADY_EXIST_VOTE_CATEGORY_NAME);
  }

  const result = await Service.postVoteCategory([
    vote_name,
    grade,
    opened_dt ?? DEFAULT_VOTE_OPENED_DT,
    deadline,
  ]);
  if (!result) {
    return errResponse(baseResponse.SERVER_ISSUE);
  }
  return response(baseResponse.SUCCESS);
};

exports.getVoteCategories = async function (data, verifiedToken) {
  const userId = verifiedToken.userId;
  if (!userId) {
    return errResponse(baseResponse.TOKEN_ERROR);
  }
  if (
    !data?.graduation_year ||
    !GRADES.includes(toGrade(data?.graduation_year))
  ) {
    return errResponse(baseResponse.WRONG_BODY);
  }

  const result = await Provider.selectVoteCategories(
    toGrade(data?.graduation_year),
    isAdmin(userId)
  );
  if (!result) {
    return errResponse(baseResponse.SERVER_ISSUE);
  }

  return response(baseResponse.SUCCESS, result);
};

exports.getConfirmedResult = async function (data) {
  const { category_id, version } = data;
  if (!category_id) {
    return errResponse(baseResponse.WRONG_BODY);
  }

  const result = version
    ? await Provider.getConfirmedResult2(category_id)
    : await Provider.getConfirmedResult(category_id);

  // const result = await Provider.getConfirmedResult(category_id);

  if (!result) {
    return errResponse(baseResponse.SERVER_ISSUE);
  }

  if (Array.isArray(result) && !result.length) {
    return errResponse(baseResponse.NOT_CONFIRMED_BY_ADMIN);
  }

  return response(baseResponse.SUCCESS, result);
};

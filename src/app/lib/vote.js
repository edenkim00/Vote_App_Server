const Provider = require("../Provider");
const Service = require("../Service");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const {
  getGrade,
  isValidVoteData,
  isAdmin,
  isValidConfirmedResult,
} = require("../utils/util");
require("dotenv").config();
const DEFAULT_VOTE_OPENED_DT = "2024-01-01";

exports.vote = async function (data, verifiedToken) {
  const userId = verifiedToken.userId;
  // 4001
  if (userId == null) {
    return errResponse(baseResponse.TOKEN_ERROR);
  }

  const isAdmin = userId === 1;
  const { voteData, year, month, graduationYear, edit, gradeSelectedByAdmin } =
    data;
  // 1001
  if (!(userId && voteData && year && month && graduationYear)) {
    return errResponse(baseResponse.WRONG_BODY);
  }
  if (isAdmin && !gradeSelectedByAdmin) {
    return errResponse(baseResponse.WRONG_BODY);
  }
  if (!isValidVoteData(year, month, voteData, isAdmin)) {
    return errResponse(baseResponse.INVALID_VOTE_DATA);
  }

  if (!edit) {
    const doubleCheckResult = await Provider.doubleCheckVote([
      userId,
      year,
      month,
    ]);
    if (doubleCheckResult.length > 0) {
      return errResponse(baseResponse.ALREADY_EXIST_VOTE);
    }
  }

  const grade = isAdmin
    ? gradeSelectedByAdmin
    : getGrade(parseInt(graduationYear)); // HS or MS

  const result = await Service.vote(
    userId,
    grade,
    voteData,
    year,
    month,
    edit,
    isAdmin
  );
  if (!result) {
    return errResponse(baseResponse.WRONG_VOTE_DATA);
  }
  return response(baseResponse.SUCCESS);
};

/* for only admin */
exports.confirm = async function (data, verifiedToken) {
  const userId = verifiedToken.userId;
  if (!isAdmin(userId)) {
    return errResponse(baseResponse.TOKEN_ERROR);
  }
  const { category_id, grade, confirmed_data } = data;
  if (!(category_id && grade && confirmed_data)) {
    return errResponse(baseResponse.WRONG_BODY);
  }
  if (!isValidConfirmedResult(confirmed_data)) {
    return errResponse(baseResponse.WRONG_BODY);
  }

  const result = await Service.confirm(category_id, grade, confirmed_data);
  if (!result) {
    return errResponse(baseResponse.WRONG_VOTE_DATA);
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

  const result = await Service.postVoteCategory(
    vote_name,
    grade,
    opened_dt ?? DEFAULT_VOTE_OPENED_DT,
    deadline
  );
  if (!result) {
    return errResponse(baseResponse.SERVER_ISSUE);
  }
  return response(baseResponse.SUCCESS);
};

exports.getVoteCategories = async function (_, verifiedToken) {
  const userId = verifiedToken.userId;
  if (!isAdmin(userId)) {
    return errResponse(baseResponse.TOKEN_ERROR);
  }

  const onlyOpened = isAdmin(userId) ? false : true;

  const result = await Provider.getVoteCategory(onlyOpened);
  if (!result) {
    return errResponse(baseResponse.SERVER_ISSUE);
  }

  return response(baseResponse.SUCCESS, result);
};

exports.getConfirmedResult = async function (data, verifiedToken) {
  const userId = verifiedToken.userId;
  if (!isAdmin(userId)) {
    return errResponse(baseResponse.TOKEN_ERROR);
  }

  const { cateogry_id, grade } = data;
  if (!(cateogry_id && grade)) {
    return errResponse(baseResponse.WRONG_QUERY_STRING);
  }
  const result = await Provider.getConfirmedResult(cateogry_id, grade);
  if (!result) {
    return errResponse(baseResponse.SERVER_ISSUE);
  }
  return response(baseResponse.SUCCESS, result);
};

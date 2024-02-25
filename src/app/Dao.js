async function getUserByEmail(connection, email) {
  const Query = `
    select id from User where email = ? and status='activate';
  `;
  const [result] = await connection.query(Query, email);
  return result;
}

async function forgotPassword(connection, params) {
  const Query = `select id from User where email= ?  and graduationYear = ? and name = ? and status='activate';`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function postUser(connection, params) {
  const Query = `INSERT INTO User(email, password, name, graduationYear, sex) VALUES (?,?,?,?,?);`;
  await connection.query(Query, params);
  return;
}

async function changePassword(connection, params) {
  const Query = `UPDATE User set password=? WHERE email=? and status = 'activate';`;
  await connection.query(Query, params);
  return;
}

async function isUserExist(connection, params) {
  const Query = `SELECT * from User WHERE email=? and password=? and status='activate';`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function getUserInfo(connection, userId) {
  const Query = `SELECT name, graduationYear, sex from User WHERE id=? and status='activate';`;
  const [result] = await connection.query(Query, userId);
  return result;
}

async function getGradeYearUser(connection, userId) {
  const Query = `SELECT graduationYear from User WHERE id=? and status='activate';`;
  const [result] = await connection.query(Query, userId);
  return result;
}

async function deleteAccount(connection, params) {
  const Query = `UPDATE User SET status = 'deleted' WHERE id = ?;`;
  await connection.query(Query, params);
  return;
}

async function doubleCheckVote(connection, params) {
  const Query = `SELECT id from Vote WHERE user_id = ? and category_id = ? and status='activate'`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function voteResult(connection, params) {
  const Query = `
  SELECT day, sport, priority, count(sport) AS vote_counts FROM Voting WHERE grade = ? and year = ? and month = ? and status='activate' GROUP BY day, sport, priority;
`;
  const [result] = await connection.query(Query, params);
  return [result];
}

async function voteDelete(connection, params) {
  const Query = `UPDATE Vote SET status = 'deleted' WHERE user_id = ? and date >= ? and date <= ?;`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function getAdminResult(connection, params) {
  const Query = `Select grade, date, sports, sum(totalPoint) as point, count(id) as count from Vote where date >= ? and date <= ? and status = 'activate' group by grade, sports, date order by date;`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function getAdminVotingResult(connection, params) {
  const Query = `SELECT * FROM Voting WHERE year = ? and month = ? and grade = ? and priority=1 and status='activate'`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function getReportData(connection, params) {
  const Query = `
  SELECT V.day, V.sports, V.priority, U.graduationYear AS graduation_year, U.sex AS gender, count(*) AS vote_counts FROM Vote V
    INNER JOIN User U ON V.user_id = U.id AND U.status = 'activate'
  WHERE V.category_id = ? and V.status='activate'
  GROUP BY V.day, V.sports, V.priority, U.graduationYear, U.sex;
  `;
  const [result] = await connection.query(Query, params);
  return result;
}

async function deleteConfirmedData(connection, params) {
  const Query = `UPDATE Result SET status = 'deleted' WHERE category_id = ? and status='activate';`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function selectVoteCategory(connection, categoryId) {
  const Query = `SELECT * FROM VoteCategory WHERE id = ? and status='activate';`;
  const [result] = await connection.query(Query, categoryId);
  return result;
}

async function confirm(connection, valuesClause) {
  const Query = `INSERT INTO Result(category_id, day, sports) VALUES ${valuesClause};`;
  const [result] = await connection.query(Query);
  return result;
}

async function selectVoteCategoryWithVoteNameAndGrade(connection, params) {
  const Query = `SELECT * FROM VoteCategory WHERE name = ? and grade = ? and status='activate';`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function selectVoteCategories(connection, params) {
  const grade = params[0];
  const time = params[1];
  const gradeCondition = grade ? `grade = ? and` : "";
  const timeCondition = time ? `opened_dt <= ? and deadline >= ? and` : "";
  const Query = `SELECT * FROM VoteCategory WHERE ${gradeCondition} ${timeCondition} status='activate';`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function postVoteCategory(connection, params) {
  const Query = `INSERT INTO VoteCategory(name, grade, opened_dt, deadline) VALUES (?,?,?,?);`;
  await connection.query(Query, params);
  return;
}

async function getConfirmedResult(connection, params) {
  const Query = `SELECT * FROM Result WHERE category_id = ? and status='activate';`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function deleteVotes(connection, params) {
  const Query = `UPDATE Vote SET status = 'deleted' WHERE user_id = ? and category_id = ? and status='activate';`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function vote(connection, valuesClause) {
  const Query = `INSERT INTO Vote(user_id, day, sports, category_id, priority) VALUES ${valuesClause};`;
  const [result] = await connection.query(Query);
  return result;
}

module.exports = {
  getUserByEmail,
  postUser,
  forgotPassword,
  changePassword,
  isUserExist,
  getUserInfo,
  getGradeYearUser,
  vote,
  doubleCheckVote,
  voteResult,
  voteDelete,
  getAdminResult,
  getAdminVotingResult,
  getReportData,
  deleteAccount,
  deleteConfirmedData,
  confirm,
  selectVoteCategoryWithVoteNameAndGrade,
  selectVoteCategories,
  postVoteCategory,
  getConfirmedResult,
  deleteVotes,
  selectVoteCategory,
};

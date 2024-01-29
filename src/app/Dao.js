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
  const Query = `SELECT id, sex, graduationYear from User WHERE email=? and password=? and status='activate';`;
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

async function vote(
  connection,
  userId,
  grade,
  voteData,
  year,
  month,
  priority,
  edit,
  isAdmin
) {
  const VALUES = Object.entries(voteData)
    .map(([day, sport]) => {
      return `(${userId}, ${year}, ${month}, ${priority}, '${grade}', '${day}', '${sport}', ${isAdmin})`;
    })
    .join(",");
  if (edit) {
    await connection.query(
      `UPDATE Voting SET status='deleted' WHERE user_id = ${userId} and year = ${year} and month = ${month} and grade = '${grade}' and priority = ${priority} and is_admin = ${isAdmin} and status='activate';`
    );
  }
  const Query = `INSERT INTO Voting(user_id, year, month, priority, grade, day, sport, is_admin) VALUES ${VALUES};`;
  const [result] = await connection.query(Query);
  return result;
}

async function doubleCheckVote(connection, params) {
  const Query = `SELECT id from Voting WHERE user_id = ? and year = ? and month = ? and status='activate'`;
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
  const Query = `UPDATE Vote SET status = 'deleted' WHERE userId = ? and date >= ? and date <= ?;`;
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

async function getReportDetailData(connection, params) {
  const Query = `
  SELECT V.sport, U.${params[3]}, count(*) AS vote_counts FROM Voting V
    INNER JOIN User U ON V.user_id = U.id AND U.status = 'activate'
  WHERE V.year = ${params[0]} and V.month = ${params[1]} and V.grade = '${params[2]}' and V.priority = 1 and V.status='activate' and V.is_admin=false
  GROUP BY V.sport, U.${params[3]};
  `;
  const [result] = await connection.query(Query, params);
  return result;
}

async function getReportData(connection, params) {
  const Query = `
  SELECT V.day, V.sport, V.priority, count(*) AS vote_counts FROM Voting V
  WHERE year = ${params[0]} and month = ${params[1]} and grade = '${params[2]}' and status='activate' AND is_admin=false
  GROUP BY V.day, V.sport, V.priority
  `;
  const [result] = await connection.query(Query);
  return result;
}

async function deleteConfirmedData(connection, params) {
  const Query = `UPDATE Result SET status = 'deleted' WHERE categoryId = ? and grade = ?;`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function confirm(connection, valuesClause) {
  const Query = `INSERT INTO Result(categoryId, grade, day, sport) VALUES ${valuesClause};`;
  const [result] = await connection.query(Query);
  return result;
}

async function selectVoteCategoryWithVoteNameAndGrade(connection, params) {
  const Query = `SELECT * FROM VoteCategory WHERE name = ? and grade = ?;`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function selectVoteCategories(connection, params) {
  const time = params[1];
  const timeCondition = time ? `and opened_dt <= ? and deadline >= ?` : "";
  const Query = `SELECT * FROM VoteCategory WHERE grade = ? ${timeCondition};`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function postVoteCategory(connection, params) {
  const Query = `INSERT INTO VoteCategory(name, grade, opened_dt, deadline) VALUES (?,?,?,?);`;
  await connection.query(Query, params);
  return;
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
  getReportDetailData,
  deleteAccount,
  deleteConfirmedData,
  confirm,
  selectVoteCategoryWithVoteNameAndGrade,
  selectVoteCategories,
  postVoteCategory,
};

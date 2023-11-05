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

async function vote(connection, userId, grade, voteData, year, month, edit) {
  const VALUES = voteData
    .entries()
    .map(([day, sport]) => {
      return `(${userId}, ${year}, ${month}, ${grade}, ${day}, '${sport}')`;
    })
    .join(",");
  const Query = edit
    ? `
    UPDATE Voting SET status='deleted' WHERE userId = ? and year = ? and month = ? and grade = ?;
  `
    : "" +
      `INSERT INTO Vote(userId, year, month, grade, day, sport) VALUES ${VALUES};`;
  const [result] = await connection.query(Query);
  return result;
}

async function voteChange(connection, params) {
  const Query = `Update Vote SET sports = ? where userId = ? and date = ? and grade = ?;`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function doubleCheckVote(connection, params) {
  const Query = `SELECT id from Vote WHERE userID = ? and year = ? and month = ? and status='activate'`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function voteResult(connection, params) {
  const Query = `
  SELECT day, sport, count(sport) FROM Voting WHERE grade = ? and year = ? and month = ? and status='activate' GROUP BY day, sport;
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
  voteChange,
  voteDelete,
  getAdminResult,
};

//중복확인
async function getUserByEmail(connection, email) {
  const Query = `
    select id from User where email = ? and status='activate';
  `;
  const [result] = await connection.query(Query, email);
  return result;
}
//비번찾기검사
async function forgotPassword(connection, params) {
  const Query = `select id from User where email= ?  and graduationYear = ? and name = ? and status='activate';`;
  const [result] = await connection.query(Query, params);
  return result;
}

//회원가입
async function postUser(connection, params) {
  const Query = `INSERT INTO User(email, password, name, graduationYear, votingWeight) VALUES (?,?,?,?,?);`;
  await connection.query(Query, params);
  return;
}

//비밀번호 변경
async function changePassword(connection, params) {
  const Query = `UPDATE User set password=? WHERE email=? and status = 'activate';`;
  await connection.query(Query, params);
  return;
}

async function isUserExist(connection, params) {
  const Query = `SELECT id, votingWeight, graduationYear from User WHERE email=? and password=? and status='activate';`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function getUserInfo(connection, userId) {
  const Query = `SELECT name, graduationYear, votingWeight from User WHERE id=? and status='activate';`;
  const [result] = await connection.query(Query, userId);
  return result;
}

async function getGradeYearUser(connection, userId) {
  const Query = `SELECT graduationYear from User WHERE id=? and status='activate';`;
  const [result] = await connection.query(Query, userId);
  return result;
}

async function vote(connection, paramsList) {
  let paramsString = ``;
  for (let i = 0; i < paramsList.length; i++) {
    paramsString += `(${paramsList[i][0]}, '${paramsList[i][1]}', '${paramsList[i][2]}', '${paramsList[i][3]}', ${paramsList[i][4]}, ${paramsList[i][5]}, ${paramsList[i][6]})`;
    if (i !== paramsList.length - 1) {
      paramsString += `, `;
    }
  }

  const Query = `INSERT INTO Vote(userId, sports, date, grade, userPoint, pickPoint, totalPoint) Values ${paramsString};`;
  const [result] = await connection.query(Query);
  return result;
}

async function voteChange(connection, params) {
  const Query = `Update Vote SET sports = ? where userId = ? and date = ? and grade = ?;`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function doubleCheckVote(connection, params) {
  // @params : [userId, date]
  const Query = `SELECT id from Vote WHERE userID = ? and date = ? and status='activate'`;
  const [result] = await connection.query(Query, params);
  return result;
}

async function voteResult(connection, params) {
  const Query = `SELECT sports, date, sum (totalPoint) as point FROM Vote WHERE grade = ? and date >= ? and date <= ? and status="activate" group by sports, date`
  const [result] = await connection.query(Query, params);
  return [result]
}

async function voteDelete(connection, params) {
  const Query = `UPDATE Vote SET status = 'deleted' WHERE userId = ? and date >= ? and date <= ?;`;
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
};

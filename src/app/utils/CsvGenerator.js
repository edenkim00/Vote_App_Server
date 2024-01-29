const { prepareVoteDataForReport } = require("../Provider");
const Dao = require("../Dao");
const { getGrades, getFullGradeFromGraduationYear } = require("./util");
const {
  DAYS_AVAILABLE,
  SPORTS_AVAILABLE,
  WEIGHTS_FOR_VOTE_BY_PRIORITY,
} = require("../lib/constants");

const CSV_TABLES = [
  {
    name: "Voting Results",
    key: () => DAYS_AVAILABLE,
    columns: SPORTS_AVAILABLE,
    initialValue: { 1: 0, 2: 0 },
    getDataFromDB: (connection, year, month, grade) =>
      Dao.getReportData(connection, [year, month, grade]),
    processRawData: (row, acc) => {
      const { sport, day, priority, vote_counts } = row;
      if (!(sport && day && priority && vote_counts)) return;
      const ref = acc[day]?.[sport];
      if (!ref) return;
      ref[priority] += vote_counts;
    },
    postProcess: (csv) => {
      for (const row of csv) {
        for (const [columnIndex, value] of row.entries()) {
          if (columnIndex === 0) continue;
          if (typeof value !== "object") continue;
          row[columnIndex] = _processTotalResult(value);
        }
      }
    },
  },
  {
    name: "Analysis By Gender",
    key: () => ["male", "female"],
    columns: SPORTS_AVAILABLE,
    initialValue: 0,
    getDataFromDB: (connection, year, month, grade) =>
      Dao.getReportDetailData(connection, [year, month, grade, "sex"]),
    processRawData: (row, acc) => {
      const { sport, sex, vote_counts } = row;
      if (!(sport && sex && vote_counts)) return;
      const ref = acc[sex];
      if (!ref) return;
      ref[sport] += vote_counts;
    },
  },
  {
    name: "Analysis By Grade",
    key: (grade) => getGrades(grade),
    columns: SPORTS_AVAILABLE,
    initialValue: 0,
    getDataFromDB: (connection, year, month, grade) =>
      Dao.getReportDetailData(connection, [
        year,
        month,
        grade,
        "graduationYear",
      ]),
    processRawData: (row, acc) => {
      const { sport, graduationYear, vote_counts } = row;
      if (!(sport && graduationYear && vote_counts)) return;
      const ref = acc[getFullGradeFromGraduationYear(graduationYear)];
      if (!ref) return;
      ref[sport] += vote_counts;
    },
  },
];

async function generate(year, month, grade) {
  let csv = [];
  for (const table of CSV_TABLES) {
    csv.push([`${table.name}`]);
    csv.push(["", ...table.columns]);

    const voteData = await prepareVoteDataForReport(table, year, month, grade);
    for (const key of table.key(grade)) {
      const row = [key];
      const currentKey = voteData[key];
      if (!currentKey) continue;
      for (const column of table.columns) {
        const data = voteData[key][column] ?? "NAN";
        row.push(data);
      }
      csv.push(row);
    }
    if (table.postProcess) {
      table.postProcess(csv);
    }
    csv.push(["", "", "", "", "", ""]);
    csv.push(["", "", "", "", "", ""]);
  }

  return csv.map((row) => row.join(",")).join("\n");
}

function _processTotalResult(data) {
  return `${
    WEIGHTS_FOR_VOTE_BY_PRIORITY[0] * data["1"] +
    WEIGHTS_FOR_VOTE_BY_PRIORITY[1] * data["2"]
  } (${data["1"]} | ${data["2"]})`;
}

module.exports = {
  generate,
};

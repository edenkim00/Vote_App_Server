const { prepareVoteDataForReport } = require("../Provider");
const {
  DAYS_AVAILABLE,
  WEIGHTS_FOR_VOTE_BY_PRIORITY,
  GENDERS,
} = require("../lib/constants");
const { getGrades, getFullGradeFromGraduationYear } = require("./util");

function getCsvTable(sportsList) {
  return [
    {
      header:
        "Voting Results, (Point | (priority 1 count | priority 2 count)), (Point = priority 1 count * 3 + priority 2 count * 2)",
      filter: () => true,
      rows: () => DAYS_AVAILABLE,
      columns: sportsList,
      rowKey: "day",
      columnKey: "sports",
      aggregate: (acc, rowKey, columnKey, vote) => {
        const row = vote[rowKey];
        const column = vote[columnKey];
        const priority = parseInt(vote.priority);
        const vote_counts = vote.vote_counts ?? 0;

        if (!acc[row]) acc[row] = {};
        if (!acc[row][column]) {
          acc[row][column] = {};
        }

        acc[row][column][priority] =
          (acc[row][column][priority] ?? 0) + vote_counts;
      },

      postProcess: (table) => {
        const keys = Object.keys(table);
        for (const key of keys) {
          const currentRow = table[key];
          const columns = Object.keys(currentRow);
          for (const column of columns) {
            const value = currentRow[column];

            const priority1Count = parseInt(value["1"] ?? 0);
            const priority2Count = parseInt(value["2"] ?? 0);
            const point =
              priority1Count * WEIGHTS_FOR_VOTE_BY_PRIORITY[0] +
              priority2Count * WEIGHTS_FOR_VOTE_BY_PRIORITY[1];
            table[key][
              column
            ] = `${point} (${priority1Count} | ${priority2Count})`;
          }
        }
      },
    },
    {
      header: "Analysis By Gender, (Counted only priority 1 votes)",
      filter: (row) => row.priority == 1,
      rows: () => GENDERS,
      columns: sportsList,
      rowKey: "gender",
      columnKey: "sports",
      aggregate: (acc, rowKey, columnKey, vote) => {
        const row = vote[rowKey] ?? "Rather not say";
        const column = vote[columnKey];
        const count = vote.vote_counts ?? 0;
        if (!acc[row]) acc[row] = {};
        acc[row][column] = (acc[row][column] ?? 0) + parseInt(count);
      },
    },
    {
      header: "Analysis By Grade, (Counted only priority 1 votes)",
      filter: (row) => row.priority == 1,
      rows: (grade) => getGrades(grade).map((g) => g.toString()),
      columns: sportsList,
      rowKey: "graduation_year",
      columnKey: "sports",
      aggregate: (acc, rowKey, columnKey, vote) => {
        const graduationYear = vote[rowKey];
        const grade = getFullGradeFromGraduationYear(graduationYear);
        const column = vote[columnKey];
        const count = vote.vote_counts ?? 0;
        if (!acc[grade]) acc[grade] = {};
        acc[grade][column] = (acc[grade][column] ?? 0) + parseInt(count);
      },
    },
  ];
}

async function generateCsv(categoryId, grade, sportsList) {
  const CSV_TABLES = getCsvTable(sportsList);
  let csv = [];
  const dataFromDB = await prepareVoteDataForReport(categoryId);

  for (const table of CSV_TABLES) {
    csv.push([`${table.header}`]);
    csv.push(["", ...table.columns]);
    if (!grade) {
      throw Error("Fail to inspect grade.");
    }
    const filtered = dataFromDB.filter(table.filter);
    const { rowKey, columnKey } = table;
    let currentTable = {};

    for (const row of filtered) {
      table.aggregate(currentTable, rowKey, columnKey, row);
    }

    if (table.postProcess) {
      table.postProcess(currentTable);
    }
    const rowLabels = table.rows(grade);
    const columnLabels = table.columns;

    for (const row of rowLabels) {
      const currentRow = [row];
      for (const column of columnLabels) {
        currentRow.push(currentTable[row]?.[column] ?? "0");
      }
      csv.push(currentRow);
    }

    csv.push(["", "", "", "", "", ""]);
    csv.push(["", "", "", "", "", ""]);
  }

  return csv.map((row) => row.join(",")).join("\n");
}

module.exports = {
  generateCsv,
};

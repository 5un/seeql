exports.generateColumnValuesSuggestionQuery = (columnName, table) => {
  return `select \`${columnName}\` as value, count(1) as row_count from \`${table}\` group by \`${columnName}\` order by row_count DESC limit 10`
}
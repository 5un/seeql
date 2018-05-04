
exports.generateColumnValuesSuggestionQuery = (columnName, table, prefix) => {
  if(prefix) {
    return `select \`${columnName}\` as value, count(1) as row_count from \`${table}\` where \`${columnName}\` like '${prefix}%' group by \`${columnName}\` order by row_count DESC limit 10`
  } else {
    return `select \`${columnName}\` as value, count(1) as row_count from \`${table}\` group by \`${columnName}\` order by row_count DESC limit 10`
  }
}

exports.generateBinningQuery = (columnName, table, numBins) => {
  return `select
      min(\`${columnName}\`) as min,
      max(\`${columnName}\`) as max,
      count(\`${columnName}\`) as num,
      CAST((\`${columnName}\` - value.min)/(value.max - value.min)*${numBins} AS INT64) as grp
    from \`${table}\`
    CROSS JOIN (SELECT MAX(\`${columnName}\`) as max, MIN(\`${columnName}\`) as min from \`${table}\`) value
    GROUP BY grp
    ORDER BY grp 
  `
}

exports.generateJoinCheckQuery = (table1, table1Column, table2, table2Column) => {
  return `
    select count(1) from \`${table1}\` where \`${table1Column}\` not in (select ${table2Column} from \`${table2}\`)
  `
}
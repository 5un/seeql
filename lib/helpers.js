export const parseColumnNames = (csv) => {
  const lines = csv.split('\n')
  const columnNames = lines.splice(0, 1)[0].split(',')
  return columnNames
}
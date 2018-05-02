import metadata from './metadata.json'
import _ from 'lodash'

export const parseColumnNames = (csv) => {
  const lines = csv.split('\n')
  const columnNames = lines.splice(0, 1)[0].split(',')
  return columnNames
}

export const filterNumericColumnNames = (names) => {
  const variables = _.filter(
    names, 
    variable => {
      const matched = _.find(metadata, (m) => m.name === variable)
      if(matched && (matched.type === 'string' || matched.type === 'categorical')) {
        return false
      }
      return true
    })
  return variables
}

export const findTopLevelJoinStatement = (ast) => {
  if(ast.type === 'statement' && ast.variant === 'list') {

    var result = null
    ast.statement.forEach(stmt => {
      const potentialResult = findTopLevelJoinStatement(stmt)
      if(potentialResult != null) {
        result = potentialResult
      }
    })
    return result

  } else if(ast.type === 'statement' && ast.variant === 'select') {
    if(ast.from && ast.from.type === 'map' && ast.from.variant === 'join') {
      return ast.from
    }
  }
  return null
}

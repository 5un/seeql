import metadata from './metadata.json'
import _ from 'lodash'

export const parseColumnNames = (csv) => {
  const lines = csv.split('\n')
  const columnNames = lines.splice(0, 1)[0].split(',')
  return columnNames
}

export const filterNumericColumnNames = (names) => {
  console.log(metadata)
  const variables = _.filter(
    names, 
    variable => {
      const matched = _.find(metadata, (m) => m.name === variable)
      console.log(matched);
      if(matched && (matched.type === 'string' || matched.type === 'categorical')) {
        return false
      }
      return true
    })
  console.log(variables);
  return variables
}


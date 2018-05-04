import superagent from 'superagent'
import config from '../config/config'

export default class BigQueryHintDatasource {
  
  getSchema() {
    //TODO: return promise
    
  }

  getColumnSuggestedValues(column, table, prefix) {
    return superagent
      .post(`${config.API_URL}/getConditionValueSuggestions`)
      .send({ column, table, prefix })
  }

}
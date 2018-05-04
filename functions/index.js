const functions = require('firebase-functions');
const BigQuery = require('@google-cloud/bigquery');
const _ = require('lodash');
// Your Google Cloud Platform project ID
const projectId = 'see-ql';
const { generateColumnValuesSuggestionQuery,
        generateBinningQuery } = require('./helpers')

const cors = require('cors')({
  origin: true
});
const bigquery = new BigQuery({
  projectId: projectId,
});

exports.executeQuery = functions.https.onRequest((request, response) => {
  cors(request, response, () => {

    const query = request.body.query || 'SELECT url FROM `bigquery-public-data.samples.github_nested` LIMIT 100';
    const data = [];
    bigquery.createQueryStream(query)
      .on('error',(err) => {
        response.send({ error: err })
      } )
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', () => {
        response.send(data)
      });
  });
});

exports.getSchema = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    const publicBigQuery = new BigQuery({ projectId: 'bigquery-public-data' })
    const dataset = publicBigQuery.dataset('samples')
    dataset.getTables((err, tables) => {
      if(err) {
        response.send({ error: err })
      } else {
        Promise.all(tables.map(t => t.getMetadata()))
          .then((results) => {
            // console.log(results);
            const tablesInfo = results.map(
              r => _.pick(r[0], ['id', 'schema', 'numRows'])
            )
            response.send(tablesInfo)
          });
        // console.log(tables.map(t => t.id));
        // response.send(tables)
      }
      
    });
  });
});

exports.getConditionValueSuggestions = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    // TODO
    const datasetId = request.body.dataset || 'hacker_news'
    const tableId = request.body.table || 'stories'
    const columnName = request.body.column
    const prefix = request.body.prefix
    const projectId = 'bigquery-public-data'
    const publicBigQuery = new BigQuery({ projectId })
    const dataset = publicBigQuery.dataset(datasetId)
    const table = dataset.table(tableId)

    if (!columnName) {
      response.status(400).send({ error: {
        message: 'No Column Name'
      }})
    } else {
      table.getMetadata()
        .then((data) => {
          const metadata = data[0];
          field = _.find(metadata.schema.fields, f => f.name === columnName)
          if(field) {
            let query 
            const fullTableName = `${projectId}.${datasetId}.${tableId}`
            if(field.type === 'INTEGER' || field.type === 'FLOAT') {
              query = generateBinningQuery(columnName, fullTableName, 10)
            } else {
              query = generateColumnValuesSuggestionQuery(columnName, fullTableName, prefix)
            }
            console.log(query)

            const data = [];
            bigquery.createQueryStream(query)
              .on('error',(err) => {
                response.send({ error: err })
              })
              .on('data', (row) => {
                data.push(row);
              })
              .on('end', () => {
                response.send({
                  column: columnName,
                  total_rows: metadata.numRows,
                  type: field.type,
                  values: data
                })
              });

          } else {

            response.status(400).send({ error: {
              message: 'Column not found'
            }})

          }
        });
    }    

  });
});

exports.getJoinValueCheck = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    // TODO
    const datasetId = request.body.dataset || 'hacker_news'
    const leftTable = request.body.leftTable 
    const leftColumn = request.body.leftColumn
    const rightTable = request.body.rightTable
    const rightColumn = request.body.rightColumn

    const projectId = 'bigquery-public-data'
    const publicBigQuery = new BigQuery({ projectId })
    const dataset = publicBigQuery.dataset(datasetId)
    const table = dataset.table(tableId)

    if (!leftTable || !leftColumn || !rightTable || !rightColumn) {
      response.status(400).send({ error: {
        message: 'Missing leftTable, leftColumn, rightTable, or rightColumn'
      }})
    } else {
      

      table.getMetadata()
        .then((data) => {
          const metadata = data[0];
          leftField = _.find(metadata.schema.fields, f => f.name === leftColumn)
          rightField = _.find(metadata.schema.fields, f => f.name === rightColumn)
          if(leftField && rightField) {
            
          } else {
            response.status(400).send({ error: {
              message: 'Columns not found'
            }})
          }
        });
    }
    
  });
}); 

exports.getColumnDistribution = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    // TODO
    
  });
});



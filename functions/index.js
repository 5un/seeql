const functions = require('firebase-functions');
const BigQuery = require('@google-cloud/bigquery');
const _ = require('lodash');
// Your Google Cloud Platform project ID
const projectId = 'see-ql';
const { generateColumnValuesSuggestionQuery } = require('./helpers')

const cors = require('cors')({
  origin: true
});
const bigquery = new BigQuery({
  projectId: projectId,
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

exports.executeQuery = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    console.log(request.method);
    console.log(request.body);  
    const query = 'SELECT url FROM `bigquery-public-data.samples.github_nested` LIMIT 100';

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
            
            const query = generateColumnValuesSuggestionQuery(columnName, `${projectId}.${datasetId}.${tableId}`)
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

exports.getColumnDistribution = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    // TODO
    
  });
});



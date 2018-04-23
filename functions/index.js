const functions = require('firebase-functions');
const cors = require('cors')({
  origin: true
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

exports.executeQuery = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    // Imports the Google Cloud client library
    const BigQuery = require('@google-cloud/bigquery');

    // Your Google Cloud Platform project ID
    const projectId = 'see-ql';

    const bigquery = new BigQuery({
      projectId: projectId,
    });

    const query = 'SELECT url FROM `bigquery-public-data.samples.github_nested` LIMIT 100';

    const data = [];
    bigquery.createQueryStream(query)
      .on('error',(err) => {
        response.send({ error: err });
      } )
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', () => {
        response.send(data)
      });
  });
});

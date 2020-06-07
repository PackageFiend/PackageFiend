const AWS = require('aws-sdk');

async function main() {

  AWS.config.update({
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
  });

  const docClient = new AWS.DynamoDB.DocumentClient()

  const queryParams = {
    TableName: 'Geos',
  };

  do {
    console.log('Getting data..');
    try {
      const data = await docClient.scan(queryParams).promise();
      for (const user of data.Items) {
        console.log(user);
      }

      queryParams.ExclusiveStartKey = data.LastEvaluatedKey;
    } catch (err) {
      console.error("Table scan failed:", JSON.stringify(err, null, 2));
    }
  } while (typeof queryParams.ExclusiveStartKey != 'undefined');
}

main();

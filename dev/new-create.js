const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000'
});

const dynamodb = new AWS.DynamoDB();

async function main() {
  const params = {
    TableName: 'Users',
    KeySchema: [
      { AttributeName: 'username', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'username', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  };

  try {
    const data = await dynamodb.createTable(params).promise();
    console.log('Created table:', data);
  } catch (err) {
    console.error('Error creating table:', err);
  }
}

main();

const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000'
});

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
    const data = await dynamodb.createTable(params);
    console.log('Created table:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error creating table:', err);
  }
}

main();

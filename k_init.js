#!/usr/bin/env node
// Creates json file of environment variables
const fs = require('fs');
const AWS = require('aws-sdk');

// Configutre AWS Secrets Manager
const client = new AWS.SecretsManager({
  region: 'us-east-1'
});

async function getKeys() {
  console.log('Running script');

  // Request the 'Pkgfnd' password set from AWS Secrets Manager
  const data = await client.getSecretValue({SecretId: 'Pkgfnd'}).promise();
  //console.log(data);

  // Convert the JSON recieved to a JS object
  const keyDat = JSON.parse(data.SecretString);

  // Assign recieved data to local object, with specific format
  const pkgFiendInfo = {
    ups: keyDat.ups,
    usps: keyDat.usps,
    //fedex: process.env.fedex,
    google: keyDat.google,
    JWTkey: keyDat.JWTkey,
    AWS: {
      accessKeyId: keyDat.AWSki,
      secretAccessKey: keyDat.AWSsak
    }
  };

  // Convert local JS Object to JSON
  const pkgFiendInfoData = JSON.stringify(pkgFiendInfo);
  // Write the file to `keys.json`
  fs.writeFileSync('keys.json', pkgFiendInfoData);

  console.log('Completed writing to keys.json');
}

//getKeys();

module.exports = { getKeys };

#!/usr/bin/env node
// Creates json file of environment variables
const fs = require('fs');
const AWS = require('aws-sdk');

const client = new AWS.SecretsManager({
  region: 'us-east-1'
});

async function getKeys() {
  console.log('Running script');

  const data = await client.getSecretValue({SecretId: 'Pkgfnd'}).promise();
  //console.log(data);

  const keyDat = JSON.parse(data.SecretString);

  console.log('MAKING JSON BRO');
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

  const pkgFiendInfoData = JSON.stringify(pkgFiendInfo);
  fs.writeFileSync('keys.json', pkgFiendInfoData);
}

getKeys();

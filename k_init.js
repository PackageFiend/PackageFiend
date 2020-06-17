#!/usr/bin/env node
// Creates json file of environment variables
const fs = require('fs');
console.log('MAKING JSON BRO');
const pkgFiendInfo = {
  ups: process.env.ups,
  usps: process.env.usps,
  fedex: process.env.fedex,
  google: process.env.google,
  JWTkey: process.env.JWTkey
};

const pkgFiendInfoData = JSON.stringify(pkgFiendInfo);
fs.writeFileSync('keys.json', pkgFiendInfoData);

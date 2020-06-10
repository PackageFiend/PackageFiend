const fs = require('fs');
const AWS = require('aws-sdk');
const axios = require('axios');

const keys = JSON.parse(fs.readFileSync('keys.json', 'utf8'));

const docClient = new AWS.DynamoDB.DocumentClient();

module.exports = {
  getGeo: function (str, event) {
    return new Promise((resolve, reject) => {
      const checkParams = {
        TableName: 'Geos',
        Key: {
          locstring: str
        }
      };

      docClient.get(checkParams).promise().then(data => {
        if (data.Item !== undefined && data.Item.dat !== null && data.Item.dat.lat === undefined) {
          event.Location.Geo = data.Item.dat.geometry.location;
          event.Location.Address = data.Item.dat.formatted_address;
          resolve(true);
        } else {
          axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
              address: event.Location.String,
              key: keys.google
            }
          }).then((data) => {
            if (data.data.results.length === 0) {
              event.Location.Geo = null;
            } else {
              event.Location.Geo = data.data.results[0].geometry.location;
              event.Location.Address = data.data.results[0].formatted_address;
            }

            const putparams = {
              TableName: 'Geos',
              Item: {
                locstring: str,
                dat: data.data.results[0]
              }
            };

            docClient.put(putparams).promise().catch((err) => console.error(err));

            resolve(true);
          }).catch((err) => {
            event.Location.Geo = null;
            reject(err);
          });
        }
      }).catch(err => {
        console.error('Error getting geo info:', err);
        reject(err);
      });
    });
  }
};

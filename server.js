const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

async function main() {

  /*
  const kscript = require('./k_init');
  kscript();
  */

  let keys = {};

  // Get the keys from the `keys.json` file
  try {
    keys = JSON.parse(fs.readFileSync(path.join(__dirname, 'keys.json'), 'utf8'));
  } catch {
    await require('./k_init').getKeys();
    keys = JSON.parse(fs.readFileSync(path.join(__dirname, 'keys.json'), 'utf8'));
  }

  // Configure AWS SDK for DynamoDB
  AWS.config.update({
    region: 'us-east-1',
    accessKeyId: keys.AWS.accessKeyId,
    secretAccessKey: keys.AWS.secretAccessKey,
    endpointDiscoveryEnabled: true
  });

  // Import all of the routes
  const auth = require('./routes/auth');
  const user = require('./routes/user');
  const track = require('./routes/track');

  // Import passport for authentication
  const passport = require('passport');
  require('./pass-auth');

  const app = express();
  const port = 8080;

  // Redirects to https:// if X-Forwareded-Proto !== https
  app.get('*', function (req, res, next) {
    //console.log(req);
    console.log(req.hostname);
    if (parseInt(process.env.DO_SSH) == 0) { 
      next();
    } else if (req.hostname === 'localhost') {
      next();
    }  else if (req.get('X-Forwarded-Proto') === 'https') { next(); } else {
      res.set('X-Forwarded-Proto', 'https');
      console.log('Redirecting now!!!!!!');
      res.redirect('https://' + req.hostname + req.url);
    }
  });

  app.use(bodyParser.json());

  app.use('/auth', auth);
  // Set /user to the user rout with passport middleware
  app.use('/user', passport.authenticate('jwt', { session: false }), user);
  app.use('/track', track);

  app.use(express.static(path.join(__dirname, 'web_files')));

  // Serves static files
  app.use(express.static(path.join(__dirname, 'web_files')));

  // Initialize the server
  app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
}

main();

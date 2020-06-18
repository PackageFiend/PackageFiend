const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

/*
const kscript = require('./k_init');
kscript();
*/

const keys = JSON.parse(fs.readFileSync(path.join(__dirname, 'keys.json'), 'utf8'));

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: keys.AWS.accessKeyId,
  secretAccessKey: keys.AWS.secretAccessKey,
  endpointDiscoveryEnabled: true
});

const auth = require('./routes/auth');
const user = require('./routes/user');
const track = require('./routes/track');

const passport = require('passport');
require('./pass-auth');

const app = express();
const port = 8080;


app.use(bodyParser.json());

app.use('/auth', auth);
app.use('/user', passport.authenticate('jwt', {session: false}), user);
app.use('/track', track);

app.use(express.static(path.join(__dirname, 'web_files')));

app.get('/bad_login', (req, res) => res.send("Bad login info"));
app.get('/good_login', (req, res) => res.send("Good login info"));

// Redirects to https:// if X-Forwareded-Proto !== https
app.use('*', function (req, res, next) {
  console.log(req);
  if (req.get('X-Forwarded-Proto') === 'https') { next(); } else {
    res.set('X-Forwarded-Proto', 'https');
    console.log('Redirecting now!!!!!!');
    res.redirect('https://' + req.hostname + req.url);
  }
});
// Serves static files
app.use(express.static(path.join(__dirname, 'web_files')));


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

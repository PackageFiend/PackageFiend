const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

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

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

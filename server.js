const express = require('express');
const app = express();
const path = require('path');
const port = 8080;

// Set static folder
app.use(express.static(path.join(__dirname, 'web_files')));

app.use('*', function (req, res, next) {
  console.log(req);
  if (req.get('X-Forwarded-Proto') === 'https') { next(); } else {
    res.set('X-Forwarded-Proto', 'https');
    console.log('Redirecting now!!!!!!');
    res.redirect('https://' + req.hostname + req.url);
  }
});

// app.get('/', function(req, res, next))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

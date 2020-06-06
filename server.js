const express = require('express');
const app = express();
const path = require('path');
const port = 8080;

// Set static folder
app.use(express.static(path.join(__dirname, 'web_files')));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

app.get('*', function (req, res, next) {
  if (req.get('X-Forwarded-Proto') === 'https') { next(); } else {
    res.set('X-Forwarded-Proto', 'https');
    res.redirect('https://' + req.get('host') + req.url);
  }
});

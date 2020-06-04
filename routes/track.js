const express = require('express');
const router = express.Router();
const track = require('../track');

router.get('/num/:tracknum', async (req, res) => {
  const trackingNumber = req.params.tracknum;

  res.send(JSON.stringify(await track.track(trackingNumber), null, 2));
});

router.get('/:tracknum', (req, res) => {
  res.header('X-Track-Id', req.params.tracknum);
  res.sendFile('tracker.html', {root: 'web_files'});
});

router.get('/static/*', function(req, res){
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendFile(path, {root: 'web_files'});
});

module.exports = router;

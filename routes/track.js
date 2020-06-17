const express = require('express');
const ejs = require('ejs');
const router = express.Router();
const track = require('../tracking/track');

router.get('/dashboard', (req, res) => {
  res.sendFile('/templates/predash.html', { root: `${__dirname}/../`});
});

router.get('/num/:tracknum', async (req, res) => {
  const trackingNumber = req.params.tracknum.split(',');
  const data = await track.track(trackingNumber);

  res.send(await ejs.renderFile('./templates/tracker.ejs', { dat: data }));
  //res.send(JSON.stringify(await track.track([trackingNumber]), null, 2));
});

router.get('/q/:tracknum', async (req, res) => {
  const trackingNumber = req.params.tracknum;
  const test = await track.track(trackingNumber.split(','));

  res.send(test);
});

module.exports = router;

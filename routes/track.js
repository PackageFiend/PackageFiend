const express = require('express');
const router = express.Router();
const track = require('../track');

router.get('/num/:tracknum', async (req, res) => {
  const trackingNumber = req.params.tracknum;

  res.send(JSON.stringify(await track.track(trackingNumber), null, 2));
});

module.exports = router;

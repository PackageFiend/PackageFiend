const express = require('express');
const ejs = require('ejs');
const router = express.Router();
const track = require('../track');

const test = {
	"TrackNum": "000000000000000",
	"Error": {
		"Number": "1",
		"Description": "Invalid number"
	},
	"Provider": "FedEx",
	"Summary": "Package has been delivered",
	"Delivered": true,
	"OutForDelivery": true,
	"Events": [
		{
			"Time": "mm/dd/yyy HH:MM",
			"Description": "Left shipping facility",
			"Location": "17547"
		},
		{
			"Time": "mm/dd/yyy HH:MM",
			"Description": "Delivered to customer",
			"Location": "94109"
		}
	]
};

router.get('/num/:tracknum', async (req, res) => {
  const trackingNumber = req.params.tracknum;
  const test = await track.track([trackingNumber]);

  res.send(await ejs.renderFile('./templates/tracker.ejs', { dat: test[0] }));
  //res.send(JSON.stringify(await track.track([trackingNumber]), null, 2));
});

module.exports = router;

const express = require('express');
const ejs = require('ejs');
const router = express.Router();
const track = require('../track');

router.get('/num/:tracknum', async (req, res) => {
  const trackingNumber = req.params.tracknum.split(',');
	const data = [{"TrackNum":"9400111899223181539154","Error":false,"Provider":"USPS","Summary":"Your item was delivered in or at the mailbox at 10:13 am on April 28, 2020 in ELIZABETHTOWN, PA 17022.","Delivered":true,"OutForDelivery":false,"Events":[{"Time":null,"Description":"Your item was delivered in or at the mailbox ","Location":{"String":"ELIZABETHTOWN, PA 17022","Geo":{"lng":-76.6027455,"lat":40.1528719}}},{"Time":"2020-04-28T11:31:00.000Z","Description":"Out for Delivery","Location":{"String":"ELIZABETHTOWN, PA 17022","Geo":{"lng":-76.6027455,"lat":40.1528719}}},{"Time":"2020-04-28T11:20:00.000Z","Description":"Arrived at Post Office","Location":{"String":"ELIZABETHTOWN, PA 17022","Geo":{"lng":-76.6027455,"lat":40.1528719}}},{"Time":"2020-04-17T13:08:00.000Z","Description":"Shipping Label Created, USPS Awaiting Item","Location":{"String":"ONTARIO, CA 91761","Geo":{"lng":-117.5848025,"lat":34.0348144}}}],"MostRecentTime":"2020-04-28T11:31:00.000Z"},{"TrackNum":"1Z69662Y0334065288","Provider":"UPS","Error":false,"Summary":"foo","Delivered":true,"OutForDelivery":false,"Events":[{"Time":"2020-06-04T16:19:53.000Z","Description":"Delivered","Location":{"String":"MARIETTA PA  US","Geo":{"lng":-76.5521882,"lat":40.0570411}}},{"Time":"2020-06-04T13:23:02.000Z","Description":"Out For Delivery Today","Location":{"String":"East Petersburg PA  US","Geo":{"lng":-76.35412649999999,"lat":40.10009609999999}}},{"Time":"2020-06-04T08:54:57.000Z","Description":"Loaded on Delivery Vehicle ","Location":{"String":"East Petersburg PA  US","Geo":{"lng":-76.35412649999999,"lat":40.10009609999999}}},{"Time":"2020-06-04T08:39:03.000Z","Description":"Destination Scan","Location":{"String":"East Petersburg PA  US","Geo":{"lng":-76.35412649999999,"lat":40.10009609999999}}},{"Time":"2020-06-04T04:12:00.000Z","Description":"Arrival Scan","Location":{"String":"East Petersburg PA  US","Geo":{"lng":-76.35412649999999,"lat":40.10009609999999}}},{"Time":"2020-06-04T03:15:00.000Z","Description":"Departure Scan","Location":{"String":"Harrisburg PA  US","Geo":{"lng":-76.8867008,"lat":40.2731911}}},{"Time":"2020-06-03T13:48:00.000Z","Description":"Arrival Scan","Location":{"String":"Harrisburg PA  US","Geo":{"lng":-76.8867008,"lat":40.2731911}}},{"Time":"2020-06-02T04:13:00.000Z","Description":"Departure Scan","Location":{"String":"Atlanta GA  US","Geo":{"lng":-84.3879824,"lat":33.7489954}}},{"Time":"2020-06-01T21:57:00.000Z","Description":"Arrival Scan","Location":{"String":"Atlanta GA  US","Geo":{"lng":-84.3879824,"lat":33.7489954}}},{"Time":"2020-06-01T21:29:00.000Z","Description":"Departure Scan","Location":{"String":"Doraville GA  US","Geo":{"lng":-84.2832564,"lat":33.8981579}}},{"Time":"2020-06-01T19:55:06.000Z","Description":"Origin Scan","Location":{"String":"Doraville GA  US","Geo":{"lng":-84.2832564,"lat":33.8981579}}},{"Time":"2020-06-01T09:02:13.000Z","Description":"Order Processed: Ready for UPS ","Location":{"String":"   US","Geo":null}}],"MostRecentTime":"2020-06-04T16:19:53.000Z"}];
  //const data = await track.track(trackingNumber);

  res.send(await ejs.renderFile('./templates/tracker.ejs', { dat: data }));
  //res.send(JSON.stringify(await track.track([trackingNumber]), null, 2));
});

router.get('/q/:tracknum', async (req, res) => {
  const trackingNumber = req.params.tracknum;
  const test = await track.track(trackingNumber.split(','));

  res.send(test);
});

module.exports = router;

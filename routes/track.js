const express = require('express');
const ejs = require('ejs');
const router = express.Router();
const track = require('../track');

router.get('/num/:tracknum', async (req, res) => {
  const trackingNumber = req.params.tracknum.split(',');
  //const test = await track.track(trackingNumber);
  const data = [{"TrackNum":"9400116901645855817273","Error":false,"Provider":"USPS","Summary":"Your item was delivered in or at the mailbox at 2:27 pm on April 4, 2020 in MARIETTA, PA 17547.","Delivered":true,"OutForDelivery":false,"Events":[{"Time":null,"Description":"Your item was delivered in or at the mailbox ","Location":{"String":"MARIETTA, PA 17547","Geo":{"lng":-76.5521882,"lat":40.0570411}}},{"Time":"2020-04-04T11:32:00.000Z","Description":"Out for Delivery","Location":{"String":"MARIETTA, PA 17547","Geo":{"lng":-76.5521882,"lat":40.0570411}}},{"Time":"2020-04-04T11:21:00.000Z","Description":"Arrived at Post Office","Location":{"String":"MARIETTA, PA 17547","Geo":{"lng":-76.5521882,"lat":40.0570411}}},{"Time":"2020-04-04T09:46:00.000Z","Description":"Departed USPS Regional Facility","Location":{"String":"LANCASTER PA DISTRIBUTION CENTER","Geo":{"lng":-76.30284689999999,"lat":40.0573456}}},{"Time":"2020-04-04T07:01:00.000Z","Description":"Arrived at USPS Regional Facility","Location":{"String":"LANCASTER PA DISTRIBUTION CENTER","Geo":{"lng":-76.30284689999999,"lat":40.0573456}}},{"Time":"2020-04-04T05:46:00.000Z","Description":"Accepted at USPS Origin Facility","Location":{"String":"LEBANON, PA 17046","Geo":{"lng":-76.4331698,"lat":40.37846}}},{"Time":"2020-04-03T19:11:00.000Z","Description":"Shipment Received, Package Acceptance Pending","Location":{"String":"LEBANON, PA 17042","Geo":{"lng":-76.3868797,"lat":40.2927633}}},{"Time":null,"Description":"Pre-Shipment Info Sent to USPS, USPS Awaiting Item","Location":{"String":"USPS Awaiting Item, April 3, 2020","Geo":null}}]},{"TrackNum":"1Z061R620322489017","Provider":"UPS","Error":false,"Summary":"foo","Delivered":true,"OutForDelivery":false,"Events":[{"Time":"2020-05-09T16:03:36.000Z","Description":"Delivered","Location":{"String":"MARIETTA PA  US","Geo":{"lng":-76.5521882,"lat":40.0570411}}},{"Time":"2020-05-09T13:42:16.000Z","Description":"Out For Delivery Today","Location":{"String":"East Petersburg PA  US","Geo":{"lng":-76.35412649999999,"lat":40.10009609999999}}},{"Time":"2020-05-09T10:07:59.000Z","Description":"Loaded on Delivery Vehicle ","Location":{"String":"East Petersburg PA  US","Geo":{"lng":-76.35412649999999,"lat":40.10009609999999}}},{"Time":"2020-05-09T10:01:28.000Z","Description":"Destination Scan","Location":{"String":"East Petersburg PA  US","Geo":{"lng":-76.35412649999999,"lat":40.10009609999999}}},{"Time":"2020-05-09T07:14:00.000Z","Description":"Arrival Scan","Location":{"String":"East Petersburg PA  US","Geo":{"lng":-76.35412649999999,"lat":40.10009609999999}}},{"Time":"2020-05-09T00:18:00.000Z","Description":"Departure Scan","Location":{"String":"New Stanton PA  US","Geo":{"lng":-79.6085852,"lat":40.2276822}}},{"Time":"2020-05-08T17:00:00.000Z","Description":"Arrival Scan","Location":{"String":"New Stanton PA  US","Geo":{"lng":-79.6085852,"lat":40.2276822}}},{"Time":"2020-05-08T13:03:00.000Z","Description":"Departure Scan","Location":{"String":"Columbus OH  US","Geo":{"lng":-82.99879419999999,"lat":39.9611755}}},{"Time":"2020-05-08T10:45:00.000Z","Description":"Arrival Scan","Location":{"String":"Columbus OH  US","Geo":{"lng":-82.99879419999999,"lat":39.9611755}}},{"Time":"2020-05-08T06:35:00.000Z","Description":"Departure Scan","Location":{"String":"Louisville KY  US","Geo":{"lng":-85.7584557,"lat":38.2526647}}},{"Time":"2020-05-08T00:56:39.000Z","Description":"Origin Scan","Location":{"String":"Louisville KY  US","Geo":{"lng":-85.7584557,"lat":38.2526647}}},{"Time":"2020-05-07T23:52:56.000Z","Description":"Order Processed: Ready for UPS ","Location":{"String":"   US","Geo":null}}]}];

  res.send(await ejs.renderFile('./templates/tracker.ejs', { dat: data }));
  //res.send(JSON.stringify(await track.track([trackingNumber]), null, 2));
});

router.get('/q/:tracknum', async (req, res) => {
  const trackingNumber = req.params.tracknum;
  const test = await track.track(trackingNumber.split(','));

  res.send(test);
});

module.exports = router;

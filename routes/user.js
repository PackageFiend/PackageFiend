const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const moment = require('moment');

const track = require('../tracking/track');

const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

router.get('/', (req, res) => res.send('foo'));

router.get('/dashboard', async (req, res) => {
  const params = {
    TableName: 'Users',
    Key: {
      'username': req.user.username
    }
  }
  const udat = await docClient.get(params).promise();

  console.log('Fetching dashboard', req.user);
  const pids = Object.keys(udat.Item.packages);
  const upacs = Object.values(udat.Item.packages);
  const data = await track.track(pids, lite=true);
  //console.log('Dashboard data:', data);

  const it = [];
  const dd = [];
  const ofd = [];
  let del7_ups = 0;
  let del30_ups = 0;
  let del90_ups = 0;
  let del180_ups = 0;
  let delold_ups = 0;
  let del7_usps = 0;
  let del30_usps = 0;
  let del90_usps = 0;
  let del180_usps = 0;
  let delold_usps = 0;
  let all_ups = 0;
  let all_usps = 0;
  let it_ups = 0;
  let it_usps = 0;

  for (let i = 0; i < data.length; i++) {
    const parcel = data[i];
    if (udat.Item.packages[parcel.TrackNum]) {
      parcel.Name = udat.Item.packages[parcel.TrackNum].name;
    }

    if (parcel.OutForDelivery) {
      ofd.push(parcel);
      if (parcel.Provider === "UPS") {
        it_ups = it_ups + 1;
      } else if (parcel.Provider === "USPS") {
        it_usps = it_usps + 1;
      }
    } else if (parcel.Delivered) {
      dd.push(parcel);
      if (Math.round(moment().diff(moment(parcel.MostRecentTime))/(1000*3600*24)) <= 7) {
        if (parcel.Provider === "UPS") {
          del7_ups = del7_ups + 1;
        } else if (parcel.Provider === "USPS") {
          del7_usps = del7_usps + 1;
        };
      } else if (Math.round(moment().diff(moment(parcel.MostRecentTime))/(1000*3600*24)) <= 30) {
        if (parcel.Provider === "UPS") {
          del30_ups = del30_ups + 1;
        } else if (parcel.Provider === "USPS") {
          del30_usps = del30_usps + 1;
        };
      } else if (Math.round(moment().diff(moment(parcel.MostRecentTime))/(1000*3600*24)) <= 90) {
        if (parcel.Provider === "UPS") {
          del90_ups = del90_ups + 1;
        } else if (parcel.Provider === "USPS") {
          del90_usps = del90_usps + 1;
        };
      } else if (Math.round(moment().diff(moment(parcel.MostRecentTime))/(1000*3600*24)) <= 180) {
        if (parcel.Provider === "UPS") {
          del180_ups = del180_ups + 1;
        } else if (parcel.Provider === "USPS") {
          del180_usps = del180_usps + 1;
        };
      } else {
        if (parcel.Provider === "UPS") {
          delold_ups = delold_ups + 1;
        } else if (parcel.Provider === "USPS") {
          delold_usps = delold_usps + 1;
        };
      }
    } else {
      it.push(parcel);
      if (parcel.Provider === "UPS") {
        it_ups = it_ups + 1;
      } else if (parcel.Provider === "USPS") {
        it_usps = it_usps + 1;
      }
    }

    
    //console.log('Parcel:', parcel);
  }
  del30_ups = del30_ups + del7_ups;
  del30_usps = del30_usps + del7_usps;
  del90_ups = del90_ups + del30_ups;
  del90_usps = del90_usps + del30_usps;
  del180_ups = del180_ups + del90_ups;
  del180_usps = del180_usps + del90_usps;
  all_ups = del180_ups + delold_ups;
  all_usps = del180_usps + delold_usps;

  res.send(await ejs.renderFile('./templates/dashboard.html',
    {
      dat: data,
      it: it,
      dd: dd,
      ofd: ofd,
      del7_ups: del7_ups,
      del30_ups: del30_ups,
      del90_ups: del90_ups,
      del180_ups: del180_ups,
      delold_ups: delold_ups,
      del7_usps: del7_usps,
      del30_usps: del30_usps,
      del90_usps: del90_usps,
      del180_usps: del180_usps,
      delold_usps: delold_usps,
      all_ups: all_ups,
      all_usps: all_usps,
      it_ups: it_ups,
      it_usps: it_usps
    }));
});

router.get('/profile', (req, res, next) => {
  res.send(req.user);
});

router.get('/packages', async (req, res, next) => {
  const params = {
    TableName: "Users",
    Key: {
      "username": req.user.username
    }
  }

  /*
  docClient.get(params, (data, err) => {
    if (err) {
      console.error('Error getting user data:', err);
      return res.sendStatus(500);
    }

    return res.json(data.Item.packages);
  });
  Functionally equivalent to the below promise
  */

  try {
    const data = await docClient.get(params).promise();

    if (data.Item === undefined) {
      console.error('This user doesn\'t exist?? wtf?');
      return res.sendCode(500);
    }

    return res.json(Object.values(data.Item.packages));
  } catch (err) {
    console.error('Error getting user data:', err);
    return res.sendCode(500);
  }
});

router.post('/packages', async (req, res, next) => {
  const rdat = req.body;
  if (!rdat.id) {
    return res.status(400).json({ message: 'Bad data. Must contain id' });
  }

  const params = {
    TableName: "Users",
    Key: {
      "username": req.user.username
    },
    UpdateExpression: `SET packages.#Name = :vals`,
    ExpressionAttributeNames:{
      "#Name": rdat.id
    },
    ExpressionAttributeValues: {
      ":vals": {
        TrackNum: rdat.id
      }
    }
  };

  try {
    await docClient.update(params).promise();
    return res.sendStatus(200);
  } catch (err) {
    console.error('Problem adding package to user:', err);
    return res.sendStatus(500);
  }
});

router.post('/packages/name', async (req, res, next) => {
  const rdat = req.body;
  if (!rdat.id || !rdat.name) {
    return res.status(400).json({ message: 'Bad data. Must contain id and name' });
  }

  const getParams = {
    TableName: "Users",
    Key: {
      "username": req.user.username
    }
  };

  const pdat = await docClient.get(getParams).promise().catch(err => {
    console.error('Problem adding package to user:', err);
    return res.sendStatus(500);
  });

  console.log(pdat.Item);

  const updateParams = {
    TableName: 'Users',
    Key: {
      'username': req.user.username
    },
    UpdateExpression: `SET packages.#Name.#sitem = :plist`,
    ExpressionAttributeNames: {
      '#Name': rdat.id,
      '#sitem': 'name'
    },
    ExpressionAttributeValues: {
      ':plist': rdat.name
    }
  };

  try {
    await docClient.update(updateParams).promise();
    return res.sendStatus(200);
  } catch (err) {
    console.error('Problem adding package to user 2:', err);
    return res.sendStatus(500);
  }

});

module.exports = router;

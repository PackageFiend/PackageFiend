const express = require('express');
const router = express.Router();
const ejs = require('ejs');

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
  const data = await track.track(pids);
  //console.log('Dashboard data:', data);

  const it = [];
  const dd = [];
  const ofd = [];

  for (let i = 0; i < data.length; i++) {
    const parcel = data[i];
    if (udat.Item.packages[parcel.TrackNum]) {
      parcel.Name = udat.Item.packages[parcel.TrackNum].name;
    }

    if (parcel.OutForDelivery) {
      ofd.push(parcel);
    } else if (parcel.Delivered) {
      dd.push(parcel);
    } else {
      it.push(parcel);
    }
    console.log('Parcel:', parcel);
  }

  res.send(await ejs.renderFile('./templates/dashboard.html',
    {
      dat: data,
      it: it,
      dd: dd,
      ofd: ofd
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

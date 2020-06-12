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
  const pids = [];
  for (let i = 0; i < udat.Item.packages.length; i++) {
    pids.push(udat.Item.packages[i].id);
  }
  const data = await track.track(pids);
  console.log('Dashboard data:', data);

  res.send(await ejs.renderFile('./templates/dashboard.html', {dat: data}));
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

    return res.json(data.Item.packages);
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
    UpdateExpression: "SET packages = list_append(packages, :vals)",
    ExpressionAttributeValues: {
      ":vals": [{
        id: rdat.id
      }]
    }
  }

  try {
    await docClient.update(params).promise();
    return res.sendStatus(200);
  } catch (err) {
    console.error('Problem adding package to user:', err);
    return res.sendStatus(500);
  }
});

module.exports = router;

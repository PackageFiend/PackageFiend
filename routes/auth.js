const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const crypto = require('crypto');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const keys = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'keys.json'), 'utf8'));

const docClient = new AWS.DynamoDB.DocumentClient();

router.post('/login', function (req, res, next) {
  console.log(req.body);
  try{
    passport.authenticate('local', {session: false}, function(err, user, info) {
      if (err || !user) {
        return res.status(400).json({
          info: info,
          message: 'Something went wrong',
          error: err,
          user: user
        });
      }

      req.login(user, {session: false}, (err) => {
        if (err) {
          return res.send(err);
        }

        const token = jwt.sign(user, keys.JWTkey);
        return res.json({user, token});
      });
    })(req, res);
  } catch (e) {
    res.send(e);
  }
});

router.post('/createuser', async (req, res, next) => {
  dat = req.body;
  if (!dat.username || !dat.password || !dat.name) {
    return res.status(400).json({
      message: 'Bad data. Must contain username, password, and name'
    });
  }

  const checkParams = {
    TableName: 'Users',
    Key: {
      "username": dat.username
    }
  }

  try {
    const udat = await docClient.get(checkParams).promise();
    if (udat.Item !== undefined) {
      return res.status(400).json({
        message: 'Username already in use'
      });
    }
  } catch (err) {
    console.error('Error checking if user exists:', err);
    console.error(checkParams);
    console.error(dat);
    return res.sendStatus(500);
  }

  const passes = 80000;

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(dat.password, salt, passes, 32, 'sha256').toString('hex');

  const params = {
    TableName: 'Users',
    Item: {
      username: dat.username,
      name: dat.name,
      password: hash,
      salt: salt,
      pass_iter: passes,
      packages: {}
    }
  }

  console.log('Creating user:', params.Item);

  try{
    await docClient.put(params).promise();
  } catch (err) {
    console.error('Error adding user to database:', err);
    return res.sendStatus(500);
  }

  return res.sendStatus(201);
});

module.exports = router;

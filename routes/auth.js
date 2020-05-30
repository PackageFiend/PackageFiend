const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');

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

        const token = jwt.sign(user, 'secret'); //TODO: CHANGE SECRET TO SOMETHING SECURE AND NOT IN CODE
        return res.json({user, token});
      });
    })(req, res);
  } catch (e) {
    res.send(e);
  }
});

module.exports = router;

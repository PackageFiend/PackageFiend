const crypto = require('crypto');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-2",
  endpoint: "http://localhost:8000"
});

const docClient = new AWS.DynamoDB.DocumentClient();

passport.use(new LocalStrategy(
  function (username, password, cb) {
    const params = {
      TableName: "Users",
      Key: {
        "username": username
      }
    };

    docClient.get(params, function(err, data) {
      if (err) {
        console.error('Error getting user for login:', err);
        return cb(null, false, {message: 'Internal error'});
      }

      if (data.Item === undefined) {
        console.log('Bad login attempt, bad username');
        return cb(null, false, {message: 'Incorrect username or password'});
      }

      console.log(data.Item);

      const salt = data.Item.salt;
      const passes = data.Item.pass_iter;
      const hash = crypto.pbkdf2Sync(password, salt, passes, 32, 'sha256').toString('hex');
      if (data.Item.password === hash) {
        const jwtDat = {
          username: username,
          name: data.Item.name
        };

        console.log('Successful login');
        return cb(null, jwtDat, {message: 'Logged in'});
      }

      console.log('Bad login attempt, bad password');
      console.log(hash)
      console.log(data.Item.password);
      return cb(null, false, {message: 'Incorrect username or password'});
    })
  })
);

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret' //CRITICAL: CHANGE THIS TO BE SECURE AND THE SAME AS THE OTHER
  },
  function (jwtPayload, cb) {
    console.log("JWT auth");
    console.log("JWTPayload", jwtPayload);
    return cb(null, jwtPayload);
  }
));

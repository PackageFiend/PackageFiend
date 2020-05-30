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

var docClient = new AWS.DynamoDB.DocumentClient();

passport.use(new LocalStrategy(
  function (username, password, cb) {
    const params = {
      TableName: "Users",
      KeyConditionExpression: "username = :uname",
      ExpressionAttributeValues: {
        ":uname": username
      },
      Limit: 1
    };

    docClient.query(params, function(err, data) {
      if (err) {
        return cb(null, false, {message: 'Unknown error occurred.'});
      }

      if (data.Count == 0) {
        console.log('Bad login attempt, bad username');
        return cb(null, false, {message: 'Incorrect username or password'});
      }

      if (data.Items[0].password === password) {
        const jwtDat = {
          username: username,
          name: data.Items[0].name
        };

        console.log('Successful login');
        return cb(null, jwtDat, {message: 'Logged in'});
      }
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

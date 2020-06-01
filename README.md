Authentication
===
Follow the instructions for
[installation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html) of DynamoDB

`git pull` and switch to the `api_endpoints` branch

Run `npm install` in the root of this repo

Do a POST request to `localhost:8080/auth/createuser` with JSON like `{
	"name": "Test numero uno",
	"username": "test1",
	"password": "abc123"
}`. If you get a 201 response, the user was created with that username and
password combo. Error codes should be self-explainitory.

Do a POST request to `localhost:8080/auth/login` with JSON like `{ "username":
"Username_here", "password": "Password_here"}`. Use the login data that you
provided in the last step.

The response from that POST should contain a `token`. This is a bearer token
that proves that you are who you logged in as.

Without using the token, try to go to `localhost:8080/user/`. You should get
`Unauthorized`.

Next, add the `token` from the POST to as a Bearer Token in Postman for your
GET to `localhost:8080/user/`. You should now see `foo` as the response.

Lastly, you can go to `localhost:8080/user/profile` with the same Bearer Token
and you can see what data is kept with the token. (The
`localhost:8080/user/profile` is another protected route that can only
be accessed when authenticated)


Showing Database Data
===
Run `node ./dev/showdat.js`

Endpoints
===
`/user/`
---
`GET /user/profile`: Gives relevent information on the current user. Really,
this is just the information stored in the JWT.

`GET /user/packages`: Returns a JSON array of all of the package data
associated with a user.

`POST /user/packages`: Add a new package to the user. The POST must contain at
least the keys `provider` and `id`.

`/auth/`
---
`POST /auth/createuser`: Creates a new user. The POST must contain at least the
keys `name`, `username`, and `password`.

`POST /auth/login`: Returns JWT bearer token given the user provides a correct
username/password. The POST must contain the keys `username` and `password`.

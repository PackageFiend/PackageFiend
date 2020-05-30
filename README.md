Authentication
---
Follow the instructions for
[installation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html)

Run `npm install` in the root of this repo

Run `node ./dev/create.js` 

Do a POST request to `localhost:8080/auth/login` with JSON like `{ "username":
"Username_here", "password": "Password_here"}`. Example login info can be found
in `dev/create.js` starting on line 49. 

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

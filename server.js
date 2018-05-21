var express = require('express');
var fs = require('fs');
var app = express();

app.use(express.static('public'));

// This responds with "Hello World" on the homepage
app.get('/', function (req, res) {
   console.log("Got a GET request for the homepage");
   res.sendFile(__dirname + '/pages/index.html');
})

app.get('/process_get', function (req, res) {
  console.log("Got a GET request for process_get");
  response = {
      first_name:req.query.first_name,
      last_name:req.query.last_name
   };
   console.log(response);
   res.end(JSON.stringify(response));
})

// This responds a GET request for the /list_user page.
app.get('/about', function (req, res) {
   console.log("Got a GET request for /list_user");
   res.sendFile(__dirname + '/pages/about/index.html');
})

// This responds a GET request for the /list_user page.
app.get('/about', function (req, res) {
   console.log("Got a GET request for /list_user");
   res.sendFile(__dirname + '/pages/about/index.html');
})

// This responds a GET request for the /list_user page.
app.get('/goblet-not-found', function (req, res) {
   console.log("Got a GET request for /list_user");
   res.sendFile(__dirname + '/pages/goblet-not-found/index.html');
})

// This responds a GET request for abcd, abxcd, ab123cd, and so on
app.get('/ab*cd', function(req, res) {
   console.log("Got a GET request for /ab*cd");
   res.send('Page Pattern Match');
})

app.use(function(req, res, next){
  res.status(404).sendFile(__dirname + '/pages/goblet-not-found/index.html');
})

var server = app.listen(8080, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})

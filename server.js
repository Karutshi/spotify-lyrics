/*var express = require('express');
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

var http = require('http');
var url = require('url');
var dt = require('./myfirstmodule');
var fs = require('fs');
var uc = require('upper-case');
var events = require('events');

var eventEmitter = new events.EventEmitter();

var myEventHandler = function (wth) {
  console.log('I hear a scream! ' + wth);
};*/

var http = require('http');
var url = require('url');
var fs = require('fs');

var publicRequest = function(path){
  return path.substring(0, 8) == "/public/";
}

var send404Error = function(res) {
  fs.readFile(__dirname + '/pages/goblet-not-found/index.html', function(err, data){
    res.writeHead(404, {'Content-Type': 'text/html'});
    if (err) {
      res.write('Something went terribly wrong!');
      return res.end()
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
}

var servePublicFile = function(path, res){
  fs.readFile(__dirname + path, function(err, data){
    if (err) {
      return send404Error(res);
    }
    res.end(data);
  });
}

var serverfunc = function (req, res) {
  var urldata = url.parse(req.url, true);
  var path = urldata.pathname;
  console.log('Got request for ' + path);
  if (publicRequest(path)) {
    return servePublicFile(path, res);
  }
  fs.readFile(__dirname + '/pages/' + path + 'index.html', function(err, data){
    if (err) {
      return send404Error(res);
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(data);
  });
};

http.createServer(serverfunc).listen(8080);

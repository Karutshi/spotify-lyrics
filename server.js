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

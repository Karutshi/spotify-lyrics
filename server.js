var http = require('http');
var url = require('url');
var fs = require('fs');

var publicRequest = function(path){
  return path.substring(0, 8) == "/public/";
}

var spotifyLogin = function(req, res){
  var scope = 'user-read-private user-read-email';
  res.writeHead(302, {
    'Location': 'https://accounts.spotify.com/authorize?' + 'response_type=code&' + 'client_id=bf7432eaab5c4a158b93c911b150eb9b&' + 'show_dialog=true&' + 'redirect_uri=http://localhost:8080/callback'
    //add other headers here...
  });
  res.end()

  /*res.redirect('') +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));*/
}

var handleCallback = function(urldata, res){
  var params = urldata.query
  console.log(params['code']);
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('Did it!');
}

var send404Error = function(res) {
  fs.readFile(__dirname + '/pages/goblet-not-found/index.html', function(err, data){
    res.writeHead(404, {'Content-Type': 'text/html'});
    if (err) {
      res.write('Something went terribly wrong!');
      return res.end()
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(data);
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
  console.log('Got a %s request for %s', req.method, path);
  if (publicRequest(path)) {
    return servePublicFile(path, res);
  } else if (path == '/test') {
    return spotifyLogin(req, res);
  } else if (path == '/callback') {
    return handleCallback(urldata, res);
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

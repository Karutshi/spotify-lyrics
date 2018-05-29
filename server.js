var client_id = process.env.SPOTIFY_ID;
var client_secret = process.env.SPOTIFY_SECRET;
var genius_id = process.env.GENIUS_ID;
var cache_dir = process.env.CACHE_LOCATION ? process.env.CACHE_LOCATION : __dirname + '/cache/';

var http = require('http');
var url = require('url');
var fs = require('fs');
var querystring = require('querystring');
var request = require('request');
var Lyricist = require('lyricist')
var lyricist = new Lyricist(genius_id);
var jsesc = require('jsesc');

var publicRequest = function(path){
  return path.substring(0, 8) == "/public/";
}

var redirect_uri = ''

var redirect = function(res, uri) {
  console.log('Attempting to redirect to %s...', uri)
  res.writeHead(302, {
    'Location': uri
  });
  res.end();
}

var getSong = async function(urldata, res) {
  var songname = urldata.query['song'].replace(/[^\x00-\x7F]/g, "");
  songname = songname.split(" - ")[0];
  var artistname = urldata.query['artist'].replace(/[^\x00-\x7F]/g, "");
  var id = urldata.query['id'];
  var cache_path = cache_dir + id;
  if (fs.existsSync(cache_path)) {
    console.log("Cache hit! Reading song from cache...");
    fs.readFile(cache_path, function(err, data){
      if (err) {
        res.writeHead(200, {'Content-Type': 'json'});
        res.end("Could not read cached file!");
      } else {
        res.writeHead(200, {'Content-Type': 'json'});
        res.end(data);
      }});
  } else {
    var searchString = songname + ' ' + artistname;
    console.log('Cache miss! Searching Genius for \'%s\'', searchString);
    var songs = await lyricist.search(searchString);
    if (songs === undefined || songs.length == 0) {
      fs.writeFileSync(cache_path, JSON.stringify('Nothing Here'));
      res.writeHead(200, {'Content-Type': 'json'});
      res.end(JSON.stringify('Nothing Here'));
    } else {
      var song_id = songs[0].id
      var song = await lyricist.song(song_id, { fetchLyrics: true });
      fs.writeFileSync(cache_path, JSON.stringify(song.lyrics));
      console.log("Song saved to cache!");
      res.writeHead(200, {'Content-Type': 'json'});
      res.end(JSON.stringify(song.lyrics));
    }
    };
}

var accessGranted = function(urldata, res){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(urldata.pathname);
}

var spotifyLogin = function(req, res){
  var scope = 'user-read-currently-playing user-read-playback-state';
  var querystr = querystring.stringify({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    show_dialog: 'true',
    redirect_uri: redirect_uri
  });
  res.writeHead(302, {
    'Location': ('https://accounts.spotify.com/authorize?' + querystr)
    //add other headers here...
  });
  res.end();
}

var handleCallback = function(urldata, res){
  var params = urldata.query
  var song_name = 'tsh';
  var options = {
    url: 'https://api.spotify.com/v1/me/player/currently-playing',
    headers: {
      'Authorization': 'Bearer ' + params['code'],
      json: true
    }
  };
  /*request.get(options, function(error, response, body) {
    console.log('here it comes');
    console.log(body);
    });*/
    console.log('Getting Spotify tokens...');
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: params['code'],
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me/player/currently-playing',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          //console.log(body.item.name);
          redirect(res, '/#' +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            }));
        });
    }});


  /*res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('test' + song_name);
  res.end();*/
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
  redirect_uri = 'http://' + req.headers.host + '/callback'
  var urldata = url.parse(req.url, true);
  var path = urldata.pathname;
  if (publicRequest(path)) {
    return servePublicFile(path, res);
  } else if (path == '/login') {
    return spotifyLogin(req, res);
  } else if (path == '/callback') {
    return handleCallback(urldata, res);
  } else if (path.substring(0, 5) == '/song'){
    return getSong(urldata, res);
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

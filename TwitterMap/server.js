/**
 * Module dependencies.
 */
var express = require('express');
var twitter = require('twitter');
var _ = require('underscore');
var path = require('path');
var url = require("url");

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var exports = module.exports = {};
var ddb = require('dynamodb').ddb({ accessKeyId: 'AKIAIJUWSX32X2AGYI5A', secretAccessKey: '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' });

var api_key = 'UPI9M7B0qXIjWacVPxBDrtSeI';
var api_secret = 'TMfdpPxl6itogqWWQi4ku3DzkqvJoZErTqCt7hLXvpI6UrRDyY';
var access_token = '1696515506-NIpLEZMxBYtX2gclE4ZMgt7UknmKuv38RKLCL0P';
var access_token_secret = 'a3k2RjvfLuyKclkt0J8wHIMlMB9iNGevs23EBJpdVYR3U';

// Twitter symbols array.
var watchSymbols = ['apple','giants','ebola','halloween','cat','game'];//,'google','apple','twitter','facebook','microsoft',];
var init_key = watchSymbols[0];

createDB = function(keylist) {
    var key;
    keylist.forEach(function(key){
        createTableForKey(key);
    });
};

createTableForKey = function(key) {
     ddb.createTable(key, { hash: ['text', ddb.schemaTypes().string],
                                       range: ['time', ddb.schemaTypes().number] },
                                     {read: 20, write: 20}, function(err, details) {});
};

storeTweet = function(key, item) {
    ddb.putItem(key, item, {}, function(err, res, cap) {
        if(err){
            console.log(err);
        }
    });
};

createDB(watchSymbols);

//Generic Express setup
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//default to init_key
app.get('/', function(req, res) {
     ddb.scan(init_key, {}, function(err, db_res) {
        if(err) {
            console.log(err);
        } else {
            //console.log(db_res.count);
            res.render('index', {'data': db_res.items});
        }
    });
});

app.get('/changekeyword', function(req, res) {
    var params = url.parse(req.url, true).query;
    ddb.scan(params.keyword, {}, function(err, db_res) {
        if(err) {
            console.log(err);
        } else {
            //console.log(db_res.count);
            res.send(db_res.items);
        }
    });
});

// Instantiate the twitter connection
var t = new twitter({
    consumer_key: api_key,
    consumer_secret: api_secret,
    access_token_key: access_token,
    access_token_secret: access_token_secret
});

// Tell the twitter API to filter on the watchSymbols
t.stream('statuses/filter', { track: watchSymbols }, function(stream) {

  stream.on('data', function(tweet) {

    if (tweet.text !== undefined && tweet.geo !== null) {

      var text = tweet.text.toLowerCase();

      _.each(watchSymbols, function(v) {
          if (text.indexOf(v.toLowerCase()) !== -1) {
              var item = {
                text: tweet.text,
                time: (new Date()).getTime(),
                latitude: tweet.coordinates.coordinates[1],
                longitude: tweet.coordinates.coordinates[0],
                username: tweet.user.name,
                screenname: tweet.user.screen_name
              };
              storeTweet(v, item);
              io.emit('data', {key: v, payload: item});
          }
      });
    }
  });
});

//Create the server
http.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
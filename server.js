/**
 * Module dependencies.
 */
var express = require('express');
var twitter = require('twitter');
var cronJob = require('cron').CronJob;
var _ = require('underscore');
var path = require('path');
//var db = require("./dynamodb.js");

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var exports = module.exports = {};
var async = require('async');
var ddb = require('dynamodb').ddb({ accessKeyId: 'AKIAJJ3WODX2NBYVCBSQ', secretAccessKey: '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' });

var api_key = 'UPI9M7B0qXIjWacVPxBDrtSeI';
var api_secret = 'TMfdpPxl6itogqWWQi4ku3DzkqvJoZErTqCt7hLXvpI6UrRDyY';
var access_token = '1696515506-NIpLEZMxBYtX2gclE4ZMgt7UknmKuv38RKLCL0P';
var access_token_secret = 'a3k2RjvfLuyKclkt0J8wHIMlMB9iNGevs23EBJpdVYR3U';

// Twitter symbols array.
var watchSymbols = ['cloud','columbia','amazon','halloween','inbox','ebola'];//,'google','apple','twitter','facebook','microsoft',];
var current_key = watchSymbols[1];

//createDB(watchSymbols);

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

//default to cloud
app.get('/', function(req, res) {
    fetch(current_key,res);
    //res.sendfile("./index.html");
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
                location: tweet.geo.coordinates,
                username: tweet.user.name,
                screenname: tweet.user.screen_name
              };
              storeTweet(v, item);
              if(v == current_key){
                io.emit('data', item);
              }
          }
      });
    }
  });
});

//Reset everything on a new day!
//We don't want to keep data around from the previous day so reset everything.
/*new cronJob('0 0 0 * * *', function(){
    //Reset the total
    watchList.total = 0;

    //Clear out everything in the map
    _.each(watchSymbols, function(v) { watchList.symbols[v] = 0; });

    //Send the update to the clients
    sockets.sockets.emit('data', watchList);
}, null, true);*/

//Create the server
http.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


createDB = function(keylist) {
    var key;
    keylist.forEach(function(key){
        createTableForKey(key);
    });
};

createTableForKey = function(key) {
     ddb.createTable(key, { hash: ['text', ddb.schemaTypes().string],
                                       range: ['time', ddb.schemaTypes().number] },
                                     {read: 10, write: 10}, function(err, details) {});
};

storeTweet = function(key, item) {
    ddb.putItem(key, item, {}, function(err, res, cap) {
        if(err){
            console.log(err);
        }
    });
};

fetch = function(key, res){
    ddb.scan(key, {}, function(err, db_res) {
        if(err) {
            console.log(err);
        } else {
            //console.log(db_res.items);
            res.render('index', {'data': db_res.items});
            /*console.log(db_res.items[0]);
            var i;
            for(i=0; i<db_res.items.length; i++){
                //console.log(db_res.items[i]);
                io.emit('data',db_res.items[i]);
            }*/
        }
    });
};

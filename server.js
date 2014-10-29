/**
 * Module dependencies.
 */
var express = require('express');
var twitter = require('twitter');
var cronJob = require('cron').CronJob;
var _ = require('underscore');
var path = require('path');
var db = require("./dynamodb.js");

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var api_key = '';
var api_secret = '';
var access_token = '';
var access_token_secret = '';

// Twitter symbols array.
var watchSymbols = ['cloud','columbia','amazon','halloween','inbox','ebola'];//,'google','apple','twitter','facebook','microsoft',];
var current_key = watchSymbols[3];

db.createDB(watchSymbols);

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
    var locations = db.fetch(current_key);
    var datapoints = {key: current_key, location: locations};
    res.render('index', {'data': datapoints});
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
              db.storeTweet(v, item);
              console.log(item);
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

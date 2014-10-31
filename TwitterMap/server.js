/**
 * Module dependencies.
 */
var express = require('express');
var twitter = require('twitter');
var cronJob = require('cron').CronJob;
var _ = require('underscore');
var path = require('path');
var url = require("url");
var async = require("async");
//var db = require("./dynamodb.js");

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var exports = module.exports = {};
var async = require('async');
var ddb = require('dynamodb').ddb({ accessKeyId: '',
secretAccessKey: '' });

var api_key = '';
var api_secret = '';
var access_token = '';
var access_token_secret = '';

// Twitter symbols array.
var watchSymbols = ['amazon','giants','ebola','halloween','cat','game'];//,'google','apple','twitter','facebook','microsoft',];
var tableName = 'tweets';
var init_key = watchSymbols[3];

createDB = function(key) {
     ddb.createTable(key, { hash: ['keyword', ddb.schemaTypes().string],
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

createDB(tableName);

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
     //res.render('index');
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
            console.log(db_res.count);
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
                keyword: v,
                text: tweet.text,
                time: (new Date()).getTime(),
                latitude: tweet.coordinates.coordinates[1],
                longitude: tweet.coordinates.coordinates[0],
                username: tweet.user.name,
                screenname: tweet.user.screen_name
              };
              storeTweet(tableName, item);
              io.emit('data', {key: v, payload: item});
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


/*example for async query*/
var option = {limit: 5, consistentRead: true, rangeKeyCondition: {"between": [1414687170000,1414687180000]}, scanIndexForward: true};
var keyName = 'halloween';
var d;

async.doUntil(function(callback){
    ddb.query('tweets', 'halloween', option, function(err,data){
        if(err) {
            callback(err);
        } else {
            console.log(data);
            option.exclusiveStartKey = data.lastEvaluatedKey;
            d = data.lastEvaluatedKey;
        }
        callback(false);
    });
}, function() {
        return isEmpty(d);
    }, function(err) { if(err) console.log(err)});

// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj === null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}

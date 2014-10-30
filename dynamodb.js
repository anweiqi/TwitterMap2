var exports = module.exports = {};
var async = require('async');
var ddb = require('dynamodb').ddb({ accessKeyId: 'AKIAJJ3WODX2NBYVCBSQ', secretAccessKey: '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' });

exports.createDB = function(keylist) {
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

exports.storeTweet = function(key, item) {
    ddb.putItem(key, item, {}, function(err, res, cap) {
        if(err){
            console.log(err);
        }
    });
};

exports.fetch = function(key, res){
    ddb.scan(key, {}, function(err, db_res) {
        if(err) {
            console.log(err);
        } else {
            //console.log(db_res.items);
            res.render('index', {'data': db_res.items});
        }
    });
};

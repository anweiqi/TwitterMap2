var exports = module.exports = {};
var ddb = require('dynamodb').ddb({ accessKeyId: '',
secretAccessKey: '' });

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

exports.fetch = function(key){
    ddb.scan(key, {}, function(err, res) {
    if(err) {
      console.log(err);
    } else {
      console.log(res);
      return res;
    }
 });
};

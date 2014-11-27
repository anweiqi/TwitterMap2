var SQS = require("aws-sqs");
var sqs = new SQS('', '');

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
var sns = new AWS.SNS();

var ddb = require('dynamodb').ddb({ accessKeyId: '', secretAccessKey: '' });

var queueName = '/350182859835/TweetsQueue';

var AlchemyAPI = require('alchemyapi_node');
var alchemyapi = new AlchemyAPI();

/*sqs.createQueue('TweetsQueue', function(err, res) {
  if(err) {
    //handle error
  }
  queueName = res;
  console.log(res); // something like /158795553855/testTimeoutQueue
});*/

var operate = function(){

    sqs.receiveMessage(queueName, function(err, res) {
    if(err) {
        console.log(err);
    } else if(res !== null){
        var message =  JSON.parse(res[0].Body);
        //console.log(message);
        /*sqs.deleteMessage(queueName, res[0].ReceiptHandle, function(err, res) {
            if(err) {
                console.log(err);
            }
        });*/
        alchemyapi.sentiment("text", message.payload.text, {}, function(response) {
            //console.log(response);
            if(response.hasOwnProperty('docSentiment')){
                //console.log(response.language);
                //console.log(response["docSentiment"]["type"]);
                message.payload.sentiment = response["docSentiment"]["type"];

                sns.publish({
                    TargetArn:'arn:aws:sns:us-east-1:350182859835:TweetsSentiment',
                    Message:JSON.stringify(message),
                    Subject: "Sentiment"},
                    function(err,data){
                        if (err){
                            console.log("Error sending a message: "+err);
                        }else{
                            operate();
                            console.log("Sent message: "+data.MessageId);
                        }
                    });
            }else{
                message.payload.sentiment = "positive";

                sns.publish({
                    TargetArn:'arn:aws:sns:us-east-1:350182859835:TweetsSentiment',
                    Message:JSON.stringify(message),
                    Subject: "Sentiment"},
                    function(err,data){
                        if (err){
                            console.log("Error sending a message: "+err);
                        }else{
                            operate();
                            console.log("Sent message: "+data.MessageId);
                        }
                    });
                operate();
            }
            //console.log(response);
        });

    }
});

};

operate();


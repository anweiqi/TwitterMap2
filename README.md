TwitterMap
==========

Features:

1. Server side written in node.js, front-end using html/css/javascript and semantic framework. 
2. Using Twitter Live API to read a stream of tweets and store the “keyword”, “time”, “latitude”, “longitude”, “screen_name”, “text”, “username” field in DynamoDB
3. Using socket.io to emit real time tweets to front end
4. Support two kinds of maps: Scatter Plot and HeatMap (Show density with color gradient) (Select through a drop down box)
5. Use a filter that allows a drop down keywords to choose from and only shows twits with those keywords on a google map
6. In the scatter plot, when a new tweet is received, use an drop animation to place the new marker on the map
7. Also shows the last update time of the map
8. Use the Elastic Beanstalk API to create, configure, and deploy an application instance programmatically and use the Elastic LoadBalancing API to configure load balancing on Elastic Beanstalk created.

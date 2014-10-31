TwitterMap
==========

Environment/Introduction:

1. Server side written in node.js, front-end using html/css/javascript and semantic framework.
2. Using Twitter Live API to read a stream of tweets and store the “keyword”, “time”, “latitude”, “longitude”, “screen_name”, “text”, “username” field in DynamoDB
3. Using socket.io to emit real time tweets to front end

==========

Steps to run the project:

a. The project is deployed using Elastic Beanstalk and can be accessed through link

b. Run the code locally:

1. git  clone https://github.com/anweiqi/TwitterMap.git
2. cd TwitterMap/TwitterMap
3. node server.js (make sure node is installed on your computer)
4. open you browser and connect to localhost:3000
5. play around

==========

New/Creative Features:

1. Support two kinds of maps (Select through a drop down box): Scatter Plot and HeatMap (Show density with color gradient, you can see where people tweet most on the heatmap)
2. In the scatter plot, when a new tweet is received, use an drop animation to place the new marker on the map
3. When you put the mouse on the marker, it displays the tweet text.
4. Also shows the last update time of the map
5. Use the Elastic Beanstalk API to create, configure, and deploy an application instance programmatically and use the Elastic LoadBalancing API to configure load balancing on Elastic Beanstalk created.

==========

Screenshot and Demo

We uploaded a video "demo.mov" showing how our project works.




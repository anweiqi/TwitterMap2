2nd Assignment
==========
Weiqi An (wa2198)  
Jiuyang Zhao (jz2538)

Dear TAs,  
Since AlchemyAPI quota is limited and AWS is expensive, we will not keep the application running all the time. Please send an email to our columbia emails when you are grading this assignment, we will then bring it up. Thanks :)  

refer to the link http://twittermap-jiuyangz.elasticbeanstalk.com
Demo video: 2nd_demo

1. Add another section showing the tweets number of different sentiment (green for positive, yellow for neutral, red for negative), updated in real time.

2. In the “Map Type” Dropdown menu, add another four options: “Sentiment Plot”, “Positive HeatMap”, “Negative HeatMap” and “Neutral HeatMap”, showing the corresponding map respectively. In the “Sentiment Plot”, we show the positive tweets in green markers, negative in red markers and neutral in yellow markers. All of the options are updated in real time.

3. SNS topic name: TweetsSentiment,
SQS queue name: /350182859835/TweetsQueue

screenshots:
![alt tag](https://github.com/anweiqi/TwitterMap2/blob/master/maptype_options.png)
![alt tag](https://github.com/anweiqi/TwitterMap2/blob/master/sentiment_plot.png)
![alt tag](https://github.com/anweiqi/TwitterMap2/blob/master/sentiment_heatmap.png)

First Assignment
==========

Environment/Introduction:

1. Server side written in node.js, front-end using html/css/javascript and semantic framework.
2. Using Twitter Live API to read a stream of tweets and store the “keyword”, “time”, “latitude”, “longitude”, “screen_name”, “text”, “username” field in DynamoDB
3. Using socket.io to emit real time tweets to front end

==========

Steps to run the project:

a. The project is deployed using Elastic Beanstalk and can be accessed through link http://twitterappjiuyangz.elasticbeanstalk.com

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




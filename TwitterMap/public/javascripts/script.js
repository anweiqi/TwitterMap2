var map, heatmap, maptype = 0;
var pointArray = new google.maps.MVCArray();
var positiveArray = new google.maps.MVCArray();
var negativeArray = new google.maps.MVCArray();
var neutralArray = new google.maps.MVCArray();
var markers = [];
var sentimentMarkers = [];
var current_key = "apple";

$(document).ready(function() {
    google.maps.event.addDomListener(window, 'load', initialize);
    socket = io();
    socket.on('data', function(data) {
        if(data.key == current_key){
            if(maptype == 2 || maptype == 3 || maptype == 4 || maptype == 5){
                if(data.payload.sentiment == 'positive'){
                    var positive = Number(document.getElementById("positive").innerHTML) + 1;
                    document.getElementById("positive").innerHTML = positive;
                } else if(data.payload.sentiment == 'negative'){
                    var negative = Number(document.getElementById("negative").innerHTML) + 1;
                    document.getElementById("negative").innerHTML = negative;
                } else if(data.payload.sentiment == 'neutral'){
                    var neutral = Number(document.getElementById("neutral").innerHTML) + 1;
                    document.getElementById("neutral").innerHTML = neutral;
                }
            }
            update(data.payload, google.maps.Animation.DROP);
            $('#last-update').text(new Date().toTimeString());
        }
    });
});

function update(data, animation){
    if(data.hasOwnProperty('sentiment') && maptype == 2){
        var newTweet = new google.maps.LatLng(data.latitude,data.longitude);
        pointArray.push(newTweet);

        var image;
        if(data.sentiment == 'positive'){
            image = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
            positiveArray.push(newTweet);
        } else if(data.sentiment == 'negative'){
            image = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
            negativeArray.push(newTweet);
        } else if(data.sentiment == 'neutral'){
            image = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
            neutralArray.push(newTweet);
        }

        var sentiment_marker = new google.maps.Marker({
            position: newTweet,
            map: map,
            animation: animation,
            title: data.text,
            icon: image
        });
        sentimentMarkers.push(sentiment_marker);

        var marker = new google.maps.Marker({
            position: newTweet,
            map: null,
            animation: animation,
            title: data.text
        });
        markers.push(marker);
    } else if(data.hasOwnProperty('sentiment') && (maptype == 3 || maptype == 4 || maptype == 5)){
        var newTweet = new google.maps.LatLng(data.latitude,data.longitude);
        pointArray.push(newTweet);

        var image;
        if(data.sentiment == 'positive'){
            image = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
            positiveArray.push(newTweet);
        } else if(data.sentiment == 'negative'){
            image = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
            negativeArray.push(newTweet);
        } else if(data.sentiment == 'neutral'){
            image = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
            neutralArray.push(newTweet);
        }

        var marker = new google.maps.Marker({
            position: newTweet,
            map: null,
            animation: animation,
            title: data.text
        });
        markers.push(marker);

        var sentiment_marker = new google.maps.Marker({
            position: newTweet,
            map: null,
            animation: animation,
            title: data.text,
            icon: image
        });
        sentimentMarkers.push(sentiment_marker);
    } else{
        var newTweet = new google.maps.LatLng(data.latitude,data.longitude);
        pointArray.push(newTweet);

        var marker = new google.maps.Marker({
            position: newTweet,
            map: maptype === 0?map:null,
            animation: animation,
            title: data.text
        });
        markers.push(marker);
    }
}

function initialize() {
    var myLatlng = new google.maps.LatLng(10,20);
    var mapOptions = {
        zoom: 1,
        center: myLatlng
    };
    map = new google.maps.Map(document.getElementById('map-canvas-home'), mapOptions);
    var i;
    for(i=0; i<local_data.length; i++){
        update(local_data[i], null);
    }
}

function httpGet(theUrl, val)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, true);
    xmlHttp.onload = function (e) {
        if (xmlHttp.readyState == 4) {
            if (xmlHttp.status == 200) {
                var res = JSON.parse(xmlHttp.responseText);
                for(i=0; i<res.length; i++){
                    update(res[i], null);
                }
                current_key = val;
            } else {
                console.error(xmlHttp.statusText);
            }
        }
    };
    xmlHttp.send(null);
}

// Sets the map on all markers in the array.
function setAllMap(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

function setAllSentimentMap(map) {
    for (var i = 0; i < sentimentMarkers.length; i++) {
        sentimentMarkers[i].setMap(map);
    }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setAllMap(null);
}

// Shows any markers currently in the array.
function showMarkers() {
    setAllMap(map);
}

function clearSentimentMarkers() {
    setAllSentimentMap(null);
}

function showSentimentMarkers() {
    setAllSentimentMap(map);
}

function clearData(){
    clearMarkers();
    clearSentimentMarkers();
    while(pointArray.length > 0) {
        pointArray.pop();
    }
    while(markers.length > 0) {
        markers.pop();
    }
    while(positiveArray.length > 0) {
        positiveArray.pop();
    }
    while(negativeArray.length > 0) {
        negativeArray.pop();
    }
    while(neutralArray.length > 0) {
         neutralArray.pop();
    }
    while(sentimentMarkers.length > 0) {
        sentimentMarkers.pop();
    }
}

$('.maptype').dropdown({
    onChange: function(val){
        if(val == 0 && maptype != 0) {
            clearSentimentMarkers();
             if(heatmap != null) {
                heatmap.setMap(null);
            }
            showMarkers();
            maptype = 0;
        } else if(val == 1 && maptype != 1) {
            clearMarkers();
            clearSentimentMarkers();
            if(heatmap != null) {
                heatmap.setMap(null);
            }
            heatmap = new google.maps.visualization.HeatmapLayer({
                data: pointArray
            });
            heatmap.setMap(map);
            maptype = 1;
        } else if(val == 2 && maptype != 2) {
            clearMarkers();
            if (heatmap != null) {
                heatmap.setMap(null);
            };
            showSentimentMarkers();
            maptype = 2;
        } else if(val == 3 && maptype != 3) {
            clearMarkers();
            clearSentimentMarkers();
            if(heatmap != null) {
                heatmap.setMap(null);
            }
            heatmap = new google.maps.visualization.HeatmapLayer({
                data: positiveArray
            });
            heatmap.setMap(map);
            maptype = 3;
        } else if(val == 4 && maptype != 4) {
            clearMarkers();
            clearSentimentMarkers();
            if(heatmap != null) {
                heatmap.setMap(null);
            }
            heatmap = new google.maps.visualization.HeatmapLayer({
                data: negativeArray
            });
            heatmap.setMap(map);
            maptype = 4;
        } else if(val == 5 && maptype != 5) {
            clearMarkers();
            clearSentimentMarkers();
            if(heatmap != null) {
                heatmap.setMap(null);
            }
            heatmap = new google.maps.visualization.HeatmapLayer({
                data: neutralArray
            });
            heatmap.setMap(map);
            maptype = 5;
        }
    }
});

$('.keyword').dropdown({
    onChange: function(val){
        if(val != current_key){
            document.getElementById("positive").innerHTML = 0;
            document.getElementById("negative").innerHTML = 0;
            document.getElementById("neutral").innerHTML = 0;
            current_key = "";
            clearData();
            httpGet("/changekeyword?keyword="+val, val);
        }
    }
});


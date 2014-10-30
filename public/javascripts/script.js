var map, heatmap = null, maptype = 0;
var pointArray = new google.maps.MVCArray();
var markers = [];
var current_key = "amazon";

$(document).ready(function() {
    google.maps.event.addDomListener(window, 'load', initialize);
    socket = io();
    socket.on('data', function(data) {
        if(data.key === current_key){
            update(data.payload);
            $('#last-update').text(new Date().toTimeString());
        }
    });
});

function update(data){
    var newTweet = new google.maps.LatLng(data.latitude,data.longitude);
    var marker = new google.maps.Marker({
        position: newTweet,
        map: maptype === 0?map:null,
        title: data.text
    });
    markers.push(marker);
    pointArray.push(newTweet);
}

function initialize() {
    var myLatlng = new google.maps.LatLng(10,20);
    var mapOptions = {
        zoom: 1,
        center: myLatlng
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    var i;
    for(i=0; i<local_data.length; i++){
        update(local_data[i]);
    }
}

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, true);
    xmlHttp.onload = function (e) {
  if (xmlHttp.readyState === 4) {
    if (xmlHttp.status === 200) {
      console.log(xmlHttp.responseText);
    } else {
      console.error(xmlHttp.statusText);
    }
  }
};
    xmlHttp.send( null );
}

// Sets the map on all markers in the array.
function setAllMap(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
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

function clearData(){
    heatmap.setMap(null);
    clearMarkers();
    while(pointArray.length > 0) {
        pointArray.pop();
    }
    while(markers.length > 0) {
        markers.pop();
    }
}

$('.maptype').dropdown({
    onChange: function(val){
        if(val == 1 && maptype == 0) {
            if(heatmap == null) {
                heatmap = new google.maps.visualization.HeatmapLayer({
                    data: pointArray
                });
            }
            heatmap.setMap(map);
            clearMarkers();
            maptype = 1;
        } else if(val == 0 && maptype == 1){
            heatmap.setMap(null);
            showMarkers();
            maptype = 0;
        }
    }
});

$('.keyword').dropdown({
    onChange: function(val){
        clearData();
        httpGet("/changekeyword?keyword="+val);
        /*current_key = val;
        for(i=0; i<res.length; i++){
            update(res[i]);
        }
        console.log(res);*/
    }
});

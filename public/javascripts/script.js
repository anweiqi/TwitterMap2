var map, heatmap, maptype = 0;
var pointArray = new google.maps.MVCArray();
var markers = []

$(document).ready(function() {
    google.maps.event.addDomListener(window, 'load', initialize);
    socket = io();
    socket.on('data', function(data) {
        update(data);
        $('#last-update').text(new Date().toTimeString());
    });
});

function update(data){
    var newTweet = new google.maps.LatLng(data.location[0],data.location[1]);
    var marker = new google.maps.Marker({
        position: newTweet,
        map: maptype == 0?map:null,
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
    //var history_points = $("#data").val();
    //console.log(history_points);
    var i;
    for(i=0; i<local_data.length; i++){
        update(local_data[i]);
    }
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


$('.maptype').dropdown({
    onChange: function(val){
        if(val == 1 && maptype == 0) {
            heatmap = new google.maps.visualization.HeatmapLayer({
                data: pointArray
            });
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

$('.keyword').dropdown();

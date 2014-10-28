var map;
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
        map: map,
        title: data.text
    });
}

function initialize() {
    var myLatlng = new google.maps.LatLng(0,0);
    var mapOptions = {
        zoom: 1,
        center: myLatlng
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

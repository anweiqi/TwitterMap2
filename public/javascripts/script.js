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
        title: data.location[0]+", "+data.location[1]
    });
    if(data.location[0]<-100){
        console.log(data.location[0]+", "+data.location[1]);
    }
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

$('.ui.dropdown')
    .dropdown();

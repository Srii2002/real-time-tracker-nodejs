const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`Sending location: Latitude: ${latitude}, Longitude: ${longitude}`);
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.log(error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
}

const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    console.log(`Received location: ID: ${id}, Latitude: ${latitude}, Longitude: ${longitude}`);
    map.setView([latitude, longitude], 16);

    if (!markers[id]) {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    } else {
        markers[id].setLatLng([latitude, longitude]);
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        markers[id].remove();
        delete markers[id];
    }
});

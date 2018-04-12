/* globals io: true */
let socket = io.connect(); 
socket.on('broad', function (data) {
    // console.log(JSON.stringify(data));
    console.log(data);
}); 
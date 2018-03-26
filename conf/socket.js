module.exports = (app, server) => {
    const io = require('socket.io')(server);
    io.on('connection', function(client) {  
        client.on('join', function(data) {
            console.log(data);
        });

        client.on('messages', function(data) {
            console.log(data);
            client.emit('broad', data);
            client.broadcast.emit('broad', data);
        });
    });
    app.use(function(req,res,next){
        req.io = io;
        next();
    });
    return io;
};
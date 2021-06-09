function socketIO(){
    io.sockets.on('connection', (socket) => {
        console.log('socket.io connected');
    });
};

module.exports = socketIO;
var express = require('express');
var http = require('http');
var cors = require('cors');
var Server = require('socket.io').Server;
var path = require('path');
var app = express();
var server = http.createServer(app);
var io = new Server(server, {
    cors: {
        origin: "http://localhost:4200"
    }
});
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/room1', function (req, res) {
    res.sendFile(path.join(__dirname, 'room1.html'));
});
app.get('/room2', function (req, res) {
    res.sendFile(path.join(__dirname, 'room2.html'));
});
var connectedSockets = {};
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('getName', function (name) {
        socket.name = name;
        connectedSockets[socket.id] = { id: socket.id, name: name };
        console.log("Socket with ID ".concat(socket.id, " is named ").concat(socket.name));
        io.emit('connectedUsers', Object.values(connectedSockets));
        console.log(connectedSockets);
    });
    socket.on('join room', function (room) {
        socket.join(room);
        console.log("".concat(socket.name || 'A user', " joined room ").concat(room));
    });
    socket.on('angular', function (data) {
        console.log(data);
    });
    socket.on('chat message', function (data) {
        io.to(data.room).emit('chat message', { name: socket.name, msg: data.msg });
    });
    socket.on('disconnect', function () {
        console.log("".concat(socket.name || 'A user', " disconnected"));
        delete connectedSockets[socket.id];
        io.emit('connectedUsers', Object.values(connectedSockets));
        console.log(connectedSockets);
    });
});
server.listen(3000, function () {
    console.log('server running at http://localhost:3000');
});

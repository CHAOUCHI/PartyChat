const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200"
    }
});

app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/room1', (req, res) => {
    res.sendFile(path.join(__dirname, 'room1.html'));
});

app.get('/room2', (req, res) => {
    res.sendFile(path.join(__dirname, 'room2.html'));
});

const connectedSockets = {};

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('getName', (name) => {
        socket.name = name;
        connectedSockets[socket.id] = { id: socket.id, name: name };
        console.log(`Socket with ID ${socket.id} is named ${socket.name}`);
        io.emit('connectedUsers', Object.values(connectedSockets));
        console.log(connectedSockets);
    });

    socket.on('join room', (room) => {
        socket.join(room);
        console.log(`${socket.name || 'A user'} joined room ${room}`);
    });

    socket.on('angular', (data) => {
        console.log(data);
    });

    socket.on('chat message', (data) => {
        io.to(data.room).emit('chat message', { name: socket.name, msg: data.msg });
    });

    socket.on('disconnect', () => {
        console.log(`${socket.name || 'A user'} disconnected`);
        delete connectedSockets[socket.id];
        io.emit('connectedUsers', Object.values(connectedSockets));
        console.log(connectedSockets);
    });
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});

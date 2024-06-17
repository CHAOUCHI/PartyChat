const express = require('express');
const http = require('http');
const cors = require('cors')
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors([]))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/room1', (req, res) => {
    res.sendFile(path.join(__dirname, 'room1.html'));
});

app.get('/room2', (req, res) => {
    res.sendFile(path.join(__dirname, 'room2.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected');

    
    socket.on('getName', (name) => {
        socket.name = name;  
        console.log(`Socket with ID ${socket.id} is named ${socket.name}`);
    });

    socket.on('join room', (room) => {
        socket.join(room);
        console.log(`${socket.name || 'A user'} joined room ${room}`);
    });

    socket.on('chat message', (data) => {
        io.to(data.room).emit('chat message', { name: socket.name, msg: data.msg });
    });

    socket.on('disconnect', () => {
        console.log(`${socket.name || 'A user'} disconnected`);
    });
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});

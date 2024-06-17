const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

app.get('/room1', (req, res) => {
    res.sendFile(join(__dirname, 'room1.html'))
})

app.get('/room2', (req, res) => {
    res.sendFile(join(__dirname, 'room2.html'))
})

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join room', (room) => {
        socket.join(room);
        console.log('user joined room $(room)')
    })

    socket.on('chat message', (data) => {
        io.to(data.room).emit('chat message', data.msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// this will emit the event to all connected sockets
// io.emit('hello', 'world'); 

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
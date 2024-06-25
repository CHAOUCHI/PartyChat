import { Server } from 'socket.io';

const connectedSockets: { [key: string]: { id: string; name: string } } = {};

export default function socketServer(io: Server) {
    io.on('connection', (socket) => {
        console.log('a user connected');

        socket.emit('your id', socket.id);

        socket.on('getName', (name) => {
            socket.data.name = name;
            connectedSockets[socket.id] = { id: socket.id, name: name };
            console.log(`Socket with ID ${socket.id} is named ${socket.data.name}`);
            io.emit('connectedUsers', Object.values(connectedSockets));
            console.log(connectedSockets);
        });

        socket.on('join room', (room) => {
            socket.join(room);
            console.log(`${socket.data.name || 'A user'} joined room ${room}`);
        });

        socket.on('leave room', (room) => {
            socket.leave(room)
            console.log(`${socket.data.name || 'A user'} left room ${room}`)
        });

        socket.on('angular', (data) => {
            console.log(data);
        });

        socket.on('chat message', (data) => {
            console.log(data);
            io.to(data.room).emit('chat message', { room: data.room, name: socket.data.name, msg: data.msg, idSender: data.idSender, IDs: data.IDs });
        });

        socket.on('disconnect', () => {
            const disconnectedUserId = socket.id;
            delete connectedSockets[socket.id];
            console.log(Object.values(connectedSockets));
            io.emit('userDisconnected', disconnectedUserId);
        });
    });
}

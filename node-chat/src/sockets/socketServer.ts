import { off } from 'node:process';
import { Server } from 'socket.io';
import { Offer } from '../interface/offersInterface';

const connectedSockets: { [key: string]: { id: string; name: string } } = {};

const offers: RTCSessionDescriptionInit[] = []

export default function socketServer(io: Server) {
  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.emit('your id', socket.id);

    socket.on('getName', (name) => {
      socket.data.name = name;
      connectedSockets[socket.id] = { id: socket.id, name: name };
      console.log(`Socket with ID ${socket.id} is named ${socket.data.name}`);
      io.emit('connectedUsers', Object.values(connectedSockets));
    });

    socket.on('join room', (room, callback) => {
      socket.join(room);
      callback({
        status: "1",
        message: "Done"
      });
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

    socket.on('offer', (offer) => {
      offers.push(offer)
      socket.broadcast.emit('offer', offer);
    });

    socket.on('answer', (answer) => {
      socket.broadcast.emit('answer', answer);
    });

    socket.on('candidate', (candidate) => {
      socket.broadcast.emit('candidate', candidate);
    });

  });
}

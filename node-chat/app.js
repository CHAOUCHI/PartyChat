var express = require('express');
var http = require('http');
var cors = require('cors');
var Server = require('socket.io').Server;
var path = require('path');
var jwt = require("jsonwebtoken");
var secret = "secret-for-jwt";
var cookieParser = require("cookie-parser");
var app = express();
var server = http.createServer(app);
var io = new Server(server, {
    cors: {
        origin: "http://localhost:4200"
    }
});
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));
/*  JWT  */
app.post("/login", function (req, res) {
    var payload = { name: "esteban", role: "admin" };
    var newToken = jwt.sign(payload, secret);
    res.cookie("token", newToken, { httpOnly: true });
    return res.json({ msg: '☺' });
});
app.post("/product", checkJwt, function (req, res) {
    // ...
    res.status(200).json({ content: 'some content' });
});
function checkJwt(req, res, next) {
    var token = req.cookies.token; // Lire les cookies plutôt que le body.
    jwt.verify(token, secret, function (err, decodedToken) {
        if (err) {
            res.status(401).json("Unauthorized, wrng token");
            return;
        }
        switch (decodedToken.role) {
            case "admin":
                next();
                break;
            case "guest":
            default:
                res.status(401).json({ msg: "Unauthorized role" });
                break;
        }
    });
}
/* SOCKET IO */
var connectedSockets = {};
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.emit('your id', socket.id);
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
    socket.on('leave room', function (room) {
        socket.leave(room);
        console.log("".concat(socket.name || 'A user', " leaved room ").concat(room));
    });
    socket.on('angular', function (data) {
        console.log(data);
    });
    socket.on('chat message', function (data) {
        console.log(data);
        io.to(data.room).emit('chat message', { room: data.room, name: socket.name, msg: data.msg, idSender: data.idSender, IDs: data.IDs });
    });
    socket.on('disconnect', function () {
        var disconnectedUserId = socket.id;
        delete connectedSockets[socket.id];
        console.log(Object.values(connectedSockets)); // Log the remaining connected sockets
        io.emit('userDisconnected', disconnectedUserId); // Emit the userId instead of the array
    });
});
server.listen(3000, function () {
    console.log('server running at http://localhost:3000');
});

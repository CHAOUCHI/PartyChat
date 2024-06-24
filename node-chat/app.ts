const express = require('express');
const http = require('http');
const cors = require('cors');
// const { Server } = require('socket.io');
const path = require('path');
// const jwt = require("jsonwebtoken");
const secret = "secret-for-jwt"
const cookieParser = require("cookie-parser");
import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
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

app.post("/login", (req: Request,res: Response)=>{
    const payload = { name: "esteban", role: "admin"};
    const newToken = jwt.sign(payload,secret)

    res.cookie("token",newToken,{httpOnly:true});

    return res.json({msg : '☺'})
})

app.post("/product",checkJwt,(req: Request,res: Response)=>{
    // ...
    res.status(200).json({content: 'some content'});
 })

function checkJwt(req: Request,res: Response,next: NextFunction){
    
    const token = req.cookies.token; // Lire les cookies plutôt que le body.

    // const decodedToken = jwt_decode(token)

    jwt.verify(token,secret,(err: unknown,decodedToken: any)=>{
        if(err){
            res.status(401).json("Unauthorized, wrng token");
            return;
        }
        switch (decodedToken.role){
            case "admin":
                next();
                break;

            case "guest":
            default:
                res.status(401).json({msg:"Unauthorized role"});
                break;
        }
    })
}

/* SOCKET IO */

const connectedSockets: { id: string, name: string }[]= [];

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
        console.log(`${socket.data.name || 'A user'} leaved room ${room}`)
    })

    socket.on('angular', (data) => {
        console.log(data);
    });

    socket.on('chat message', (data) => {
        console.log(data);
        io.to(data.room).emit('chat message', { room:data.room, name: socket.data.name, msg: data.msg, idSender: data.idSender,IDs: data.IDs });
    });

    socket.on('disconnect', () => {
        const disconnectedUserId = socket.id;
        delete connectedSockets[socket.id];
        console.log(Object.values(connectedSockets)); // Log the remaining connected sockets
        io.emit('userDisconnected', disconnectedUserId); // Emit the userId instead of the array
    });
    
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});


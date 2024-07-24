import express from 'express';
import https from 'https'; // Import the 'https' module
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import fs from 'fs'; // Import the 'fs' module to read files
import authRoutes from './routes/authRoutes';
import socketServer from './sockets/socketServer';

const app = express();

// Load SSL certificate and key
const sslOptions = {
    key: fs.readFileSync('../node-chat/ssl/cert.key'),
    cert: fs.readFileSync('../node-chat/ssl/cert.crt')
};

// Create HTTPS server
const server = https.createServer(sslOptions, app);

const allowedOrigin = true; // Update with your frontend's IP and port

const io = new Server(server, {
    cors: {
        origin: allowedOrigin,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});

app.use(cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(authRoutes);

// Socket.IO Server
socketServer(io);

// Start server
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

server.listen(PORT, () => {
    console.log(`Server running at https://192.168.10.113:${PORT}`);
});

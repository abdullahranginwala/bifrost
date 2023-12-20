import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import * as dotenv from "dotenv";
import { chatRouter } from "./routes/chatRoutes";
import { router } from "./routes/userRoutes";
import { Server as WebSocketServer } from 'ws';
import http from 'http';
import { authRouter } from "./contollers/User";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(chatRouter);
app.use(router);

app.use('/auth', authRouter);

// Create an HTTP server
const server = http.createServer(app);

// Attach WebSocket server to HTTP server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  console.log('A user connected to WebSocket');
  console.log('Client IP:', req.socket.remoteAddress);
  const ip = req.socket.remoteAddress;

  ws.on('message', (message) => {
    console.log('Received message:', message.toString());
  });

  ws.on('close', () => {
    console.log('A user disconnected from WebSocket');
    // Handle WebSocket disconnection here
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

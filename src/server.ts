import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import * as dotenv from "dotenv";
import { chatRouter } from "./routes/chatRoutes";
import { Server as WebSocketServer } from 'ws';
import WebSocket from 'ws';
import http from 'http';
import jwt from "jsonwebtoken";
import { authRouter } from "./routes/authRoutes";
import { User } from "./models/User";
import { Chat } from "./models/Chat";
import { Message } from "./models/Message";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRouter);
app.use('/api', chatRouter);

// Create an HTTP server
const server = http.createServer(app);

// Attach WebSocket server to HTTP server
const wss = new WebSocketServer({ server });

const activeConnections = new Map<string, WebSocket>();

wss.on('connection', async (ws, req) =>  {
  const token = new URL(req.url, `http://${req.headers.host}`).searchParams.get('token');
    
  if (!token) {
      ws.close(); // No token provided
      return;
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET) as { username: string };
    const user = await User.findOne({ username: decoded.username });

    if (!user) {
        ws.close(); // User not found
        return;
    }

    activeConnections.set(user._id.toString(), ws);

    ws.on('message', async (message) => {
        const { chatId, content } = JSON.parse(message.toString());
        const chat = await Chat.findById(chatId).populate('participants');

        if (!chat) {
            ws.send(JSON.stringify({ error: 'Chat not found' }));
            return;
        }

        const newMessage = await Message.create({
            sender: user._id,
            content,
            chat: chatId
        });

        chat.participants.forEach((participant) => {
            const participantWs = activeConnections.get(participant._id.toString());
            if (participantWs && participantWs.readyState === WebSocket.OPEN) {
                participantWs.send(JSON.stringify(newMessage));
            }
        });
    });

    ws.on('close', () => {
        activeConnections.delete(user._id.toString());
    });
} catch (error) {
    ws.close(); // Invalid token
}

});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

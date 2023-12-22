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
import { Redis } from "ioredis";
import { UserServerMapping } from "./models/UserServerMapping";

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

const redisPublisher = new Redis(process.env.REDIS_URL);
const redisSubscriber = new Redis(process.env.REDIS_URL);

const SERVER_ID = process.env.SERVER_ID; 

redisSubscriber.subscribe(`chat_channel_${SERVER_ID}`);

redisSubscriber.on('message', (channel, message) => {
  console.log(`Received message from ${channel}: ${message}`);

  // Parse the message
  const parsedMessage = JSON.parse(message);

  // Forward the message to the appropriate WebSocket connections
  parsedMessage.participants.forEach(participantId => {
    const participantWs = activeConnections.get(participantId);
    if (participantWs && participantWs.readyState === WebSocket.OPEN) {
      participantWs.send(JSON.stringify({
        chatId: parsedMessage.chatId,
        content: parsedMessage.content,
        sender: parsedMessage.sender
      }));
    }
  });
});

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

    console.log(`User ${user.username} connected`);
    console.log(`Connected to ${SERVER_ID}`);

    activeConnections.set(user._id.toString(), ws);
    UserServerMapping.create({ userId: user._id.toString(), serverId: SERVER_ID });

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

        let servers: { [key: string]: string[] } = {};

        for (const participant of chat.participants) {
          const serverId = (await UserServerMapping.findOne({ userId: participant._id.toString() })).serverId;
          if (!servers[serverId]) {
            servers[serverId] = [];
          }
          servers[serverId].push(participant._id.toString());
        }

        for (const serverId in servers) {
          const users = servers[serverId];
          redisPublisher.publish(`chat_channel_${serverId}`, JSON.stringify({
            chatId,
            content,
            sender: user._id.toString(),
            participants: users
          }));
          console.log(`Published message to chat_channel_${serverId}`);
        }
    });

    ws.on('close', () => {
        activeConnections.delete(user._id.toString());
        UserServerMapping.deleteOne({ userId: user._id.toString() });
    });
} catch (error) {
    ws.close(); // Invalid token
}

});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

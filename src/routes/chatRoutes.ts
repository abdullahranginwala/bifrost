import { Chat } from '../models/Chat';
import { authenticate } from '../middleware/auth';
import { Router } from 'express'
import { IMessage, Message } from '../models/Message';

export const chatRouter = Router();

chatRouter.post('/send', authenticate, async (req, res) => {
    try {
        const { userId, chatId, content } = req.body;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).send('Chat not found');
        }

        const isParticipant = chat.participants.includes(userId);
        if (!isParticipant) {
            return res.status(403).send('User is not a participant of the chat');
        }

        const message = new Message({
            sender: userId,
            content,
            chat: chatId
        });
        await message.save();

        res.status(201).send('Message sent');
    } catch (error) {
        // Handle possible errors
        res.status(500).send('Internal Server Error');
    }
});

chatRouter.post('/create-group', authenticate, async (req, res) => {
    const { name, userIds } = req.body;

    const chat = new Chat({ name, participants:userIds });
    await chat.save();

    res.status(201).send('Group created');
});

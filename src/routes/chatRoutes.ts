import { Chat } from '../models/Chat';
import { authenticate } from '../middleware/auth';
import { Router } from 'express'
import { IMessage, Message } from '../models/Message';
import { User } from '../models/User';

export const chatRouter = Router();

chatRouter.post('/create-group', authenticate, async (req, res) => {
    const { name, userIds } = req.body;

    const chat = new Chat({ name, participants:userIds });
    await chat.save();

    try {
        await addUsersToChat(chat._id, userIds);
        res.status(201).send(chat);
    } catch (error) {
        res.status(404).send(error.message);
    }
});


chatRouter.post('/add-to-group', authenticate, async (req, res) => {
    const { userId, chatId, userIds } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).send('Chat not found');
    }

    if(chat.participants.indexOf(userId) === -1) {
        return res.status(403).send('User is not a participant of the chat');
    }

    try {
        await addUsersToChat(chatId, userIds);
        res.status(200).send('Users added to the group');
    } catch (error) {
        res.status(404).send(error.message);
    }
});

async function addUsersToChat(chatId, userIds) {
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
        throw new Error('One or more users not found');
    }

    await Promise.all(users.map(async (user) => {
        user.chats.push(chatId);
        await user.save();
    }));
}


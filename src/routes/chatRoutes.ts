import { Chat } from '../models/Chat';
import { authenticate } from '../middleware/auth';
import { Router } from 'express'

export const router = Router();

router.post('/send', authenticate, async (req, res) => {
    const { recipientId, content } = req.body;
    let chat = await Chat.findOne({ participants: { $all: [req.userId, recipientId] } });

    if (!chat) {
        chat = new Chat({ participants: [req.userId, recipientId], messages: [] });
    }

    chat.messages.push({
        sender: req.userId,
        content,
        timestamp: new Date(),
    });

    await chat.save();
    res.status(201).send('Message sent');
});

router.post('/create-group', authenticate, async (req, res) => {
    const { participants } = req.body;

    const chat = new Chat({ participants, messages: [] });
    await chat.save();

    res.status(201).send('Group created');
});

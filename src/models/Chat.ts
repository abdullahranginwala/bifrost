import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [
        {
            sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            content: String,
            timestamp: Date,
        }
    ],
});

export const Chat = mongoose.model('Chat', chatSchema);
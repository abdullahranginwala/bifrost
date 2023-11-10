import { Document, Schema, model } from "mongoose";
import { IUser } from "./User";
import { IMessage } from "./Message";

export interface IChat extends Document {
    participants: IUser['_id'][];
    messages: IMessage[];
}

const chatSchema = new Schema<IChat>({
    participants: [{type:Schema.Types.ObjectId, ref: 'User'}],
    messages: [{type:Schema.Types.ObjectId, ref: 'Message'}],
});

export const Chat = model<IChat>('Chat', chatSchema);
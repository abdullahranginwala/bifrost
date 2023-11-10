import { Document, Schema, model } from "mongoose";
import { IUser } from "./User";
import { IMessage } from "./Message";

export interface IChat extends Document {
    name?: String,
    participants: IUser['_id'][],
}

const chatSchema = new Schema<IChat>({
    name: String,
    participants: [{type:Schema.Types.ObjectId, ref: 'User'}],
});

export const Chat = model<IChat>('Chat', chatSchema);
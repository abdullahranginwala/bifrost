import {Document, Schema, model} from "mongoose";
import { IChat } from "./Chat";

export interface IUser extends Document {
    username: string;
    password: string;
    chats: IChat['_id'][];
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    chats: [{type:Schema.Types.ObjectId, ref: 'Chat'}],
});

export const User = model<IUser>('User', userSchema);
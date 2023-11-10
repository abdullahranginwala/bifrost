import {Document, Schema, model} from "mongoose";
import { IUser } from "./User";
import { IChat } from "./Chat";

export interface IMessage extends Document {
    sender: IUser['_id'];
    content: string;
    timestamp: Date;
    chat: IChat['_id'];
}

const messageSchema = new Schema<IMessage>({
    sender: {type:Schema.Types.ObjectId, ref: 'User', required: true},
    content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      chat: {type:Schema.Types.ObjectId, ref: 'Chat', required: true},
});

export const Message = model<IMessage>('Message', messageSchema);
import mongoose, { Document, Schema, Model } from 'mongoose';

// Define an interface for the UserServerMapping document
interface IUserServerMapping extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  serverId: string;
}

// Create the schema
const userServerMappingSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serverId: {
    type: String,
    required: true
  }
});

// Create the model
const UserServerMapping: Model<IUserServerMapping> = mongoose.model<IUserServerMapping>('UserServerMapping', userServerMappingSchema);

export { UserServerMapping };

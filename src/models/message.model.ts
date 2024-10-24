import { Schema, model } from 'mongoose';

const MessagesSchema = new Schema({
    address: {
        type: String,
        isRequired: true,
    },
    message: {
        type: String,
        isRequired: true,
    },
});



const Messages = model('Messages', MessagesSchema);
export default Messages;

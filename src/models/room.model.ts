import { Schema, model } from 'mongoose';

const RoomsSchema = new Schema({
    room_id: {
        type: String,
        required: true,
    },

    data: Schema.Types.Mixed,
});

const Rooms = model('Rooms', RoomsSchema);
export default Rooms;

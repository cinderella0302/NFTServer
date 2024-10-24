import { Schema, model } from 'mongoose';

const RoundsSchema = new Schema({
    round_id: {
        type: String,
        required: true,
    },

    win_direction: Number,

    round_info: [
        {
            player: String,
            round_id: String,
            room_id: String,
            bet_info: [
                {
                    direction: Schema.Types.Mixed,
                    amount: String,
                },
            ],
            bet_time: Number,
        },
    ],
});

const Rounds = model('Rounds', RoundsSchema);
export default Rounds;

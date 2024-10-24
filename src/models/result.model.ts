import { Schema, model } from 'mongoose';

const ResultSchema = new Schema({
    round_id: {
        type: String,
        required: true,
    },
    bet_result: Schema.Types.Mixed,
});

const Results = model('Results', ResultSchema);
export default Results;

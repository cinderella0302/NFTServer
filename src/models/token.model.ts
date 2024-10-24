import { Schema, model } from 'mongoose';

const TokensSchema = new Schema(
    {
        id: {
            type: String,
            requried: true,
        },
        isNativeCoin: {
            type: Boolean,
            default: false,
        },
        isIBCCoin: {
            type: Boolean,
            default: false,
        },
        contractAddress: String,
        originChain: String,
        chain: {
            type: String,
            required: true,
        },
        coinName: String,
        decimal: Number,
        denom: String,
        coingeckoId: String,
    },
    { timestamps: true },
);

const Tokens = model('Tokens', TokensSchema);
export default Tokens;

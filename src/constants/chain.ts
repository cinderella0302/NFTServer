import dotenv from 'dotenv';

dotenv.config();

export const rpcEndpoint = process.env.RPC_URL;
export const restEndpoint = process.env.REST_URL;
export const chainId = process.env.CHAIN_ID;

export const sender = {
    mnemonic: process.env.DISTRIBUTED_MNEMONIC,
    address: process.env.DISTRIBUTED_ADDRESS,
};

export const prefix = process.env.PREFIX;
export const feeDenom = process.env.FEE_DENOM;

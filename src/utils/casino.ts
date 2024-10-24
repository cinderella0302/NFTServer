import { runQuery } from '../utils';
import { RouletteContract, NFTContract } from '../constants';
import Rooms from '../models/room.model';
import { getBalance } from '../utils';

const FETCH_LIMIT = 10;

export const getRoomInfoFromContract = async () => {
    let results = [];

    const fetchFunc = async (startAfter?: any) => {
        const response = await runQuery(RouletteContract, {
            get_rooms: {
                start_after: startAfter,
                limit: FETCH_LIMIT,
            },
        }).catch((e) => console.log('----- FetchRoomInfo Error: ', e));
        results = [...results, ...response.rooms];
        if (response.rooms.length === FETCH_LIMIT) {
            await fetchFunc(response.rooms[FETCH_LIMIT - 1].room_id);
        }
    };

    // console.log('debug RoomsInfo: ', results);
    try {
        await fetchFunc();
        // console.log('debug, result', results);
        for (let i = 0; i < results.length; i++) {
            const result = await runQuery(NFTContract, {
                all_nft_info: {
                    token_id: results[i].nft_id,
                },
            });
            results[i].owner = result.access.owner;
            if (results[i].game_denom.native_token) {
                results[i].liquidity = await getBalance(
                    RouletteContract,
                    results[i].game_denom.native_token.denom,
                );
            } else {
                await runQuery(results[i].game_denom.token.contract_addr, {
                    balance: {
                        address: RouletteContract,
                    },
                }).then((result) => {
                    const resultBuf = result;
                    results[i].liquidity = Number(resultBuf.balance) / 1e6;
                    console.log('balance', results[i].liquidity);
                });
            }
        }

        console.log('debug after insert owner: ', results);

        for (let i = 0; i < results.length; i++) {
            Rooms.deleteMany();
            Rooms.findOneAndUpdate(
                { room_id: results[i].room_id },
                {
                    $set: {
                        data: results[i],
                    },
                },
                { upsert: true },
            ).catch((e) => console.log('----- RoomSave in DB Error: ', e));
        }
        // return results;
    } catch (e) {
        console.log('----- GetOwner and GetLiquidity and Save Error: ', e);
    }
};

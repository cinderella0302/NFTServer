import {
    AirdropContract,
    FetchOptionInterval,
    RouletteContract,
} from './constants';
import { RetryInterval } from './constants';
import Rounds from './models/round.model';
import {
    runExecute,
    runQuery,
    getResult,
    getRoomInfoFromContract,
} from './utils';
import Rooms from './models/room.model';

const FETCH_LIMIT = 10;
const broadcastInfo = async (wss: any, Info: any) => {
    wss.clients.forEach((client) => {
        client.send(JSON.stringify(Info));
    });
};

const fetchGameInfoForRound = async (roundId: number) => {
    let result = [];

    const fetchFunc = async (startAfter?: any) => {
        const response = await runQuery(RouletteContract, {
            get_game_info_for_round: {
                round_id: roundId,
                start_after: startAfter,
                limit: FETCH_LIMIT,
            },
        })
            .then((res) => res?.bets_info || [])
            .catch((e) => console.log('FatchGameInfoForRound Error: ', e));
        result = [...result, ...response];
        if (response.length === FETCH_LIMIT) {
            await fetchFunc({
                room_id: response[FETCH_LIMIT - 1].round_id,
                player: response[FETCH_LIMIT - 1].player,
            });
        }
    };

    await fetchFunc();
    return result;
};

const fetchRoundStatus = async (wss: any) => {
    const optionStatus = await runQuery(RouletteContract, {
        all_state: {},
    })
        .then((res) => res)
        .catch(() => null);
    if (!optionStatus) {
        return null;
    }
    const livingRound = optionStatus.state.living_round;

    if (livingRound != null) {
        const usersThisRound = await fetchGameInfoForRound(livingRound);
        console.log('debug usersTHisRound : ', usersThisRound);

        broadcastInfo(wss, {
            round_id: livingRound,
            data: usersThisRound,
            type: 'RoundStatus',
        });

        Rounds.findOneAndUpdate(
            { round_id: livingRound },
            {
                round_info: usersThisRound,
            },
            {
                upsert: true,
            },
        ).then(() => {});
    }
    return optionStatus;
};

const fetchAirdropStatus = async (wss: any) => {
    const airdropConfig = await runQuery(AirdropContract, {
        get_state_info: {},
    })
        .then((res) => res)
        .catch(() => null);

    const airdropState = await runQuery(AirdropContract, {
        get_sale_info: {},
    })
        .then((res) => res)
        .catch(() => null);

    if (!airdropConfig || !airdropState) {
        return null;
    }

    let airdropPercent = 0;

    if (!airdropConfig.total_supply) airdropPercent = 0;
    else {
        airdropPercent =
            (Number(airdropState.total_airdropped_amount) /
                Number(airdropConfig.total_supply)) *
            100;
    }

    broadcastInfo(wss, {
        airdropPercent: airdropPercent,
        type: 'AirdropStatus',
    });
};

const mainLogic = async (wss: any) => {
    const optionStatus = await fetchRoundStatus(wss);
    await fetchAirdropStatus(wss);

    if (!optionStatus) {
        setTimeout(mainLogic, RetryInterval, wss);
        return;
    }

    const livingRoundId = optionStatus.state?.living_round;
    // const currentRoomId = optionStatus.state?.room_id;
    optionStatus.type = 'information';
    broadcastInfo(wss, optionStatus);

    getRoomInfoFromContract().then(() => {
        Rooms.find({}, { _id: 0 }).then(async (result) => {
            const resultBuf = result;
            wss.clients.forEach((client) => {
                client.send(
                    JSON.stringify({
                        data: resultBuf,
                        type: 'room_info',
                    }),
                );
            });
        });
    });

    const liveCloseTime = optionStatus.round_start_second + 120;
    const currentTime = optionStatus.crr_time;

    if (optionStatus.round_start_second == 0) {
        console.log(`----- NOT STARTED BETTING -----`);
        setTimeout(mainLogic, FetchOptionInterval, wss);
        return;
    } else {
        try {
            const remainTime = liveCloseTime - currentTime;
            console.log(`----- REMAIN TIME: ${remainTime} -----`);
            if (remainTime > 0) {
                console.log('----- NOT CLOSED CURRENT ROUND -----');
                setTimeout(mainLogic, FetchOptionInterval, wss);
                return;
            }
        } catch (e) {
            console.log('RemainTime Error', e.message);
        }
    }

    console.log('----- CLOSED CURRENT ROUND -----');
    try {
        await runExecute(RouletteContract, {
            close_round: {},
        });
        console.log('after runExecute');
        const winDirection = await runQuery(RouletteContract, {
            get_winner_round: {
                round_id: livingRoundId,
            },
        });
        console.log('debug', winDirection);
        getResult(Number(winDirection.winner.winner), wss);
    } catch (e) {
        console.log('CloseRound : Error', e);

        const winDirection = await runQuery(RouletteContract, {
            get_winner_round: {
                round_id: livingRoundId,
            },
        });
        console.log('debug', winDirection);
        if (winDirection.winner.winner != 40) {
            getResult(Number(winDirection.winner.winner), wss);
        }
    } finally {
        setTimeout(mainLogic, FetchOptionInterval, wss);
    }
};

export default mainLogic;

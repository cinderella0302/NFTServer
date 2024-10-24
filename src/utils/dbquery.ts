import Messages from '../models/message.model';
import Rounds from '../models/round.model';
import Results from '../models/result.model';
import Rooms from '../models/room.model';
import { getDataFromDB } from './async';

export const saveMessages = async (message) => {
    const jsonData = JSON.parse(message);
    const newMessages = new Messages({
        address: jsonData.address,
        message: jsonData.message,
    });
    console.log('debug jsonData: ', jsonData.message);
    newMessages.save();
};

export const readMessages = async () => {
    console.log('read Messages');
    await Messages.find({}, { _id: 0, address: 1, message: 1 })
        .sort({ _id: -1 })
        .limit(10)
        .then(async (result) => {
            return result;
        })
        .catch((e) => console.log(e));
};

export const getResult = async (winner: number, wss: any) => {
    Rounds.findOne({}, { round_id: 1, round_info: 1 })
        .sort({ _id: -1 })
        .then(async (result) => {
            const resultBuf = result.round_info;

            const betResult = resultBuf.map((dict) => {
                let earnedMoney: number = 0;
                let usedMoney: number = 0;
                for (let i = 0; i < dict.bet_info.length; i++) {
                    const subDict = dict.bet_info[i];
                    if (subDict.direction) {
                        if (subDict.direction == 'first_of_third') {
                            const s1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                            if (s1.includes(winner)) {
                                earnedMoney += Number(subDict.amount) * 3;
                            }
                            usedMoney += Number(subDict.amount);
                            console.log('----- s1 -----');
                        }

                        if (subDict.direction == 'second_of_third') {
                            const s2 = [
                                13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
                            ];
                            if (s2.includes(winner)) {
                                earnedMoney += Number(subDict.amount) * 3;
                            }
                            usedMoney += Number(subDict.amount);
                            console.log('----- s2 -----');
                        }

                        if (subDict.direction == 'third_of_third') {
                            const s3 = [
                                25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
                            ];
                            if (s3.includes(winner)) {
                                earnedMoney += Number(subDict.amount) * 3;
                            }
                            usedMoney += Number(subDict.amount);
                            console.log('----- s3 -----');
                        }

                        if (subDict.direction == 'first_half') {
                            const h1 = [
                                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
                                15, 16, 17, 18,
                            ];
                            if (h1.includes(winner)) {
                                earnedMoney += Number(subDict.amount) * 2;
                            }
                            usedMoney += Number(subDict.amount);
                            console.log('----- h1 -----');
                        }

                        if (subDict.direction == 'second_half') {
                            const h2 = [
                                19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
                                31, 32, 33, 34, 35, 36,
                            ];
                            if (h2.includes(winner)) {
                                earnedMoney += Number(subDict.amount) * 2;
                            }
                            usedMoney += Number(subDict.amount);
                            console.log('----- h2 -----');
                        }
                        if (subDict.direction == 'even') {
                            if (winner % 2 == 0) {
                                earnedMoney += Number(subDict.amount) * 2;
                            }
                            usedMoney += Number(subDict.amount);
                            console.log('----- even -----');
                        }
                        if (subDict.direction == 'odd') {
                            if (winner % 2 == 1) {
                                earnedMoney += Number(subDict.amount) * 2;
                            }
                            usedMoney += Number(subDict.amount);
                            console.log('----- odd -----');
                        }
                        if (subDict.direction == 'blue') {
                            const blue = [
                                1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25,
                                27, 30, 32, 34, 36,
                            ];
                            if (blue.includes(winner)) {
                                earnedMoney += Number(subDict.amount) * 2;
                            }
                            usedMoney += Number(subDict.amount);
                            console.log('----- blue -----');
                        }
                        if (subDict.direction == 'black') {
                            const black = [
                                2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26,
                                28, 29, 31, 33, 35,
                            ];
                            if (black.includes(winner)) {
                                earnedMoney += Number(subDict.amount) * 2;
                            }
                            usedMoney += Number(subDict.amount);
                            console.log('----- black -----');
                        }
                    }
                    if (subDict.direction.zero) {
                        if (winner == 0) {
                            earnedMoney += Number(subDict.amount) * 36;
                        }
                        usedMoney += Number(subDict.amount);
                        console.log('----- zero -----');
                    }

                    if (subDict.direction.dzero) {
                        if (winner == 37) {
                            earnedMoney += Number(subDict.amount) * 36;
                        }
                        usedMoney += Number(subDict.amount);
                        console.log('----- dzero -----');
                    }

                    if (subDict.direction.row) {
                        const r1 = [
                            3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36,
                        ];
                        const r2 = [
                            2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35,
                        ];
                        const r3 = [
                            1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34,
                        ];

                        if (subDict.direction.row.id == 3) {
                            if (r1.includes(winner)) {
                                earnedMoney += Number(subDict.amount) * 3;
                            }
                            usedMoney += Number(subDict.amount);
                        }

                        if (subDict.direction.row.id == 2) {
                            if (r2.includes(winner)) {
                                earnedMoney += Number(subDict.amount) * 3;
                            }
                            usedMoney += Number(subDict.amount);
                        }

                        if (subDict.direction.row.id == 1) {
                            if (r3.includes(winner)) {
                                earnedMoney += Number(subDict.amount) * 3;
                            }
                            usedMoney += Number(subDict.amount);
                        }
                        console.log('----- row -----');
                    }

                    if (subDict.direction.single) {
                        if (subDict.direction.single.id == winner) {
                            earnedMoney += Number(subDict.amount) * 36;
                        }
                        usedMoney += Number(subDict.amount);
                        console.log('----- single -----');
                    }
                }
                const newDict = {
                    round_id: dict.round_id,
                    room_id: dict.room_id,
                    player: dict.player,
                    earnedMoney: earnedMoney,
                    usedMoney: usedMoney,
                };

                return newDict;
            });
            console.log('----- winner ------', winner);
            console.log('debug betResult in dbquery', betResult);
            console.log('debug round_id', result.round_id);

            const newResult = new Results({
                round_id: result.round_id,
                bet_result: betResult,
            });
            const saveResult = () => {
                newResult.save().catch((e) => {
                    console.log('saveResult Error: ', e);
                    saveResult();
                });
            };
            saveResult();

            console.log('save betResult');
            const updateRound = () => {
                Rounds.findOneAndUpdate(
                    { round_id: result.round_id },
                    {
                        $set: {
                            win_direction: winner,
                        },
                    },
                    { upsert: true },
                ).catch((e) => {
                    console.log(
                        '----- RoundsWinDirectionSave in DB Error: ',
                        e,
                    );
                    updateRound();
                });
            };
            updateRound();

            wss.clients.forEach((client) => {
                client.send(
                    JSON.stringify({
                        win_direction: winner,
                        betResult: betResult,
                        type: 'finished',
                    }),
                );
            });

            return betResult;
        })
        .catch((e) => console.log('----- getResult Error : ', e));
};

export const getRoomInfo = async () => {
    await getDataFromDB(Rooms, {})
        .then((result) => {
            console.log('RoomInfo: ', result);
            return result;
        })
        .catch((e) => {
            console.log(e);
        });

    // Rooms.find({}, { _id: 0 })
    //     .then(async (result) => {
    //         console.log('RoomInfo, ', result);
    //         return result;
    //     })
    //     .catch((e) => console.log(e));
};

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from './src/config/express';
import mainLogic from './src/mainLogic';
import { saveMessages } from './src/utils';
import Messages from './src/models/message.model';
import Rounds from './src/models/round.model';
import Results from './src/models/result.model';
import Rooms from './src/models/room.model';
import { RouletteContract } from './src/constants';
// import { getRoomInfo } from './src/utils';

dotenv.config();
const port = process.env.PORT || '3000';
const mongooseURL = process.env.MONGODB_URL;

mongoose
    .connect(mongooseURL)
    .then(() => {
        console.log('Connected to MongoDB');
        const server = app.listen(port, () => {
            console.log(`Listening to ${port}`);
        });

        const WebSocket = require('ws');

        // const wss = new WebSocket.Server({ port: 8080 });
        const wss = new WebSocket.Server({ server });

        wss.on('connection', function connection(ws) {
            console.log('Client connected');

            ws.on('message', (message) => {
                try {
                    const jsonData = JSON.parse(message);
                    console.log(jsonData);
                    if (jsonData.type == 'get_initial_data') {
                        try {
                            Messages.find(
                                {},
                                { _id: 0, address: 1, message: 1 },
                            )
                                .sort({ _id: -1 })
                                .limit(20)
                                .then(async (result) => {
                                    const resultBuf = result;
                                    ws.send(
                                        JSON.stringify({
                                            data: resultBuf.reverse(),
                                            type: 'initial_message',
                                            contractAddress: `${RouletteContract}`,
                                        }),
                                    );
                                })
                                .catch((e) => console.log(e));

                            Rounds.findOne({}, { _id: 0 })
                                .sort({ _id: -1 })
                                .then(async (result) => {
                                    const resultBuf = result;
                                    // console.log(resultBuf);
                                    ws.send(
                                        JSON.stringify({
                                            round_id:
                                                resultBuf?.round_id || '0',
                                            data: resultBuf?.round_info || {},
                                            type: 'RoundStatus',
                                        }),
                                    );
                                });
                            Results.find(
                                {},
                                { _id: 0, round_id: 1, bet_result: 1 },
                            )
                                .sort({ _id: -1 })
                                .limit(5)
                                .then(async (result) => {
                                    const resultBuf = result;
                                    console.log('initial_history: ', resultBuf);
                                    ws.send(
                                        JSON.stringify({
                                            data: resultBuf,
                                            type: 'initial_history',
                                        }),
                                    );
                                });

                            Rooms.find({}, { _id: 0 }).then(async (result) => {
                                const resultBuf = result;
                                ws.send(
                                    JSON.stringify({
                                        data: resultBuf,
                                        type: 'room_info',
                                    }),
                                );
                            });
                        } catch (e) {
                            console.log('InitialFetch Error: ', e);
                        }
                    } else {
                        console.log('message', message);
                        saveMessages(message);
                        jsonData.type = 'message';
                        wss.clients.forEach((client) => {
                            client.send(JSON.stringify(jsonData));
                        });
                    }
                } catch (error) {
                    console.log('Error parsing message as JSON:', error);
                }
            });

            ws.on('close', () => {});
        });

        mainLogic(wss);
    })
    .catch((err) => console.log('MongoDB error : ', err));

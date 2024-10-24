import { Request, Response, Router } from 'express';
import { catchAsync } from '../utils';
import Rooms from '../models/room.model';

const routes = Router();

routes.get(
    '/room-info',
    catchAsync(async (_req: Request, res: Response) => {
        Rooms.find({}, { _id: 0 }).then(async (result) => {
            const resultBuf = result;
            res.status(200).json({ data: resultBuf, type: 'roominfo' });
        });
    }),
);

export default routes;

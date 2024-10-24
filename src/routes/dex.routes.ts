import { Router } from 'express';

import * as tokensContoller from '../controller/token.controller';

const routes = Router();

//============================//
//           Tokens           //
//============================//
routes.get('/tokens/', tokensContoller.getAllToken);
routes.get('/tokens/getOneById', tokensContoller.getTokenById);
routes.post('/tokens/add', tokensContoller.addToken);
routes.put('/tokens/updateById/:id', tokensContoller.updateTokenById);
routes.delete('/tokens/deleteById/:id', tokensContoller.deleteToken);

export default routes;

import { Router } from 'express';

import dexRoutes from './dex.routes';
import casinoRoutes from './casino.routes';
import airDropRoutes from './airdrop.routes';

const routes = Router();

routes.use('/casino', casinoRoutes);
routes.use('/dex', dexRoutes);
routes.use('airdrop', airDropRoutes);

export { routes };

import Koa from 'koa';
import { buildRouter } from './buildRouter';
import historyApiFallback from 'koa2-connect-history-api-fallback';
import logger from 'koa-logger';
import bodyParser from 'koa-body';
import { getStoragePath, setBaseStoragePath, setConfigPath } from '../lib/fileAccessor';
import { ensureDir } from 'fs-extra';
import { upgradeDatabase } from '../lib/databaseUpgrader';
import { fontentServe } from '../lib/fontentServe';

interface Props {
  servePort: number;
  storagePath: string;
  configPath: string;
  fontentPath: string;
  formLimit: string;
}

export const runApp = async (props: Props) => {
  const { servePort, formLimit } = props;
  setConfigPath(props.configPath);
  setBaseStoragePath(props.storagePath);

  await ensureDir(getStoragePath());
  await upgradeDatabase(getStoragePath('cube-diary.db'));

  const app = new Koa();
  const apiRouter = await buildRouter();

  app
    .use(logger())
    .use(bodyParser({ multipart: true, formLimit }))
    .use(historyApiFallback({ whiteList: ['/api'] }))
    .use(fontentServe(props.fontentPath))
    .use(apiRouter.routes())
    .use(apiRouter.allowedMethods())
    .listen(servePort, () => {
      console.log(`server is running at http://localhost:${servePort}/`);
    });
};

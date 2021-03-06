import express from 'express';
import { router } from './router/routes';
import * as swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const app = express();

const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yaml'));
const routePrefix = '/api/v1/';

app.use(express.json());
app.use(`${routePrefix}issues`, router);
app.use(`${routePrefix}docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
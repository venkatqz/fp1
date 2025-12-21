// server.ts
import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import prisma from './src/lib/prisma';

const app: Express = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const openapiPath = path.join(__dirname, 'openapi.yaml');
const swaggerDocument = yaml.load(fs.readFileSync(openapiPath, 'utf8')) as Record<string, any>;


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

import routes from './src/routes';
app.use(routes);


app.get('/', (req: Request, res: Response) => {
    res.send('Hello from Express with TypeScript!');
});

async function main() {
    try {
        await prisma.$connect();
        console.log('[database]: Connected to database successfully');

        app.listen(port, () => {
            console.log(`[server]: Server is running at http://localhost:${port}`);
            console.log(`[docs]: Swagger UI at http://localhost:${port}/api-docs`);
        });
    } catch (error) {
        console.error('[database]: Failed to connect to database', error);
        process.exit(1);
    }
}


// Trigger restart (Optimized Manager Query)
main();
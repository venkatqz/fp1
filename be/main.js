"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors")); // Important for automation and frontend
const prisma_1 = __importDefault(require("./src/lib/prisma"));
const app = (0, express_1.default)();
const port = 3000;
// Enable CORS
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Load OpenAPI spec
const openapiPath = path_1.default.join(__dirname, 'openapi.yaml');
const swaggerDocument = js_yaml_1.default.load(fs_1.default.readFileSync(openapiPath, 'utf8'));
// Swagger UI
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// --- ROUTES ---
const routes_1 = __importDefault(require("./src/routes"));
app.use(routes_1.default);
app.get('/', (req, res) => {
    res.send('Hello from Express with TypeScript!');
});
async function main() {
    try {
        await prisma_1.default.$connect();
        console.log('[database]: Connected to database successfully');
        app.listen(port, () => {
            console.log(`[server]: Server is running at http://localhost:${port}`);
            console.log(`[docs]: Swagger UI at http://localhost:${port}/api-docs`);
        });
    }
    catch (error) {
        console.error('[database]: Failed to connect to database', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=main.js.map
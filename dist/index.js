"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = require("dotenv");
const db_1 = require("./db");
const analytics_1 = __importDefault(require("./routes/analytics"));
const projects_1 = __importDefault(require("./routes/projects"));
const auth_1 = __importDefault(require("./routes/auth"));
const upload_1 = __importDefault(require("./routes/upload"));
const auth_2 = require("./middleware/auth");
const recommendations_1 = __importDefault(require("./routes/recommendations"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/auth', auth_1.default);
app.use('/api/analytics', auth_2.authenticateToken, analytics_1.default);
app.use('/api/projects', auth_2.authenticateToken, projects_1.default);
app.use('/api/upload', auth_2.authenticateToken, upload_1.default);
app.use('/api/recommendations', auth_2.authenticateToken, recommendations_1.default);
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
db_1.pool.getConnection()
    .then(connection => {
    console.log('Database connected successfully');
    connection.release();
})
    .catch(err => {
    console.error('Error connecting to the database:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map
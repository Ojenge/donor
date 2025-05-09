"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const projects_1 = __importDefault(require("./routes/projects"));
const recommendations_1 = __importDefault(require("./routes/recommendations"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/projects', projects_1.default);
app.use('/api/recommendations', recommendations_1.default);
app.use('/api/analytics', analytics_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map
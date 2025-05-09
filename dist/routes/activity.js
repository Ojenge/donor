"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackActivity = void 0;
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const trackActivity = async (userId, activityType, description, ipAddress, userAgent) => {
    await db_1.pool.execute(`INSERT INTO user_activities (
      user_id, activity_type, description, ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?)`, [userId, activityType, description, ipAddress, userAgent]);
};
exports.trackActivity = trackActivity;
router.get('/my-activity', auth_1.authenticateToken, async (req, res) => {
    var _a, _b;
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const [rows] = await db_1.pool.execute(`SELECT * FROM user_activities 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`, [(_a = req.user) === null || _a === void 0 ? void 0 : _a.id, Number(limit), offset]);
        const [total] = await db_1.pool.execute('SELECT COUNT(*) as total FROM user_activities WHERE user_id = ?', [(_b = req.user) === null || _b === void 0 ? void 0 : _b.id]);
        res.json({
            activities: rows,
            pagination: {
                total: total[0].total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total[0].total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/stats', auth_1.authenticateToken, async (req, res) => {
    var _a, _b;
    try {
        const [dailyStats] = await db_1.pool.execute(`SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        activity_type
       FROM user_activities 
       WHERE user_id = ? 
       AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at), activity_type
       ORDER BY date DESC`, [(_a = req.user) === null || _a === void 0 ? void 0 : _a.id]);
        const [activityTypes] = await db_1.pool.execute(`SELECT 
        activity_type,
        COUNT(*) as count
       FROM user_activities 
       WHERE user_id = ?
       GROUP BY activity_type`, [(_b = req.user) === null || _b === void 0 ? void 0 : _b.id]);
        res.json({
            dailyStats,
            activityTypes
        });
    }
    catch (error) {
        console.error('Error fetching activity stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/recent', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        const [rows] = await db_1.pool.execute(`SELECT * FROM user_activities 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 10`, [(_a = req.user) === null || _a === void 0 ? void 0 : _a.id]);
        res.json(rows);
    }
    catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=activity.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../db");
async function importRecommendations() {
    const connection = await db_1.pool.getConnection();
    try {
        console.log('Starting recommendations import...');
        await connection.beginTransaction();
        const sqlFile = path_1.default.join(__dirname, '../../src/db/sample_recommendations.sql');
        console.log('Reading SQL file from:', sqlFile);
        if (!fs_1.default.existsSync(sqlFile)) {
            throw new Error(`SQL file not found at: ${sqlFile}`);
        }
        const sql = fs_1.default.readFileSync(sqlFile, 'utf8');
        const statements = sql
            .split(';')
            .map(statement => statement.trim())
            .filter(statement => statement.length > 0);
        console.log(`Found ${statements.length} SQL statements to execute`);
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            try {
                console.log(`Executing statement ${i + 1}/${statements.length}...`);
                await connection.query(statement);
                console.log('✓ Statement executed successfully');
            }
            catch (error) {
                console.error(`Error executing statement ${i + 1}:`, error);
                throw error;
            }
        }
        await connection.commit();
        console.log('✓ All statements executed successfully');
        console.log('✓ Transaction committed');
        const [recommendations] = await connection.query('SELECT COUNT(*) as count FROM recommendations');
        console.log(`✓ Imported ${recommendations[0].count} recommendations`);
        const [projects] = await connection.query('SELECT COUNT(*) as count FROM projects');
        console.log(`✓ Found ${projects[0].count} projects in the database`);
    }
    catch (error) {
        await connection.rollback();
        console.error('Error during import:', error);
        throw error;
    }
    finally {
        connection.release();
        await db_1.pool.end();
        console.log('Database connection closed');
    }
}
console.log('Starting recommendations import process...');
importRecommendations()
    .then(() => {
    console.log('Import process completed successfully');
    process.exit(0);
})
    .catch((error) => {
    console.error('Import process failed:', error);
    process.exit(1);
});
//# sourceMappingURL=importRecommendations.js.map
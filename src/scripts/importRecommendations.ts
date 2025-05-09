import fs from 'fs';
import path from 'path';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';

interface CountResult extends RowDataPacket {
  count: number;
}

async function importRecommendations() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting recommendations import...');
    
    // Start transaction
    await connection.beginTransaction();
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, '../../src/db/sample_recommendations.sql');
    console.log('Reading SQL file from:', sqlFile);
    
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`SQL file not found at: ${sqlFile}`);
    }
    
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split the SQL file into individual statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        await connection.query(statement);
        console.log('✓ Statement executed successfully');
      } catch (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        throw error; // Re-throw to trigger rollback
      }
    }
    
    // Commit transaction
    await connection.commit();
    console.log('✓ All statements executed successfully');
    console.log('✓ Transaction committed');
    
    // Verify the data was imported
    const [recommendations] = await connection.query<CountResult[]>('SELECT COUNT(*) as count FROM recommendations');
    console.log(`✓ Imported ${recommendations[0].count} recommendations`);
    
    const [projects] = await connection.query<CountResult[]>('SELECT COUNT(*) as count FROM projects');
    console.log(`✓ Found ${projects[0].count} projects in the database`);
    
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    console.error('Error during import:', error);
    throw error;
  } finally {
    // Release connection back to pool
    connection.release();
    // Close the pool
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the import
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
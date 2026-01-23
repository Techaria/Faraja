const pool = require('../db');

async function migrate() {
  try {
    console.log('Running migration: Add image BLOB columns...');
    
    // Check if columns already exist
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'products' AND COLUMN_NAME IN ('image_data', 'image_mime_type')
    `);
    
    if (columns.length === 2) {
      console.log('✓ BLOB columns already exist, skipping migration');
      return;
    }
    
    // Add columns if they don't exist
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS image_data LONGBLOB NULL,
      ADD COLUMN IF NOT EXISTS image_mime_type VARCHAR(50) NULL
    `);
    
    console.log('✓ Migration successful: BLOB columns added to products table');
  } catch (err) {
    console.error('✗ Migration failed:', err.message);
    if (err.code !== 'ER_DUP_FIELDNAME') {
      process.exit(1);
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = migrate;

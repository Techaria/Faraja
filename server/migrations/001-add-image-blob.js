const pool = require('../db');

async function migrate() {
  try {
    console.log('Running migration: Add image BLOB columns...');
    
    // Check if image_data column exists
    const [imageDataExists] = await pool.query(`
      SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'image_data' AND TABLE_SCHEMA = DATABASE()
    `);
    
    if (imageDataExists[0].count > 0) {
      console.log('✓ BLOB columns already exist, skipping migration');
      return;
    }
    
    // Add image_data column
    console.log('Adding image_data column...');
    await pool.query(`
      ALTER TABLE products ADD COLUMN image_data LONGBLOB NULL
    `);
    
    // Add image_mime_type column
    console.log('Adding image_mime_type column...');
    await pool.query(`
      ALTER TABLE products ADD COLUMN image_mime_type VARCHAR(50) NULL
    `);
    
    console.log('✓ Migration successful: BLOB columns added to products table');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('✓ Columns already exist, skipping');
    } else {
      console.error('✗ Migration failed:', err.message);
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

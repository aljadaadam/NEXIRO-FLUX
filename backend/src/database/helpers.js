/**
 * ─── Database Helper Functions ───
 * Utility functions for schema management (column checks, index checks, etc.)
 */
const { DB_NAME } = require('../config/env');

/**
 * Check if a column exists in a table
 */
async function columnExists(pool, tableName, columnName) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [DB_NAME, tableName, columnName]
  );
  return Number(rows?.[0]?.cnt || 0) > 0;
}

/**
 * Check if an index exists in a table
 */
async function indexExists(pool, tableName, indexName) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [DB_NAME, tableName, indexName]
  );
  return Number(rows?.[0]?.cnt || 0) > 0;
}

/**
 * Ensure a column exists in a table, adding it if not
 */
async function ensureColumn(pool, tableName, columnName, columnDefinitionSql) {
  if (await columnExists(pool, tableName, columnName)) return;
  await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnDefinitionSql}`);
}

module.exports = {
  columnExists,
  indexExists,
  ensureColumn,
};

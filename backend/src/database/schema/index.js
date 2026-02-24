/**
 * ─── Schema Index ───
 * Exports all table schemas from organized modules.
 */
const coreTables = require('./coreTables');
const businessTables = require('./businessTables');
const supportTables = require('./supportTables');
const storeTables = require('./storeTables');
const { runColumnMigrations } = require('./columnMigrations');

module.exports = {
  ...coreTables,
  ...businessTables,
  ...supportTables,
  ...storeTables,
  runColumnMigrations,
};

try {
  require('./backend/src/routes/customizationRoutes');
  console.log('Module loaded OK');
} catch(e) {
  console.error('LOAD ERROR:', e.message);
  console.error(e.stack);
}

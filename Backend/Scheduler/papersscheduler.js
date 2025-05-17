const cron = require('node-cron');
const { fetchArxiv, fetchPubmed } = require('../Web_scrapper/paperfetch');

console.log('📅 Scheduler initialized.');

cron.schedule('0 */4 * * *', async () => {
  console.log(`[${new Date().toISOString()}] 🔄 Scheduled job triggered.`);
  try {
    await fetchArxiv();
    console.log('✅ ArXiv fetch completed');
    await fetchPubmed();
    console.log('✅ PubMed fetch completed');
  } catch (err) {
    console.error('❌ Error during scheduled fetch:', err);
  }
});
// Run on server startup as well
(async () => {
  console.log(`[${new Date().toISOString()}] 🚀 Running fetch jobs at startup...`);
  try {
    await fetchArxiv();
    console.log('✅ ArXiv startup fetch completed');
    await fetchPubmed();
    console.log('✅ PubMed startup fetch completed');
  } catch (err) {
    console.error('❌ Error during startup fetch:', err);
  }
})();

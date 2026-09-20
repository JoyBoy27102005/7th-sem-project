const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ai-career-guidance');
  const db = mongoose.connection.db;
  const career = await db.collection('careers').findOne({ title: 'Software Developer' });
  console.log('Career:', JSON.stringify(career, null, 2));
  process.exit(0);
}
run();

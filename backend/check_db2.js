const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ai-career-guidance');
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({});
  console.log('User Skills:', user.skills);
  process.exit(0);
}
run();

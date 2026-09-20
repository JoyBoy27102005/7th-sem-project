const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ai-career-guidance');
  const db = mongoose.connection.db;
  const careers = await db.collection('careers').find({ requiredSkills: { $size: 0 } }).toArray();
  console.log('Empty careers:', careers.length);
  process.exit(0);
}
run();

const mongoose = require('mongoose');

async function updateSkills() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ai-career-guidance');
  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: 'darjimanisha007@gmail.com' },
    { $set: { skills: [] } }
  );
  console.log('User skills updated:', result.modifiedCount);
  process.exit(0);
}

updateSkills();

const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ai-career-guidance');
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({});
  const { sign } = require('jsonwebtoken');
  const token = sign({ id: user._id }, 'your_jwt_secret_key_here', { expiresIn: '30d' });

  try {
    console.log('Sending request for Software Developer...');
    const res = await fetch('http://localhost:5000/api/ai/skill-gap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ targetCareerTitle: 'Software Developer' })
    });
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}
run();

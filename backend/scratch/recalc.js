const jwt = require('jsonwebtoken');

async function run() {
  const mongoose = require('mongoose');
  await mongoose.connect('mongodb://127.0.0.1:27017/ai-career-guidance');
  const user = await mongoose.connection.db.collection('users').findOne({ email: 'darjimanisha007@gmail.com' });
  
  if (!user) {
    console.log('User not found!');
    process.exit(1);
  }

  const realToken = jwt.sign({ id: user._id.toString() }, 'your_jwt_secret_key_here', { expiresIn: '1h' });
  
  try {
    console.log('Calling recalculate...');
    const res = await fetch('http://localhost:5000/api/recommendations/recommend', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${realToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (res.ok) {
        const data = await res.json();
        console.log('Success!', data.length, 'recommendations created.');
    } else {
        const err = await res.text();
        console.log('Failed:', res.status, err);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

run();

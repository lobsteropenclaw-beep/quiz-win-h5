const axios = require('axios');

const API = 'http://127.0.0.1:3001/api';

async function runTest() {
  try {
    console.log('1. Creating Round...');
    const deadline = new Date(Date.now() + 60000).toISOString(); // 1 minute from now
    const roundRes = await axios.post(`${API}/admin/create-round`, {
      secret: 'admin123',
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctIndex: 1,
      prize: 'Test Prize',
      deadline: deadline,
      forecast: 'Next: Science'
    });
    const roundId = roundRes.data.id;
    console.log(`Round created: ${roundId}, Deadline: ${deadline}`);

    console.log('2. Submitting Alice (Correct)...');
    await axios.post(`${API}/submit`, {
      roundId, userId: 'alice_id', nickname: 'Alice', answerIndex: 1
    });

    console.log('3. Submitting Bob (Incorrect)...');
    await axios.post(`${API}/submit`, {
      roundId, userId: 'bob_id', nickname: 'Bob', answerIndex: 0
    });

    console.log('4. Waiting 3 minutes for winner selection (Deadline + 2m)...');
    setTimeout(async () => {
      console.log('5. Checking for winner...');
      try {
        const statusRes = await axios.get(`${API}/current-round`);
        console.log('Current Status Response:', JSON.stringify(statusRes.data, null, 2));
        
        if (statusRes.data.latestWinner && statusRes.data.latestWinner.nickname === 'Alice') {
          console.log('✅ TEST PASSED: Alice won!');
        } else {
          console.log('❌ TEST FAILED: Winner not selected or wrong winner.');
        }
      } catch (e) {
        console.error('Error fetching final status:', e.message);
      }
      process.exit(0);
    }, 185000); // 3 minutes + buffer

  } catch (err) {
    if (err.response) {
      console.error('Error during test:', err.response.status, err.response.data);
    } else {
      console.error('Error during test:', err.message);
    }
    process.exit(1);
  }
}

runTest();
const express = require('express');
const cors = require('cors');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, 'data/db.json'));
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ rounds: [], entries: [], winners: [] }).write();

const app = express();
app.use(cors({
  origin: '*' // Allow all origins for the prize program to work easily in WeChat
}));
app.use(express.json());

const ADMIN_SECRET = 'admin123'; // Simple secret for admin actions

// --- API Endpoints ---

// Get current active round and latest winner
app.get('/api/current-round', (req, res) => {
  const currentRound = db.get('rounds')
    .find({ status: 'open' })
    .value();
  
  const latestWinner = db.get('winners')
    .orderBy(['roundId'], ['desc'])
    .first()
    .value();

  const lastFinishedRound = db.get('rounds')
    .filter({ status: 'finished' })
    .orderBy(['deadline'], ['desc'])
    .first()
    .value();

  res.json({ 
    currentRound, 
    latestWinner,
    forecast: lastFinishedRound ? lastFinishedRound.forecast : 'Stay tuned!'
  });
});

// Submit an answer
app.post('/api/submit', (req, res) => {
  const { roundId, userId, nickname, answerIndex } = req.body;
  
  const round = db.get('rounds').find({ id: roundId, status: 'open' }).value();
  if (!round) return res.status(404).json({ error: 'Round not active' });

  // Prevent duplicate entry
  const existing = db.get('entries').find({ roundId, userId }).value();
  if (existing) return res.status(400).json({ error: 'Already submitted' });

  const isCorrect = parseInt(answerIndex) === round.correctIndex;

  db.get('entries').push({
    roundId,
    userId,
    nickname,
    answerIndex: parseInt(answerIndex),
    isCorrect,
    timestamp: new Date().toISOString()
  }).write();

  res.json({ success: true });
});

// Admin: Create Round
app.post('/api/admin/create-round', (req, res) => {
  const { secret, question, options, correctIndex, prize, deadline, forecast } = req.body;
  if (secret !== ADMIN_SECRET) return res.status(403).json({ error: 'Unauthorized' });

  // Mark all other rounds as closed/hidden if they were open
  db.get('rounds').filter({ status: 'open' }).each(r => r.status = 'expired').write();

  const newRound = {
    id: uuidv4(),
    question,
    options,
    correctIndex: parseInt(correctIndex),
    prize,
    deadline, // ISO string
    forecast,
    status: 'open',
    createTime: new Date().toISOString()
  };

  db.get('rounds').push(newRound).write();
  res.json(newRound);
});

// Admin: Get all rounds
app.get('/api/admin/rounds', (req, res) => {
  const { secret } = req.query;
  if (secret !== ADMIN_SECRET) return res.status(403).json({ error: 'Unauthorized' });
  res.json(db.get('rounds').value());
});

// Admin: Get entries for a round
app.get('/api/admin/entries', (req, res) => {
  const { secret, roundId } = req.query;
  if (secret !== ADMIN_SECRET) return res.status(403).json({ error: 'Unauthorized' });
  
  const entries = db.get('entries').filter({ roundId }).value();
  res.json(entries);
});

// Admin: Delete a round
app.delete('/api/admin/delete-round', (req, res) => {
  const { secret, roundId } = req.body;
  if (secret !== ADMIN_SECRET) return res.status(403).json({ error: 'Unauthorized' });

  db.get('rounds').remove({ id: roundId }).write();
  db.get('entries').remove({ roundId }).write();
  db.get('winners').remove({ roundId }).write();

  res.json({ success: true });
});

// --- Winner Selection Background Task ---
// Runs every 5 minutes to check for expired rounds
cron.schedule('*/5 * * * *', () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const roundsToClose = db.get('rounds')
    .filter(r => r.status === 'open' && new Date(r.deadline) <= oneHourAgo)
    .value();
  
  if (roundsToClose.length > 0) {
    console.log(`[Cron] Found ${roundsToClose.length} rounds to close.`);
  }

  roundsToClose.forEach(round => {
    console.log(`Selecting winner for round: ${round.id}`);
    
    const correctEntries = db.get('entries')
      .filter({ roundId: round.id, isCorrect: true })
      .value();

    if (correctEntries.length > 0) {
      const winner = correctEntries[Math.floor(Math.random() * correctEntries.length)];
      db.get('winners').push({
        roundId: round.id,
        userId: winner.userId,
        nickname: winner.nickname,
        prize: round.prize,
        timestamp: new Date().toISOString()
      }).write();
    }

    db.get('rounds').find({ id: round.id }).assign({ status: 'finished' }).write();
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
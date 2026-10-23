const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db/database');

const app = express();
const DEFAULT_PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(bodyParser.json({ limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/members', require('./routes/members'));
app.use('/api/lockers', require('./routes/lockers'));
app.use('/api/products', require('./routes/products'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/income', require('./routes/income'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/export', require('./routes/export'));
app.use('/api/backup', require('./routes/backup'));
app.use('/api/auth', require('./routes/auth'));

// settings
app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const obj = {};
  rows.forEach(r => obj[r.key] = r.value);
  res.json(obj);
});
app.post('/api/settings', (req, res) => {
  const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
  for (const [k, v] of Object.entries(req.body)) stmt.run(k, v);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let httpServer;

async function startServer(port = DEFAULT_PORT) {
  await db.ready;
  if (httpServer) return httpServer;
  return new Promise((resolve, reject) => {
    httpServer = app.listen(port, () => {
      console.log(`Gym Management server: http://localhost:${port}`);
      resolve(httpServer);
    });
    httpServer.once('error', error => {
      httpServer = null;
      reject(error);
    });
  });
}

if (require.main === module) {
  startServer().catch(error => {
    console.error('Database startup error:', error);
    process.exit(1);
  });
}

module.exports = { app, startServer };

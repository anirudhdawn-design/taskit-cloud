require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_ORIGIN,
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .flatMap((val) => val.split(',').map((s) => s.trim()))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

// Mount your auth & task routes (adjust filenames if yours are authRoutes.js / taskRoutes.js)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'taskit-api' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TaskIt backend running on port ${PORT} (data dir: ${path.join(__dirname, 'data')})`);
});

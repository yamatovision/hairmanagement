const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// ミドルウェアの設定
app.use(express.json());
app.use(cors());

// MongoDBの接続設定
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/patrolmanagement';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// APIルートの設定
app.use('/api/v1/auth', require('./routes/auth'));

// 本番環境の場合、静的ファイルの提供とSPAのルーティング
if (process.env.NODE_ENV === 'production') {
  // 静的ファイルの提供
  app.use(express.static('../build'));

  // SPA用のルーティング
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
}

// ポート設定
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
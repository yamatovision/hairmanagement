const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.get('/', (req, res) => {
  res.json({ 
    message: '美容師向け陰陽五行AIケアコンパニオン API',
    status: 'ok',
    version: '1.0.0'
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/v1/fortune/daily', (req, res) => {
  res.json({
    id: '1',
    date: new Date().toISOString().split('T')[0],
    element: '木',
    yinYang: '陽',
    overallLuck: 85,
    careerLuck: 80,
    relationshipLuck: 75,
    dailyAdvice: '今日は新しいアイデアに取り組むのに良い日です。',
    compatibleElements: ['火', '木'],
    incompatibleElements: ['金', '土']
  });
});

const port = parseInt(process.env.PORT) || 5001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
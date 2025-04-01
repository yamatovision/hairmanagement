const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // API用のプロキシ
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // パスの書き換えが必要なければコメントアウト可能
      },
    })
  );

  // サーバーサイドイベント用のプロキシ (エラーを回避するための設定)
  app.use(
    '/__server_sent_events__',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      ws: true, // WebSocketサポート
      pathRewrite: {
        '^/__server_sent_events__': '/__server_sent_events__', 
      },
      onError: (err, req, res) => {
        // エラーが発生した場合、空の200レスポンスを返す
        console.log('プロキシエラーをキャッチしました:', err.message);
        if (!res.headersSent) {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          });
          res.write('data: {}\n\n');
        }
      },
    })
  );
};
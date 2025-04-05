const http = require('http');

// 複数のホスト名を試す
const hosts = ['localhost', '127.0.0.1'];
const ports = [5001];
const paths = ['/health', '/healthz', '/api/v1/health', '/_ah/health', '/'];

async function checkHealth() {
  for (const host of hosts) {
    for (const port of ports) {
      for (const path of paths) {
        console.log(`Checking ${host}:${port}${path}...`);
        try {
          await new Promise((resolve, reject) => {
            const options = {
              hostname: host,
              port: port,
              path: path,
              method: 'GET',
              timeout: 2000 // 2秒タイムアウト
            };

            const req = http.request(options, (res) => {
              console.log(`${host}:${port}${path} Status: ${res.statusCode}`);
              
              let data = '';
              res.on('data', (chunk) => {
                data += chunk;
              });
              
              res.on('end', () => {
                console.log(`${host}:${port}${path} Response:`, data);
                resolve();
              });
            });

            req.on('error', (e) => {
              console.error(`${host}:${port}${path} Error: ${e.message}`);
              resolve(); // エラーでも次のホストに進む
            });

            req.on('timeout', () => {
              console.error(`${host}:${port}${path} Timeout`);
              req.destroy();
              resolve();
            });

            req.end();
          });
        } catch (error) {
          console.error(`Error with ${host}:${port}${path}:`, error.message);
        }
      }
    }
  }
}

checkHealth();
/* eslint-disable no-restricted-globals */

// 陰陽五行AIケアコンパニオン Service Worker

// キャッシュの名前とバージョン
const CACHE_NAME = 'yin-yang-app-cache-v1';

// プリキャッシュするアセット
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/static/js/main.bundle.js', // バンドルされたJSファイル（実際のファイル名は異なる場合があります）
  '/static/css/main.css',      // バンドルされたCSSファイル（実際のファイル名は異なる場合があります）
];

// キャッシュするAPIレスポンス用パスパターン（正規表現）
const API_CACHE_PATTERNS = [
  /\/api\/v1\/fortune\/daily/,   // デイリーフォーチュン
  /\/api\/v1\/users\/me/,        // ユーザー情報
  /\/api\/v1\/conversation/      // 最近の対話履歴
];

// インストール時のイベントハンドラ
self.addEventListener('install', (event) => {
  console.log('Service Workerがインストールされました');
  
  // キャッシュの事前読み込み
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('静的アセットをプリキャッシュしています');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // スキップウェイティングを使用して即座にアクティブになる
        return self.skipWaiting();
      })
  );
});

// アクティベーション時のイベントハンドラ
self.addEventListener('activate', (event) => {
  console.log('Service Workerがアクティブになりました');
  
  // 古いキャッシュの削除
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除中:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => {
      // クライアントコントロールを即座に取得
      return self.clients.claim();
    })
  );
});

// ネットワークリクエスト時のイベントハンドラ
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // APIリクエスト（キャッシュ対象）とそれ以外で分岐
  if (isAPIRequest(event.request) && shouldCacheAPI(requestUrl)) {
    // APIリクエスト：ネットワークファースト戦略
    event.respondWith(networkFirstStrategy(event.request));
  } else if (event.request.mode === 'navigate') {
    // ナビゲーションリクエスト：キャッシュファースト戦略（オフライン対応のため）
    event.respondWith(cacheFirstStrategy(event.request));
  } else {
    // 静的アセット：キャッシュファースト戦略
    event.respondWith(cacheFirstStrategy(event.request));
  }
});

// キャッシュファースト戦略（キャッシュにあればそれを使用、なければネットワークから取得してキャッシュ）
async function cacheFirstStrategy(request) {
  // chrome-extension URLsはスキップする
  if (request.url.startsWith('chrome-extension://')) {
    return fetch(request).catch(() => new Response('chrome extension request failed'));
  }
  
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // 有効なレスポンスのみキャッシュ
    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // オフライン時は、ナビゲーションリクエストに対してindex.htmlを返す
    if (request.mode === 'navigate') {
      const cache = await caches.open(CACHE_NAME);
      return cache.match('/index.html');
    }
    
    return new Response('ネットワークエラーが発生しました', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// ネットワークファースト戦略（ネットワークから取得してキャッシュ、失敗したらキャッシュを使用）
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // APIレスポンスをキャッシュ（GETリクエストのみ）
    if (request.method === 'GET' && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('ネットワークリクエストに失敗しました。キャッシュを確認します:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // キャッシュにも見つからない場合
    return new Response(JSON.stringify({ 
      error: 'オフラインです。このデータはキャッシュにありません。',
      offline: true 
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }
}

// APIリクエストかどうかを判定
function isAPIRequest(request) {
  return request.url.includes('/api/');
}

// キャッシュすべきAPIリクエストかどうかを判定
function shouldCacheAPI(url) {
  // パスパターンに一致するかチェック
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// バックグラウンド同期：オフライン時に失敗したリクエストを記録
self.addEventListener('sync', (event) => {
  if (event.tag === 'syncOfflineData') {
    event.waitUntil(syncOfflineData());
  }
});

// オフライン時のデータ同期処理
async function syncOfflineData() {
  try {
    // IndexedDBからオフライン時のリクエストを取得して処理
    // 実際の実装はIndexedDBとの連携コードが必要
    console.log('オフラインデータの同期を開始します');
    // ここにIndexedDBからデータを取得して送信する処理を実装
  } catch (error) {
    console.error('オフラインデータの同期中にエラーが発生しました:', error);
  }
}

// プッシュ通知：サーバーからのプッシュ通知を受信
self.addEventListener('push', (event) => {
  let notification = {
    title: '陰陽五行AIケアコンパニオン',
    body: 'お知らせがあります',
    icon: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {}
  };
  
  try {
    if (event.data) {
      notification = { ...notification, ...JSON.parse(event.data.text()) };
    }
  } catch (error) {
    console.error('プッシュ通知のパースに失敗しました:', error);
  }
  
  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: notification.icon,
      vibrate: notification.vibrate,
      data: notification.data
    })
  );
});

// 通知クリック：ユーザーが通知をクリックした時の処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // 通知データに基づいて適切なURLにユーザーを誘導
  let url = '/';
  if (event.notification.data && event.notification.data.url) {
    url = event.notification.data.url;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // 既に開いているウィンドウがあれば、それをフォーカス
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // なければ新しいウィンドウを開く
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
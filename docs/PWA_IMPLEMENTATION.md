# PWA実装計画

## 概要

パトロールマネジメントアプリケーションをPWA（Progressive Web App）として実装し、スマートフォンやタブレットからアプリのような使用感でアクセスできるようにします。ユーザーの日常的な利用を促進するため、ホーム画面へのインストール、オフライン機能、プッシュ通知などを実装します。

## 現在の状況

アプリケーションは基本的なPWA設定が行われていますが、完全には機能していません：

| 機能 | 状態 | 備考 |
|------|------|------|
| Web App Manifest | ⚠️ 部分的に設定済み | アイコンパスの修正が必要 |
| Service Worker | ⚠️ 基本設定のみ | オフラインキャッシュ戦略の実装が必要 |
| HTTPS対応 | ❌ 未対応 | デプロイ環境でのSSL設定が必要 |
| インストール体験 | ❌ 未実装 | インストールバナー・ガイド実装が必要 |
| アイコン・スプラッシュ画面 | ⚠️ 設定済みだが機能していない | 画像ファイルの配置確認と修正 |
| オフライン対応 | ❌ 未実装 | データキャッシュ戦略が必要 |
| Push通知 | ❌ 未実装 | バックエンド対応が必要 |

## 対応必要項目

### 1. マニフェスト修正
- アイコンパスの修正
- 正しいサイズのアイコン画像の配置確認
- start_urlの検証と修正

### 2. Service Worker実装
- ワークボックス（Workbox）による効率的なキャッシュ戦略の実装
- アプリケーションシェル（App Shell）モデルの採用
- オフライン機能の実装

### 3. データ同期戦略
- IndexedDBを使用したオフラインデータ保存
- バックグラウンド同期機能の実装
- オフライン時の制限機能の明確化

### 4. ユーザー体験向上
- インストールガイド実装
- スプラッシュスクリーン最適化
- ネイティブアプリのような操作感の向上

### 5. プッシュ通知
- FCMまたはWeb Push APIの実装
- 通知の許可フロー設計
- バックエンドでの通知管理システム

## タイムライン

| フェーズ | 説明 | 予想期間 |
|---------|------|---------|
| 1 | 基本PWA機能修正（マニフェスト、サービスワーカー基本設定） | 1週間 |
| 2 | オフライン対応とデータ同期戦略実装 | 2週間 |
| 3 | ユーザー体験最適化 | 1週間 |
| 4 | プッシュ通知実装 | 2週間 |
| 5 | テストとバグ修正 | 1週間 |

## モックアップ

### ホーム画面アイコン
![ホーム画面アイコン例](https://via.placeholder.com/300x600?text=ホーム画面アイコン例)

### アプリインストールバナー
![インストールバナー例](https://via.placeholder.com/300x100?text=インストールバナー例)

### スプラッシュスクリーン
![スプラッシュスクリーン例](https://via.placeholder.com/300x600?text=スプラッシュスクリーン例)

## 実装ステップの詳細

### 1. マニフェスト修正

現在のmanifest.jsonファイルは基本的な設定が行われていますが、以下の修正が必要です：

```json
{
  "short_name": "陰陽五行AI",
  "name": "美容師向け陰陽五行AIケアコンパニオン",
  "icons": [
    {
      "src": "img/favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "img/logo192.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any maskable"
    },
    {
      "src": "img/logo512.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "any maskable"
    }
  ],
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#9c27b0",
  "background_color": "#ffffff",
  "orientation": "portrait",
  "categories": ["business", "productivity", "personalization"],
  "screenshots": [
    {
      "src": "img/screenshots/dashboard.png",
      "type": "image/png",
      "sizes": "1280x720"
    },
    {
      "src": "img/screenshots/fortune.png",
      "type": "image/png",
      "sizes": "1280x720"
    }
  ],
  "description": "陰陽五行の原理に基づいた運勢分析と組織マネジメントを統合するパトロールマネジメントアプリケーション"
}
```

### 2. Service Worker実装

効率的なオフラインキャッシュ戦略を実装するために、Workboxライブラリを使用したservice-worker.jsを作成します：

```javascript
// service-worker.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

workbox.setConfig({
  debug: false,
});

const {registerRoute} = workbox.routing;
const {CacheFirst, NetworkFirst, StaleWhileRevalidate} = workbox.strategies;
const {ExpirationPlugin} = workbox.expiration;

// アプリケーションシェルのキャッシュ
registerRoute(
  ({request}) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
      }),
    ],
  })
);

// CSSとJSのキャッシュ
registerRoute(
  ({request}) =>
    request.destination === 'style' ||
    request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'assets',
  })
);

// 画像のキャッシュ
registerRoute(
  ({request}) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30日
      }),
    ],
  })
);

// APIリクエストのキャッシュ
registerRoute(
  ({url}) => url.pathname.startsWith('/api'),
  new NetworkFirst({
    cacheName: 'api-responses',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 1日
      }),
    ],
  })
);

// オフラインページの表示
workbox.precaching.precacheAndRoute([
  {url: '/offline.html', revision: '1'},
]);

// インストール時の処理
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// アクティベート時の処理
self.addEventListener('activate', (event) => {
  self.clients.claim();
});
```

### 3. インストールプロンプトの実装

ユーザーにアプリのインストールを促すためのバナーを実装します：

```javascript
// App.js 内の関連コード
import React, { useState, useEffect } from 'react';

function App() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // インストールプロンプトの表示をキャンセル
      e.preventDefault();
      // 後で使用するためにイベントを保存
      setInstallPrompt(e);
      // インストールバナーを表示
      setShowInstallBanner(true);
    });
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    
    // インストールプロンプトを表示
    installPrompt.prompt();
    
    // プロンプトの結果を待つ
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('ユーザーがアプリをインストールしました');
      } else {
        console.log('ユーザーがインストールを拒否しました');
      }
      // プロンプトは一度しか使用できないのでリセット
      setInstallPrompt(null);
      setShowInstallBanner(false);
    });
  };

  return (
    <div className="App">
      {/* インストールバナー */}
      {showInstallBanner && (
        <div className="install-banner">
          <p>このアプリをホーム画面に追加して、いつでも簡単にアクセスできます。</p>
          <button onClick={handleInstallClick}>インストール</button>
          <button onClick={() => setShowInstallBanner(false)}>閉じる</button>
        </div>
      )}
      
      {/* アプリのメインコンテンツ */}
    </div>
  );
}

export default App;
```

## 参考リソース

- [Google PWA documentation](https://web.dev/learn/pwa/)
- [MDN Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Workbox documentation](https://developers.google.com/web/tools/workbox)
- [PWA Builder](https://www.pwabuilder.com/)
- [PWA Stats](https://www.pwastats.com/)

## 次のステップ

1. 既存のマニフェストファイルとアイコン画像パスの修正
2. 適切なサービスワーカー実装
3. オフラインモードのテスト実装
4. インストールバナーの実装とテスト
5. 本番環境でのHTTPS対応とデプロイ
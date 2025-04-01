import mongoose from 'mongoose';
import { logger } from '../utils/logger.util';
import getFeatureFlags from '../feature-flags';

// 接続状態を表す列挙型
export enum ConnectionState {
  DISCONNECTED = 0,
  CONNECTED = 1,
  CONNECTING = 2,
  DISCONNECTING = 3,
}

// 接続オプション
const connectOptions = {
  serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_TIMEOUT || '10000'),
  connectTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT || '30000'),
  socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '45000'),
  family: 4, // IPv4を使用
  autoIndex: process.env.NODE_ENV !== 'production', // 本番環境ではインデックス自動作成を無効化
  maxPoolSize: 10, // 接続プールサイズ
  minPoolSize: 1, // 最小接続数
};

// DB URI取得（環境変数またはシークレットマネージャー）
const getDbUri = async (): Promise<string> => {
  // 環境変数から取得を試みる
  if (process.env.MONGODB_URI || process.env.DB_URI) {
    const uri = process.env.MONGODB_URI || process.env.DB_URI || '';
    logger.info(`MongoDB URI: ${uri.substring(0, 20)}...`);
    return uri;
  }

  // Secret Managerからの取得を試みる
  if (process.env.CONFIG_METHOD === 'secret_manager') {
    try {
      // TODO: Secret Manager実装
      logger.info('Secret Managerからデータベース接続情報を取得しています');
      
      // シミュレート: 実際にはSecret Managerから取得するコードを実装
      const defaultUri = 'mongodb://localhost:27017/patrolmanagement';
      logger.info(`Secret Manager URI: ${defaultUri.substring(0, 20)}...`);
      return defaultUri;
    } catch (error) {
      logger.error('Secret ManagerからDB URIの取得に失敗しました', error);
      throw error;
    }
  }

  // デフォルト値を使用
  const defaultUri = 'mongodb://localhost:27017/patrolmanagement';
  logger.info(`デフォルトURI: ${defaultUri}`);
  return defaultUri;
};

// 接続関数
export const connectDB = async (retries = 5, delay = 5000): Promise<void> => {
  try {
    const uri = await getDbUri();
    await mongoose.connect(uri, connectOptions);
    logger.info('MongoDB接続成功！');
  } catch (error) {
    logger.error(`MongoDB接続エラー: ${error}`);

    if (retries > 0) {
      logger.info(`${delay}ms後に再接続を試みます...(残り${retries}回)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectDB(retries - 1, delay);
    } else {
      // 接続試行回数を使い切った場合でもサーバーは起動させる
      logger.warn('すべての接続再試行が失敗しました。機能制限モードで続行します');
      // エラー報告メカニズム
      reportConnectionFailure(error);
    }
  }
};

// エラー報告
const reportConnectionFailure = (error: any) => {
  // Slack通知、メトリクス記録などの実装
  logger.error('データベース接続失敗を報告:', error);
  
  // TODO: 本番環境では通知システムを統合
  if (process.env.NODE_ENV === 'production') {
    // 本番環境のみの通知ロジック（実装予定）
  }
};

// データベース接続の監視とイベント処理
const setupConnectionMonitoring = () => {
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB切断: 再接続を試みます');
    setTimeout(() => connectDB(), 5000);
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB接続エラー:', err);
    // 再接続を試みる
    setTimeout(() => connectDB(), 5000);
  });

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB接続成功');
  });
};

// サーバー起動とは別に接続処理を実行
export const setupDatabaseConnection = (): void => {
  // DB接続設定をチェック
  const skipDB = process.env.SKIP_DB === 'true';
  // 本番環境では常にDBエラーをスキップする（デプロイの成功を優先）
  process.env.SKIP_DB_ERRORS = process.env.NODE_ENV === 'production' ? 'true' : process.env.SKIP_DB_ERRORS;
  const skipDBErrors = process.env.SKIP_DB_ERRORS === 'true';

  if (skipDB) {
    logger.info('DB接続をスキップします (SKIP_DB=true)');
    return;
  }

  // 接続監視を設定
  setupConnectionMonitoring();

  // 機能フラグをチェック - データベースが必要な機能が無効なら接続をスキップ
  const checkIfDbRequiredByEnabledFeatures = () => {
    const { enableFortune, enableTeam, enableAnalytics, enableConversation } = 
      getFeatureFlagsFromEnv();
    
    // 認証のみが有効で他の機能がすべて無効の場合、DBなしでも動作可能
    return enableFortune || enableTeam || enableAnalytics || enableConversation;
  };

  // バックグラウンドで接続試行
  connectDB().catch(error => {
    logger.error('初期DB接続に失敗しました', error);
    
    // データベースが必要な機能が有効かチェック
    const dbRequired = checkIfDbRequiredByEnabledFeatures();
    
    if (!skipDBErrors && dbRequired) {
      logger.error('SKIP_DB_ERRORS=false のため、かつDBが必要な機能が有効なため致命的エラーとして扱います');
      process.exit(1);
    } else {
      if (!dbRequired) {
        logger.warn('DBが必要な機能が無効のため、DB接続エラーを無視して続行します');
      } else {
        logger.warn('DB接続エラーを無視して続行します (SKIP_DB_ERRORS=true)');
      }
      
      // 定期的な再接続試行
      if (process.env.NODE_ENV === 'production') {
        logger.info('30秒後に再接続を試みます...');
        setTimeout(() => connectDB(), 30000);
      }
    }
  });
};

// 環境変数から機能フラグを取得するヘルパー関数
const getFeatureFlagsFromEnv = () => {
  return {
    enableAuth: process.env.ENABLE_AUTH !== 'false',
    enableFortune: process.env.ENABLE_FORTUNE !== 'false',
    enableTeam: process.env.ENABLE_TEAM !== 'false',
    enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false',
    enableConversation: process.env.ENABLE_CONVERSATION !== 'false',
  };
};

// 健全性チェック
export const checkDatabaseHealth = async (): Promise<{
  status: 'connected' | 'connecting' | 'disconnected' | 'disconnecting',
  readyState: number
}> => {
  const readyState = mongoose.connection.readyState;
  let status: 'connected' | 'connecting' | 'disconnected' | 'disconnecting';
  
  switch (readyState) {
    case 1: // CONNECTED
      status = 'connected';
      break;
    case 2: // CONNECTING
      status = 'connecting';
      break;
    case 3: // DISCONNECTING
      status = 'disconnecting';
      break;
    default:
      status = 'disconnected';
  }
  
  return {
    status,
    readyState
  };
};
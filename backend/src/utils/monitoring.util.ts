/**
 * モニタリングユーティリティ
 * アプリケーションのパフォーマンス計測と監視機能を提供します
 */
import { logger, loggerWithContext } from './logger.util';
import mongoose from 'mongoose';
import { checkDatabaseHealth } from '../db/connection';
import { getFeatureFlags, getEnabledFeaturesString } from '../feature-flags';

// モニタリング用ロガー
const monitoringLogger = loggerWithContext('Monitoring');

// アプリケーションメトリクス
interface AppMetrics {
  startTime: number;
  requests: {
    total: number;
    success: number;
    error: number;
    notFound: number;
  };
  responseTime: {
    total: number;
    count: number;
    max: number;
    min: number;
  };
  memory: {
    lastUsage: NodeJS.MemoryUsage;
    lastChecked: number;
  };
  errors: {
    [code: string]: number;
  };
}

// アプリケーションメトリクスの初期状態
const metrics: AppMetrics = {
  startTime: Date.now(),
  requests: {
    total: 0,
    success: 0,
    error: 0,
    notFound: 0,
  },
  responseTime: {
    total: 0,
    count: 0,
    max: 0,
    min: Number.MAX_SAFE_INTEGER,
  },
  memory: {
    lastUsage: process.memoryUsage(),
    lastChecked: Date.now(),
  },
  errors: {},
};

/**
 * リクエストモニタリングミドルウェア
 * HTTPリクエストのパフォーマンスと結果を監視します
 */
export const requestMonitoring = (req: any, res: any, next: any): void => {
  const startTime = Date.now();
  
  // オリジナルのend関数を保存
  const originalEnd = res.end;
  
  // レスポンス完了時にメトリクスを計測
  res.end = function(...args: any[]) {
    const responseTime = Date.now() - startTime;
    
    // メトリクスの更新
    metrics.requests.total++;
    metrics.responseTime.total += responseTime;
    metrics.responseTime.count++;
    metrics.responseTime.max = Math.max(metrics.responseTime.max, responseTime);
    metrics.responseTime.min = Math.min(metrics.responseTime.min, responseTime);
    
    // ステータスコードに基づく分類
    const statusCode = res.statusCode;
    if (statusCode >= 500) {
      metrics.requests.error++;
    } else if (statusCode === 404) {
      metrics.requests.notFound++;
    } else if (statusCode >= 200 && statusCode < 400) {
      metrics.requests.success++;
    }
    
    // エラーコードのカウント
    if (statusCode >= 400) {
      const errorCode = `${statusCode}`;
      metrics.errors[errorCode] = (metrics.errors[errorCode] || 0) + 1;
    }
    
    // リクエスト情報をログに記録（サンプリング）
    if (Math.random() < 0.1 || responseTime > 1000) { // 10%のリクエストまたは1秒以上かかったリクエスト
      monitoringLogger.info('Request performance', {
        method: req.method,
        path: req.path,
        statusCode,
        responseTime: `${responseTime}ms`,
        userAgent: req.get('user-agent'),
      });
    }
    
    // オリジナルのend関数を呼び出し
    return originalEnd.apply(res, args);
  };
  
  next();
};

/**
 * メモリ使用状況をチェックして記録
 * 定期的に呼び出して、メモリリークを検出
 */
export const checkMemoryUsage = (): void => {
  const currentUsage = process.memoryUsage();
  const lastUsage = metrics.memory.lastUsage;
  const timeDiff = Date.now() - metrics.memory.lastChecked;
  
  // RSS (Resident Set Size) の急激な増加をチェック
  const rssDiff = currentUsage.rss - lastUsage.rss;
  const rssGrowthRate = rssDiff / timeDiff; // バイト/ミリ秒
  
  if (rssGrowthRate > 1024) { // 1KB/秒以上の増加率
    monitoringLogger.warn('High memory growth rate detected', {
      rssGrowthRate: `${(rssGrowthRate * 1000 / 1024 / 1024).toFixed(2)} MB/s`,
      currentRss: `${(currentUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(currentUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(currentUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    });
  }
  
  // 定期的なメモリ使用状況のログ記録
  monitoringLogger.debug('Memory usage', {
    rss: `${(currentUsage.rss / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(currentUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(currentUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    external: `${(currentUsage.external / 1024 / 1024).toFixed(2)} MB`,
  });
  
  // メトリクスの更新
  metrics.memory.lastUsage = currentUsage;
  metrics.memory.lastChecked = Date.now();
};

/**
 * メトリクス報告
 * @param metricName メトリック名
 * @param value メトリック値
 * @param labels 追加ラベル
 */
export const reportMetric = (
  metricName: string,
  value: number,
  labels: Record<string, string> = {}
) => {
  // メトリクスを記録
  monitoringLogger.info(`METRIC: ${metricName}`, { 
    value, 
    labels,
    timestamp: new Date().toISOString()
  });
  
  // Google Cloud Monitoring実装（本番環境のみ）
  if (process.env.NODE_ENV === 'production') {
    // TODO: 本番環境ではGCPモニタリングと統合
  }
};

/**
 * システム全体のヘルスチェック
 * @returns ヘルスチェックレポート
 */
export const healthCheck = async (): Promise<Record<string, any>> => {
  // メモリ使用量を取得
  const memoryUsage = process.memoryUsage();
  
  // データベース接続状態を確認
  const dbHealth = await checkDatabaseHealth();
  
  // 機能フラグの状態を取得
  const featureFlags = getFeatureFlags();
  const enabledFeatures = getEnabledFeaturesString();
  
  // データベースが必要かどうかの判定
  // 認証以外の機能が有効なら、DBは必須
  const isDatabaseRequired = featureFlags.enableFortune || 
                           featureFlags.enableTeam || 
                           featureFlags.enableAnalytics || 
                           featureFlags.enableConversation;
  
  // アプリケーションメトリクス
  const avgResponseTime = metrics.responseTime.count > 0
    ? metrics.responseTime.total / metrics.responseTime.count
    : 0;
  
  const health = {
    status: 'up',
    timestamp: new Date().toISOString(),
    services: {
      database: isDatabaseRequired ? dbHealth.status === 'connected' : true,
      api: true,
    },
    version: process.env.npm_package_version || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    features: {
      enabled: enabledFeatures,
      auth: featureFlags.enableAuth,
      fortune: featureFlags.enableFortune,
      team: featureFlags.enableTeam,
      analytics: featureFlags.enableAnalytics,
      conversation: featureFlags.enableConversation
    },
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB,
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
    },
    database: {
      status: dbHealth.status,
      readyState: dbHealth.readyState,
    },
    requests: {
      total: metrics.requests.total,
      success: metrics.requests.success,
      error: metrics.requests.error,
      notFound: metrics.requests.notFound,
      successRate: metrics.requests.total > 0
        ? (metrics.requests.success / metrics.requests.total * 100).toFixed(2) + '%'
        : 'N/A',
    },
    performance: {
      avgResponseTime: `${avgResponseTime.toFixed(2)} ms`,
      maxResponseTime: `${metrics.responseTime.max} ms`,
      minResponseTime: metrics.responseTime.min === Number.MAX_SAFE_INTEGER
        ? 'N/A'
        : `${metrics.responseTime.min} ms`,
    },
  };

  // 全体ステータスの判定 - シンプルな方法に戻す
  health.status = Object.values(health.services).every(Boolean) ? 'up' : 'degraded';
  
  return health;
};

/**
 * シンプルなヘルスチェックエンドポイント用ハンドラー
 */
export const healthCheckHandler = async (req: any, res: any): Promise<void> => {
  const mode = req.query.mode || 'full';
  
  if (mode === 'simple') {
    res.status(200).send('OK');
    return;
  }
  
  const healthReport = await healthCheck();
  res.status(200).json(healthReport);
};

/**
 * エラー報告
 * @param error エラーオブジェクト
 * @param context 追加コンテキスト情報
 * @param severity エラーの重大度
 */
export const reportError = (
  error: Error,
  context: Record<string, any> = {},
  severity: 'warn' | 'error' | 'critical' = 'error'
) => {
  // エラーをログに記録
  const logMethod = severity === 'critical' ? 'error' : severity;
  monitoringLogger[logMethod](`ERROR: ${error.message}`, {
    errorName: error.name,
    stack: error.stack,
    severity,
    timestamp: new Date().toISOString(),
    ...context,
  });
  
  // 重大なエラーの場合、指標も記録
  if (severity === 'critical') {
    reportMetric('critical_errors', 1, { 
      errorName: error.name,
      ...Object.fromEntries(
        Object.entries(context)
          .filter(([_, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
      )
    });
  }
};

/**
 * パフォーマンスのマークを記録
 * 特定の処理の開始時に呼び出す
 * @param markName マーク名
 */
export const mark = (markName: string): void => {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`${markName}_start`);
  }
};

/**
 * パフォーマンスの測定を終了して結果を記録
 * 特定の処理の終了時に呼び出す
 * @param markName マーク名（markと同じ名前を使用）
 * @param context 追加コンテキスト情報
 */
export const measure = (markName: string, context: Record<string, any> = {}): void => {
  if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
    try {
      performance.mark(`${markName}_end`);
      performance.measure(markName, `${markName}_start`, `${markName}_end`);
      
      const entries = performance.getEntriesByName(markName);
      if (entries.length > 0) {
        const duration = entries[0].duration;
        
        // 長時間の処理を記録
        if (duration > 100) { // 100ms以上かかった処理
          monitoringLogger.info(`Performance measurement: ${markName}`, {
            duration: `${duration.toFixed(2)} ms`,
            ...context
          });
          
          // メトリクスとしても記録
          reportMetric(`perf_${markName}`, duration, {
            ...Object.fromEntries(
              Object.entries(context)
                .filter(([_, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
            )
          });
        } else {
          monitoringLogger.debug(`Performance measurement: ${markName}`, {
            duration: `${duration.toFixed(2)} ms`,
            ...context
          });
        }
        
        // エントリをクリーンアップ
        performance.clearMarks(`${markName}_start`);
        performance.clearMarks(`${markName}_end`);
        performance.clearMeasures(markName);
      }
    } catch (error) {
      logger.error(`Performance measurement error for ${markName}`, error);
    }
  }
};

/**
 * メモリリークを検出するための定期的なチェックをセットアップ
 * アプリケーション起動時に一度だけ呼び出す
 * @param intervalMs チェック間隔（ミリ秒）
 */
export const setupMemoryMonitoring = (intervalMs = 300000): NodeJS.Timeout => { // デフォルト5分
  const interval = setInterval(() => {
    checkMemoryUsage();
    
    // メモリが過剰に使用されている場合は警告
    const currentRss = process.memoryUsage().rss / 1024 / 1024; // MB単位
    if (currentRss > 1024) { // 1GB以上
      monitoringLogger.warn('High memory usage detected', {
        rss: `${currentRss.toFixed(2)} MB`,
        uptime: `${((Date.now() - metrics.startTime) / 1000 / 60 / 60).toFixed(2)} hours`,
      });
      
      // メトリクスとして記録
      reportMetric('high_memory_usage', currentRss);
    }
  }, intervalMs);
  
  // 初回の測定を即時実行
  checkMemoryUsage();
  
  return interval;
};
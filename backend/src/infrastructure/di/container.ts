/**
 * 依存性注入コンテナ設定
 * アプリケーション全体の依存性を管理するためのTSyringeコンテナ
 * 
 * 変更履歴:
 * - 2025/3/30: イベント駆動アーキテクチャのサポート追加 (Claude)
 */
import 'reflect-metadata';
import { container } from 'tsyringe';
import mongoose from 'mongoose';

// ドメインレイヤー - リポジトリインターフェース
import { IUserRepository } from '../../domain/user/repositories/user.repository.interface';
import { IFortuneRepository } from '../../domain/repositories/IFortuneRepository';

// インフラストラクチャレイヤー - リポジトリ実装
import { MongoUserRepository } from '../repositories/mongo-user.repository';
import { MongoFortuneRepository } from '../repositories/MongoFortuneRepository';

// アプリケーションレイヤー - サービス
import { ITokenService, JwtTokenService } from '../../application/services/token.service';
import { ElementalCalculatorService } from '../../application/services/elemental-calculator.service';

// アプリケーションレイヤー - ユースケース
import { UserAuthenticationUseCase } from '../../application/user/use-cases/user-authentication.use-case';
import { UserRegistrationUseCase } from '../../application/user/use-cases/user-registration.use-case';
import { GetUserProfileUseCase } from '../../application/user/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../application/user/use-cases/update-user-profile.use-case';
import { UpdateUserPasswordUseCase } from '../../application/user/use-cases/update-user-password.use-case';

// インターフェースレイヤー - コントローラー
import { FortuneController } from '../../interfaces/http/controllers/fortune.controller';

// イベント駆動アーキテクチャの依存性
import { IEventBus, InMemoryEventBus } from '../events/EventBus';
import { IEventStore, InMemoryEventStore, MongoEventStore } from '../events/EventStore';
import { UserEventHandlers } from '../events/handlers/UserEventHandlers';
import { TeamEventHandlers } from '../events/handlers/TeamEventHandlers';
import { ConversationEventHandlers } from '../events/handlers/ConversationEventHandlers';

// 環境変数からデータベース接続URLを取得
const DB_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/patrolmanagement';

/**
 * データベース接続の設定
 */
export function setupDatabase(): mongoose.Connection {
  if (mongoose.connection.readyState === 0) {
    console.log('データベース接続を開始します...');
    mongoose.connect(DB_URL)
      .then(() => console.log('データベース接続成功（setupDatabase）'))
      .catch(err => console.error('データベース接続エラー（setupDatabase）:', err));
  } else {
    console.log('既存のデータベース接続を使用します');
  }
  return mongoose.connection;
}

/**
 * イベント駆動アーキテクチャの設定
 */
function setupEventDrivenArchitecture(): void {
  // 環境変数からイベントストアのタイプを決定
  const useMongoEventStore = process.env.EVENT_STORE_TYPE === 'mongo';
  
  // イベントバスとイベントストアの登録
  container.register<IEventBus>('IEventBus', {
    useClass: InMemoryEventBus
  });
  
  // 環境に応じて適切なイベントストアを登録
  container.register<IEventStore>('IEventStore', {
    useClass: useMongoEventStore ? MongoEventStore : InMemoryEventStore
  });
  
  // イベントハンドラーの登録
  container.register('UserEventHandlers', {
    useClass: UserEventHandlers
  });
  
  container.register('TeamEventHandlers', {
    useClass: TeamEventHandlers
  });
  
  container.register('ConversationEventHandlers', {
    useClass: ConversationEventHandlers
  });
}

/**
 * 依存性注入コンテナの設定
 * すべての依存関係をここで登録
 */
export function configureContainer(): void {
  // データベース接続を保証する - 接続が完全に確立されてからリポジトリを使用するために
  const dbConnection = setupDatabase();
  
  // モデルが確実に登録されていることを確認
  try {
    // User モデルが登録されているか確認
    if (!mongoose.models.User) {
      console.log('Userモデルを登録...');
      // モデルが登録されていない場合は明示的に読み込む
      require('../../domain/models/user.model');
    } else {
      console.log('既存のUserモデルを使用します');
    }
  } catch (err) {
    console.error('モデル登録中にエラーが発生しました:', err);
  }
  
  // DIコンテナへの登録
  container.register('DatabaseConnection', { useValue: dbConnection });
  
  // リポジトリ
  container.register<IUserRepository>('IUserRepository', { useClass: MongoUserRepository });
  container.register<IFortuneRepository>('IFortuneRepository', { useClass: MongoFortuneRepository });
  
  try {
    container.register('ISubscriptionRepository', { 
      useClass: require('../repositories/MongoSubscriptionRepository').default 
    });
    console.log('ISubscriptionRepositoryが正常に登録されました');
  } catch (error) {
    console.error('ISubscriptionRepositoryの登録に失敗しました:', error);
  }

  try {
    container.register('ITeamRepository', { 
      useClass: require('../repositories/MongoTeamRepository').MongoTeamRepository 
    });
    console.log('ITeamRepositoryが正常に登録されました');
  } catch (error) {
    console.error('ITeamRepositoryの登録に失敗しました:', error);
  }

  try {
    container.register('IConversationRepository', { 
      useClass: require('../repositories/MongoConversationRepository').MongoConversationRepository 
    });
    console.log('IConversationRepositoryが正常に登録されました');
  } catch (error) {
    console.error('IConversationRepositoryの登録に失敗しました:', error);
  }
  
  // モデル
  try {
    const FortuneModel = mongoose.model('Fortune');
    container.register('FortuneModel', { useValue: FortuneModel });
  } catch (e) {
    // モデルがまだ登録されていない場合、ドメインモデルを使用
    const FortuneModel = require('../../domain/models/fortune.model').default;
    container.register('FortuneModel', { useValue: FortuneModel });
  }
  
  try {
    // 事前にモデルがロードされていることを確認
    if (!mongoose.models.Subscription) {
      // モデルが登録されていない場合は明示的に読み込む
      require('../../domain/models/subscription.model');
      console.log('Subscriptionモデルを登録しました');
    }
    
    // モデルを取得
    const SubscriptionModel = mongoose.model('Subscription');
    container.register('SubscriptionModel', { useValue: SubscriptionModel });
    console.log('SubscriptionModelが正常に登録されました');
  } catch (error) {
    console.error('SubscriptionModelの登録に失敗しました:', error);
  }
  
  // サービス
  container.register<ITokenService>('ITokenService', { useClass: JwtTokenService });
  container.register('ElementalCalculatorService', { useClass: ElementalCalculatorService });
  
  // サブスクリプション関連サービスを登録
  try {
    container.register('SubscriptionService', { 
      useClass: require('../../application/services/subscription.service').SubscriptionService 
    });
    container.register('AiModelSelectorService', { 
      useClass: require('../../application/services/ai-model-selector.service').AiModelSelectorService 
    });
    
    console.log('サブスクリプションサービスが正常に登録されました');
  } catch (error) {
    console.error('サブスクリプションサービスの登録に失敗しました:', error);
  }
  
  // 四柱推命計算サービスを登録
  try {
    const { SajuCalculatorService } = require('../../application/services/saju-calculator.service');
    const { BirthLocationService } = require('../../application/services/birth-location.service');
    
    // 先に BirthLocationService を登録
    container.register('BirthLocationService', { useClass: BirthLocationService });
    console.log('BirthLocationServiceが正常に登録されました');
    
    // SajuCalculatorService を登録
    container.register('SajuCalculatorService', { useClass: SajuCalculatorService });
    console.log('SajuCalculatorServiceが正常に登録されました');
  } catch (error) {
    console.error('SajuCalculatorServiceの登録に失敗しました:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
  
  // チーム相性サービスを登録
  try {
    const { TeamCompatibilityService } = require('../../application/services/team-compatibility.service');
    container.register('TeamCompatibilityService', { useClass: TeamCompatibilityService });
    console.log('TeamCompatibilityServiceが正常に登録されました');
  } catch (error) {
    console.error('TeamCompatibilityServiceの登録に失敗しました:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
  
  // 会話サービスを登録
  try {
    const { ConversationService } = require('../../application/services/conversation.service');
    container.register('ConversationService', { useClass: ConversationService });
    console.log('ConversationServiceが正常に登録されました');
  } catch (error) {
    console.error('ConversationServiceの登録に失敗しました:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
  
  // Claude AI サービスを登録
  try {
    const { ClaudeAIService } = require('../external/ClaudeAIService');
    const claudeApiKey = process.env.CLAUDE_API_KEY || 'dummy-api-key';
    const claudeApiUrl = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
    
    container.register('ClaudeApiKey', { useValue: claudeApiKey });
    container.register('ClaudeApiUrl', { useValue: claudeApiUrl });
    container.register('IAIService', { useClass: ClaudeAIService });
    console.log('ClaudeAIServiceが正常に登録されました');
  } catch (error) {
    console.error('ClaudeAIServiceの登録に失敗しました:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
  
  // ユースケース
  container.register('UserAuthenticationUseCase', { useClass: UserAuthenticationUseCase });
  container.register('UserRegistrationUseCase', { useClass: UserRegistrationUseCase });
  container.register('GetUserProfileUseCase', { useClass: GetUserProfileUseCase });
  container.register('UpdateUserProfileUseCase', { useClass: UpdateUserProfileUseCase });
  container.register('UpdateUserPasswordUseCase', { useClass: UpdateUserPasswordUseCase });
  
  // コントローラー
  container.register('FortuneController', { useClass: FortuneController });
  
  // 追加コントローラーとミドルウェアの登録
  try {
    const { AuthController } = require('../../interfaces/http/controllers/auth.controller');
    container.register('AuthController', { useClass: AuthController });
    console.log('AuthControllerが正常に登録されました');
    
    // 明示的にAuthMiddlewareを登録 (追加)
    const { AuthMiddleware } = require('../../interfaces/http/middlewares/auth.middleware');
    container.register(AuthMiddleware, { useClass: AuthMiddleware });
    console.log('AuthMiddlewareが正常に登録されました');
  } catch (error) {
    console.error('AuthController/AuthMiddlewareの登録に失敗しました:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
  
  try {
    container.register('SubscriptionController', { 
      useClass: require('../../interfaces/http/controllers/subscription.controller').SubscriptionController 
    });
    console.log('SubscriptionControllerが正常に登録されました');
  } catch (error) {
    console.error('SubscriptionControllerの登録に失敗しました:', error);
  }
  
  // UserControllerを登録
  try {
    const { UserController } = require('../../interfaces/http/controllers/user.controller');
    container.register('UserController', { useClass: UserController });
    
    // UserControllerが依存するユースケースを文字列トークンとしても登録
    container.register('GetUserProfileUseCase', { useClass: GetUserProfileUseCase });
    container.register('UpdateUserProfileUseCase', { useClass: UpdateUserProfileUseCase });
    container.register('UpdateUserPasswordUseCase', { useClass: UpdateUserPasswordUseCase });
    
    console.log('UserControllerが正常に登録されました');
  } catch (error) {
    console.error('UserControllerの登録に失敗しました:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
  
  // ConversationControllerを登録
  try {
    const { ConversationController } = require('../../interfaces/http/controllers/conversation.controller');
    container.register('ConversationController', { useClass: ConversationController });
    // 文字列トークンとしてのAuthMiddlewareも登録
    container.register('AuthMiddleware', { useClass: AuthMiddleware });
    console.log('ConversationControllerとAuthMiddlewareが正常に登録されました');
  } catch (error) {
    console.error('ConversationControllerの登録に失敗しました:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
  
  // イベント駆動アーキテクチャの設定
  setupEventDrivenArchitecture();
}

/**
 * アプリケーション起動時にイベントハンドラーを初期化
 */
export function initializeEventHandlers(): void {
  console.log('イベントハンドラーの初期化を開始します...');
  
  try {
    // コンテナにイベントバスが正しく登録されているか確認
    const eventBus = container.resolve<IEventBus>('IEventBus');
    console.log('イベントバスが正常に解決されました');
  } catch (error) {
    console.error('イベントバスの解決に失敗しました:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    
    // エラー発生時にコンテナを再設定
    console.log('コンテナを再設定します...');
    container.register<IEventBus>('IEventBus', {
      useClass: InMemoryEventBus
    });
    
    // イベントストアも再登録
    container.register<IEventStore>('IEventStore', {
      useClass: InMemoryEventStore
    });
    
    console.log('イベントバスとイベントストアを再登録しました');
  }
  
  // ハンドラー登録を試行（各ハンドラーを個別にトライキャッチで包む）
  console.log('イベントハンドラーの登録を試行します...');
  
  // UserEventHandlers
  try {
    console.log('UserEventHandlersを初期化中...');
    const userHandlers = container.resolve('UserEventHandlers');
    console.log('UserEventHandlersが正常に初期化されました');
  } catch (error) {
    console.error('UserEventHandlersの初期化に失敗しました:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
  
  // TeamEventHandlers
  try {
    console.log('TeamEventHandlersを初期化中...');
    const teamHandlers = container.resolve('TeamEventHandlers');
    console.log('TeamEventHandlersが正常に初期化されました');
  } catch (error) {
    console.error('TeamEventHandlersの初期化に失敗しました:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
  
  // ConversationEventHandlers
  try {
    console.log('ConversationEventHandlersを初期化中...');
    const conversationHandlers = container.resolve('ConversationEventHandlers');
    console.log('ConversationEventHandlersが正常に初期化されました');
  } catch (error) {
    console.error('ConversationEventHandlersの初期化に失敗しました:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
  
  console.log('イベントハンドラーの初期化が完了しました');
}

/**
 * DIContainerをリセット (主にテスト用)
 */
export function resetContainer(): void {
  container.clearInstances();
}

// AuthMiddlewareを事前に登録
try {
  const { AuthMiddleware } = require('../../interfaces/http/middlewares/auth.middleware');
  container.register('AuthMiddleware', { useClass: AuthMiddleware });
  console.log('事前登録: AuthMiddlewareが登録されました');
} catch (error) {
  console.error('事前登録: AuthMiddlewareの登録に失敗しました:', error);
}

// アプリケーション起動時に依存性を設定
configureContainer();

export default container;
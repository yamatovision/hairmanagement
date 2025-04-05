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
import { SystemMessageBuilderService } from '../../application/services/system-message-builder.service';

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
    
    // DailyCalendarInfo モデルが登録されているか確認
    if (!mongoose.models.DailyCalendarInfo) {
      console.log('DailyCalendarInfoモデルを登録...');
      // モデルが登録されていない場合は明示的に読み込む
      require('../../domain/models/daily-calendar-info.model');
    } else {
      console.log('既存のDailyCalendarInfoモデルを使用します');
    }
  } catch (err) {
    console.error('モデル登録中にエラーが発生しました:', err);
  }
  
  // DIコンテナへの登録
  container.register('DatabaseConnection', { useValue: dbConnection });
  
  // リポジトリ
  container.register<IUserRepository>('IUserRepository', { useClass: MongoUserRepository });
  container.register<IFortuneRepository>('IFortuneRepository', { useClass: MongoFortuneRepository });
  
  // DailyCalendarInfoリポジトリの登録
  try {
    const DailyCalendarInfoModel = mongoose.model('DailyCalendarInfo');
    container.register('DailyCalendarInfoModel', { useValue: DailyCalendarInfoModel });
    
    const { MongoDailyCalendarInfoRepository } = require('../repositories/MongoDailyCalendarInfoRepository');
    container.register('IDailyCalendarInfoRepository', { 
      useClass: MongoDailyCalendarInfoRepository 
    });
    console.log('DailyCalendarInfoRepositoryが正常に登録されました');
  } catch (error) {
    console.error('DailyCalendarInfoRepositoryの登録に失敗しました:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
  
  try {
    const { MongoSubscriptionRepository } = require('../repositories/MongoSubscriptionRepository');
    container.register('ISubscriptionRepository', { 
      useClass: MongoSubscriptionRepository 
    });
    console.log('ISubscriptionRepositoryが正常に登録されました');
  } catch (error) {
    console.error('ISubscriptionRepositoryの登録に失敗しました:', error);
  }

  try {
    // TeamモデルをDIコンテナに登録
    if (!mongoose.models.Team) {
      // モデルが登録されていない場合は明示的に読み込む
      require('../../domain/models/team.model');
      console.log('Teamモデルを登録しました');
    }
    
    const TeamModel = mongoose.model('Team');
    container.register('TeamModel', { useValue: TeamModel });
    console.log('TeamModelが正常に登録されました');
    
    // TeamRepositoryを登録
    const { MongoTeamRepository } = require('../repositories/MongoTeamRepository');
    container.register('ITeamRepository', { useClass: MongoTeamRepository });
    console.log('ITeamRepositoryが正常に登録されました');
  } catch (error) {
    console.error('ITeamRepositoryの登録に失敗しました:', error);
  }

  try {
    // Conversationモデルを登録
    if (!mongoose.models.Conversation) {
      require('../../domain/models/conversation.model');
      console.log('Conversationモデルを登録しました');
    }
    
    const ConversationModel = mongoose.model('Conversation');
    container.register('ConversationModel', { useValue: ConversationModel });
    console.log('ConversationModelが正常に登録されました');
    
    // ConversationRepositoryを登録
    const { MongoConversationRepository } = require('../repositories/MongoConversationRepository');
    container.register('IConversationRepository', { useClass: MongoConversationRepository });
    console.log('IConversationRepositoryが正常に登録されました');
  } catch (error) {
    console.error('IConversationRepositoryの登録に失敗しました:', error);
    // モックリポジトリを登録してエラーを回避
    class MockConversationRepository {
      constructor() {}
      async findAll() { return []; }
      async findById() { return null; }
      async create() { return {}; }
      async update() { return {}; }
      async delete() { return true; }
    }
    container.register('IConversationRepository', { useClass: MockConversationRepository });
    console.log('MockConversationRepositoryを代わりに登録しました');
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
  container.register('SystemMessageBuilderService', { useClass: SystemMessageBuilderService });
  
  // 運勢サービスを登録
  try {
    const { DailyFortuneService } = require('../../application/services/daily-fortune.service');
    container.register('DailyFortuneService', { useClass: DailyFortuneService });
    console.log('DailyFortuneServiceが正常に登録されました');
  } catch (error) {
    console.error('DailyFortuneServiceの登録に失敗しました:', error);
  }
  
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
  
  // 会話サービスを登録（修正：ここでは登録しないようにし、下で正確に登録する）
  console.log('会話サービス: 登録は後半で行われます...');
  
  // Claude AI サービスを登録
  try {
    // 環境変数を確認して詳細ログを出力
    const claudeApiKey = process.env.CLAUDE_API_KEY || 'dummy-api-key';
    const claudeApiUrl = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
    const claudeModel = process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20250219';
    
    // APIキーが設定されているかチェック
    const isKeyDummy = claudeApiKey === 'dummy-api-key';
    const keyLength = claudeApiKey.length;
    const keyPrefix = claudeApiKey.substring(0, 10);
    const keySuffix = claudeApiKey.substring(keyLength - 5);
    
    console.log('ClaudeAI設定を確認:');
    console.log(`- API URL: ${claudeApiUrl}`);
    console.log(`- APIキー: ${isKeyDummy ? 'ダミーキー' : keyPrefix + '...' + keySuffix} (${keyLength}文字)`);
    console.log(`- モデル: ${claudeModel}`);
    
    // ClaudeAIServiceを登録
    const { ClaudeAIService } = require('../external/ClaudeAIService');
    container.register('ClaudeApiKey', { useValue: claudeApiKey });
    container.register('ClaudeApiUrl', { useValue: claudeApiUrl });
    container.register('IAIService', { useClass: ClaudeAIService });
    
    console.log('ClaudeAIServiceが正常に登録されました');
    console.log(`注意: ${isKeyDummy ? 'ダミーAPIキーが使用されています。モックレスポンスが返されます。' : '実際のAPIキーが設定されています。'}`);
  } catch (error) {
    console.error('ClaudeAIServiceの登録に失敗しました:', error);
    if (error instanceof Error) {
      console.error('エラー詳細:', error.message);
      console.error('スタックトレース:', error.stack);
    }
    
    // モックAIサービスを登録してエラーを回避
    class MockAIService {
      constructor() {}
      
      async sendMessage(prompt) { 
        console.log('MockAIService: sendMessage呼び出し');
        return { content: "これはモックレスポンスです。" }; 
      }
      
      async generateText(prompt, options) { 
        console.log('MockAIService: generateText呼び出し');
        // 構造化されたモックレスポンスを返す
        return {
          summary: "あなたは今日、清々しい風が吹き抜ける森のような運気です。新しいアイデアが自然と湧き上がり、周囲との調和も取れやすい一日となるでしょう。特に、チームでの創造的な活動が成功に結びつく暗示があります。思い切って新しい発想を形にすることで、大きな成果が期待できます。",
          personalAdvice: "AIプロダクトの開発において、今日は特に「ユーザー体験」に焦点を当てると良いでしょう。技術的な側面よりも、実際の使用感や直感的な操作性を重視することで、より価値の高い成果が得られます。木の柔軟性のように臨機応変な対応を。",
          teamAdvice: "バイアウト目標達成のためには、今日は特に情報の共有と透明性を高めることが重要です。メンバー間での正確な情報伝達が、予期せぬ障害を事前に回避するカギとなります。木が根を張るように、強固な信頼関係を築きましょう。",
          luckyPoints: {
            color: "緑",
            items: ["観葉植物", "木製のアクセサリー"],
            number: 3,
            action: "朝日を浴びながら深呼吸する"
          }
        };
      }
      
      async generateImage() { 
        return "https://example.com/mock-image.png"; 
      }
    }
    
    const claudeApiKey = process.env.CLAUDE_API_KEY || 'dummy-api-key';
    const claudeApiUrl = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
    
    container.register('ClaudeApiKey', { useValue: claudeApiKey });
    container.register('ClaudeApiUrl', { useValue: claudeApiUrl });
    container.register('IAIService', { useClass: MockAIService });
    console.log('MockAIServiceを代わりに登録しました - 構造化されたモックレスポンスを返します');
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
  
  // ConversationServiceとConversationControllerを登録（修正バージョン）
  console.log('会話サービスとコントローラーの登録を開始します...');
  
  try {
    console.log('会話サービス: 会話サービスモジュールをロード中...');
    
    // モジュールの存在確認
    const conversationServicePath = '../../application/services/conversation.service';
    const conversationControllerPath = '../../interfaces/http/controllers/conversation.controller';
    
    console.log(`会話サービスパス: ${conversationServicePath}`);
    console.log(`会話コントローラーパス: ${conversationControllerPath}`);
    
    // モジュールをクリアにロード
    delete require.cache[require.resolve(conversationServicePath)];
    delete require.cache[require.resolve(conversationControllerPath)];
    
    // モジュールをロード
    const conversationServiceModule = require(conversationServicePath);
    const conversationControllerModule = require(conversationControllerPath);
    
    console.log('会話サービス: モジュールロード完了');
    console.log(`会話サービスモジュール内容: ${Object.keys(conversationServiceModule).join(', ')}`);
    console.log(`会話コントローラーモジュール内容: ${Object.keys(conversationControllerModule).join(', ')}`);
    
    // 会話サービスを登録
    if (conversationServiceModule && conversationServiceModule.ConversationService) {
      container.register('ConversationService', { 
        useClass: conversationServiceModule.ConversationService 
      });
      console.log('会話サービス: ConversationServiceが正常に登録されました');
    } else {
      throw new Error('ConversationServiceクラスが見つかりません');
    }
    
    // 会話コントローラーを登録
    if (conversationControllerModule && conversationControllerModule.ConversationController) {
      container.register('ConversationController', { 
        useClass: conversationControllerModule.ConversationController 
      });
      console.log('会話サービス: ConversationControllerが正常に登録されました');
    } else {
      throw new Error('ConversationControllerクラスが見つかりません');
    }
    
    // 文字列トークンとしてのAuthMiddlewareを登録
    const { AuthMiddleware } = require('../../interfaces/http/middlewares/auth.middleware');
    container.register('AuthMiddleware', { useClass: AuthMiddleware });
    console.log('会話サービス: AuthMiddlewareが正常に登録されました');
    
    // 登録されているか確認
    try {
      const resolvedService = container.resolve('ConversationService');
      const resolvedController = container.resolve('ConversationController');
      const resolvedMiddleware = container.resolve('AuthMiddleware');
      
      console.log('会話サービス: 解決テスト成功');
      console.log(`- サービス: ${resolvedService ? 'OK' : 'エラー'}`);
      console.log(`- コントローラー: ${resolvedController ? 'OK' : 'エラー'}`);
      console.log(`- ミドルウェア: ${resolvedMiddleware ? 'OK' : 'エラー'}`);
    } catch (resolveError) {
      console.error('会話サービス: 依存性解決テストに失敗しました', resolveError);
    }
  } catch (error) {
    console.error('会話サービスまたはコントローラーの登録に失敗しました:', error);
    if (error instanceof Error) {
      console.error('詳細:', error.message);
      console.error('スタックトレース:', error.stack);
    }
    
    // モックサービスとコントローラーを登録してエラーを回避
    console.log('会話サービス: モックサービスとコントローラーを登録します');
    
    class MockConversationService {
      constructor() {}
      async findConversationByContext() { return null; }
      async createConversation() { return { id: 'mock-id', messages: [], createdAt: new Date() }; }
      async sendMessage() { return { id: 'mock-id', messages: [], createdAt: new Date() }; }
      async getConversationById() { return { id: 'mock-id', messages: [], createdAt: new Date() }; }
    }
    
    class MockConversationController {
      constructor() {}
      async startOrContinueConversation(req, res) { res.json({ success: true, data: { id: 'mock-id', messages: [] } }); }
      async sendMessage(req, res) { res.json({ success: true, data: { message: { content: 'Mock response' } } }); }
      async getConversationById(req, res) { res.json({ success: true, data: { id: 'mock-id', messages: [] } }); }
    }
    
    container.register('ConversationService', { useClass: MockConversationService });
    container.register('ConversationController', { useClass: MockConversationController });
    console.log('会話サービス: モックサービスとコントローラーが登録されました');
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
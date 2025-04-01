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
    mongoose.connect(DB_URL);
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
  container.register(UserEventHandlers, {
    useClass: UserEventHandlers
  });
  
  container.register(TeamEventHandlers, {
    useClass: TeamEventHandlers
  });
  
  container.register(ConversationEventHandlers, {
    useClass: ConversationEventHandlers
  });
}

/**
 * 依存性注入コンテナの設定
 * すべての依存関係をここで登録
 */
export function configureContainer(): void {
  // データベース接続
  const dbConnection = setupDatabase();
  container.register('DatabaseConnection', { useValue: dbConnection });
  
  // リポジトリ
  container.register<IUserRepository>('IUserRepository', { useClass: MongoUserRepository });
  container.register<IFortuneRepository>('IFortuneRepository', { useClass: MongoFortuneRepository });
  
  // サービス
  container.register<ITokenService>('ITokenService', { useClass: JwtTokenService });
  container.register<ElementalCalculatorService>('ElementalCalculatorService', { useClass: ElementalCalculatorService });
  
  // ユースケース
  container.register<UserAuthenticationUseCase>('UserAuthenticationUseCase', { useClass: UserAuthenticationUseCase });
  container.register<UserRegistrationUseCase>('UserRegistrationUseCase', { useClass: UserRegistrationUseCase });
  container.register<GetUserProfileUseCase>('GetUserProfileUseCase', { useClass: GetUserProfileUseCase });
  container.register<UpdateUserProfileUseCase>('UpdateUserProfileUseCase', { useClass: UpdateUserProfileUseCase });
  container.register<UpdateUserPasswordUseCase>('UpdateUserPasswordUseCase', { useClass: UpdateUserPasswordUseCase });
  
  // イベント駆動アーキテクチャの設定
  setupEventDrivenArchitecture();
}

/**
 * アプリケーション起動時にイベントハンドラーを初期化
 */
export function initializeEventHandlers(): void {
  // シングルトンインスタンスを取得するだけで、コンストラクタ内でイベントバスに登録される
  container.resolve(UserEventHandlers);
  container.resolve(TeamEventHandlers);
  container.resolve(ConversationEventHandlers);
}

/**
 * DIContainerをリセット (主にテスト用)
 */
export function resetContainer(): void {
  container.clearInstances();
}

// アプリケーション起動時に依存性を設定
configureContainer();

export default container;
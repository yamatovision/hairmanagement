# アイデンティティ管理ドメイン - クリーンアーキテクチャ移行計画

## 現状分析

現在のアイデンティティ管理システムはMVC+サービスパターンで実装されており、以下のコンポーネントで構成されています：

1. **モデル層**
   - `UserModel`: ユーザー情報のスキーマとデータアクセス
   - `TokenModel`: 認証トークン管理のスキーマとデータアクセス

2. **コントローラー層**
   - `authController`: 認証関連のエンドポイント処理

3. **サービス層**
   - `authService`: ユーザー認証ロジックと各種トークン生成・検証

4. **ミドルウェア**
   - `authMiddleware`: リクエスト認証と権限チェック
   - `roleMiddleware`: ロールベースの認可制御
   - `validationMiddleware`: 入力検証

## クリーンアーキテクチャへの移行計画

### 1. ドメイン層の実装

#### 1.1 エンティティとバリューオブジェクト

**Userエンティティ**
```typescript
// domain/entities/User.ts
import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';
import { ElementalProfile } from '../value-objects/ElementalProfile';
import { UserRole } from '../value-objects/UserRole';
import { Entity } from './Entity';

export class User extends Entity {
  constructor(
    private readonly _email: Email,
    private readonly _name: string,
    private readonly _password: Password,
    private readonly _birthDate: Date,
    private readonly _role: UserRole,
    private readonly _elementalProfile: ElementalProfile,
    private _isActive: boolean = true,
    private _lastLoginAt?: Date,
    id?: string
  ) {
    super(id);
    this.validateName(_name);
  }

  // ゲッター
  get email(): Email { return this._email; }
  get name(): string { return this._name; }
  get birthDate(): Date { return this._birthDate; }
  get role(): UserRole { return this._role; }
  get elementalProfile(): ElementalProfile { return this._elementalProfile; }
  get isActive(): boolean { return this._isActive; }
  get lastLoginAt(): Date | undefined { return this._lastLoginAt; }

  // パスワード検証メソッド（内部のみアクセス可能）
  verifyPassword(plainPassword: string): Promise<boolean> {
    return this._password.compare(plainPassword);
  }

  // ビジネスルール：名前の検証
  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('名前は2文字以上である必要があります');
    }
    if (name.length > 50) {
      throw new Error('名前は50文字以下である必要があります');
    }
  }

  // ユーザーの有効化/無効化
  activate(): User {
    return new User(
      this._email,
      this._name,
      this._password,
      this._birthDate,
      this._role,
      this._elementalProfile,
      true,
      this._lastLoginAt,
      this.id
    );
  }

  deactivate(): User {
    return new User(
      this._email,
      this._name,
      this._password,
      this._birthDate,
      this._role,
      this._elementalProfile,
      false,
      this._lastLoginAt,
      this.id
    );
  }

  // ログイン履歴の更新
  updateLastLogin(): User {
    return new User(
      this._email,
      this._name,
      this._password,
      this._birthDate,
      this._role,
      this._elementalProfile,
      this._isActive,
      new Date(),
      this.id
    );
  }

  // パスワード更新
  updatePassword(newPassword: Password): User {
    return new User(
      this._email,
      this._name,
      newPassword,
      this._birthDate,
      this._role,
      this._elementalProfile,
      this._isActive,
      this._lastLoginAt,
      this.id
    );
  }

  // 基本データ更新
  updateDetails(name?: string, role?: UserRole, elementalProfile?: ElementalProfile): User {
    return new User(
      this._email,
      name || this._name,
      this._password,
      this._birthDate,
      role || this._role,
      elementalProfile || this._elementalProfile,
      this._isActive,
      this._lastLoginAt,
      this.id
    );
  }

  // DTO変換
  toDTO(): object {
    return {
      id: this.id,
      email: this._email.value,
      name: this._name,
      birthDate: this._birthDate.toISOString().split('T')[0],
      role: this._role.value,
      elementalProfile: this._elementalProfile.toDTO(),
      isActive: this._isActive,
      lastLoginAt: this._lastLoginAt ? this._lastLoginAt.toISOString() : null
    };
  }
}
```

**バリューオブジェクト：Email**
```typescript
// domain/value-objects/Email.ts
export class Email {
  constructor(private readonly _value: string) {
    this.validate(_value);
  }

  get value(): string {
    return this._value;
  }

  private validate(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('無効なメールアドレス形式です');
    }
  }

  equals(other: Email): boolean {
    return this._value.toLowerCase() === other.value.toLowerCase();
  }

  toString(): string {
    return this._value;
  }
}
```

**バリューオブジェクト：Password**
```typescript
// domain/value-objects/Password.ts
import bcrypt from 'bcrypt';

export class Password {
  private static readonly SALT_ROUNDS = 10;

  constructor(private readonly _hash: string, isHashed: boolean = false) {
    if (!isHashed) {
      this.validatePassword(_hash);
    }
  }

  get hash(): string {
    return this._hash;
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new Error('パスワードは最低8文字以上必要です');
    }
    
    // より厳密な検証ルールも追加可能
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (!(hasUppercase && hasLowercase && hasNumbers)) {
      throw new Error('パスワードは大文字、小文字、数字を含む必要があります');
    }
  }

  static async fromPlainText(plainPassword: string): Promise<Password> {
    const hash = await bcrypt.hash(plainPassword, this.SALT_ROUNDS);
    return new Password(hash, true);
  }

  async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this._hash);
  }
}
```

**バリューオブジェクト：UserRole**
```typescript
// domain/value-objects/UserRole.ts
export enum UserRoleEnum {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin'
}

export class UserRole {
  private static readonly ROLE_HIERARCHY = {
    [UserRoleEnum.EMPLOYEE]: 0,
    [UserRoleEnum.MANAGER]: 1,
    [UserRoleEnum.ADMIN]: 2,
    [UserRoleEnum.SUPERADMIN]: 3
  };

  constructor(private readonly _value: UserRoleEnum) {}

  get value(): string {
    return this._value;
  }

  hasPermissionFor(requiredRole: UserRole): boolean {
    const userRoleLevel = UserRole.ROLE_HIERARCHY[this._value];
    const requiredRoleLevel = UserRole.ROLE_HIERARCHY[requiredRole.value as UserRoleEnum];
    return userRoleLevel >= requiredRoleLevel;
  }

  static fromString(role: string): UserRole {
    if (!Object.values(UserRoleEnum).includes(role as UserRoleEnum)) {
      throw new Error(`無効なロール: ${role}`);
    }
    return new UserRole(role as UserRoleEnum);
  }

  equals(other: UserRole): boolean {
    return this._value === other.value;
  }
}
```

**バリューオブジェクト：Token**
```typescript
// domain/value-objects/Token.ts
export class Token {
  constructor(
    private readonly _value: string,
    private readonly _expiresAt: Date,
    private readonly _type: 'access' | 'refresh' | 'reset' | 'verify'
  ) {}

  get value(): string {
    return this._value;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get type(): string {
    return this._type;
  }

  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  getRemainingTime(): number {
    const now = new Date().getTime();
    const expiry = this._expiresAt.getTime();
    return Math.max(0, Math.floor((expiry - now) / 1000));
  }
}
```

#### 1.2 ドメインイベント

```typescript
// domain/events/UserEvents.ts
import { DomainEvent } from './DomainEvent';
import { User } from '../entities/User';

export class UserCreated extends DomainEvent {
  constructor(public readonly user: User) {
    super();
  }
}

export class UserLoggedIn extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly timestamp: Date = new Date()
  ) {
    super();
  }
}

export class UserPasswordChanged extends DomainEvent {
  constructor(public readonly userId: string) {
    super();
  }
}

export class UserActivated extends DomainEvent {
  constructor(public readonly userId: string) {
    super();
  }
}

export class UserDeactivated extends DomainEvent {
  constructor(public readonly userId: string) {
    super();
  }
}
```

#### 1.3 リポジトリインターフェース

```typescript
// domain/repositories/IUserRepository.ts
import { User } from '../entities/User';
import { Email } from '../value-objects/Email';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<User>;
  findAll(limit?: number, offset?: number): Promise<User[]>;
  findByIds(ids: string[]): Promise<User[]>;
  count(query?: any): Promise<number>;
}

// domain/repositories/ITokenRepository.ts
import { Token } from '../value-objects/Token';

export interface ITokenRepository {
  save(userId: string, token: Token): Promise<void>;
  findByValue(token: string, type: string): Promise<{ userId: string, token: Token } | null>;
  findByUserIdAndType(userId: string, type: string): Promise<{ userId: string, token: Token }[]>;
  invalidateByUserIdAndType(userId: string, type: string): Promise<void>;
  invalidateByValue(token: string): Promise<void>;
  deleteExpired(): Promise<number>;
}
```

### 2. アプリケーション層の実装

#### 2.1 ユースケースとコマンドハンドラー

```typescript
// application/commands/RegisterUserCommand.ts
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Password } from '../../domain/value-objects/Password';
import { Email } from '../../domain/value-objects/Email';
import { UserRole, UserRoleEnum } from '../../domain/value-objects/UserRole';
import { ElementalProfile } from '../../domain/value-objects/ElementalProfile';
import { UserCreated } from '../../domain/events/UserEvents';
import { EventPublisher } from '../events/EventPublisher';

export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly name: string,
    public readonly birthDate: string,
    public readonly role: string = UserRoleEnum.EMPLOYEE
  ) {}
}

export class RegisterUserHandler {
  constructor(
    private userRepository: IUserRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    const email = new Email(command.email);
    
    // 同じメールアドレスが既に存在するか確認
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('このメールアドレスは既に使用されています');
    }

    // 入力値のバリデーション
    const password = await Password.fromPlainText(command.password);
    const birthDate = new Date(command.birthDate);
    const role = UserRole.fromString(command.role);
    
    // 生年月日から五行属性生成（五行エンジンの利用を想定）
    const elementalProfile = ElementalProfile.fromBirthDate(birthDate);
    
    // ユーザー作成
    const user = new User(
      email,
      command.name,
      password,
      birthDate,
      role,
      elementalProfile
    );
    
    // リポジトリに保存
    const savedUser = await this.userRepository.save(user);
    
    // ドメインイベント発行
    this.eventPublisher.publish(new UserCreated(savedUser));
    
    return savedUser;
  }
}
```

```typescript
// application/commands/LoginUserCommand.ts
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Email } from '../../domain/value-objects/Email';
import { Token } from '../../domain/value-objects/Token';
import { ITokenRepository } from '../../domain/repositories/ITokenRepository';
import { UserLoggedIn } from '../../domain/events/UserEvents';
import { EventPublisher } from '../events/EventPublisher';
import { AuthenticationError } from '../errors/ApplicationError';
import { TokenService } from '../services/TokenService';

export class LoginUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {}
}

export class LoginUserHandler {
  constructor(
    private userRepository: IUserRepository,
    private tokenRepository: ITokenRepository,
    private tokenService: TokenService,
    private eventPublisher: EventPublisher
  ) {}

  async execute(command: LoginUserCommand): Promise<{ user: any, accessToken: Token, refreshToken: Token }> {
    const email = new Email(command.email);
    
    // ユーザー検索
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new AuthenticationError('メールアドレスまたはパスワードが正しくありません');
    }
    
    // パスワード検証
    const isPasswordValid = await user.verifyPassword(command.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('メールアドレスまたはパスワードが正しくありません');
    }
    
    // ユーザーログイン時間更新
    const updatedUser = user.updateLastLogin();
    await this.userRepository.save(updatedUser);
    
    // トークン生成
    const accessToken = this.tokenService.generateAccessToken(updatedUser);
    const refreshToken = this.tokenService.generateRefreshToken(updatedUser);
    
    // リフレッシュトークンをDBに保存
    await this.tokenRepository.save(updatedUser.id, refreshToken);
    
    // ドメインイベント発行
    this.eventPublisher.publish(new UserLoggedIn(updatedUser.id));
    
    return {
      user: updatedUser.toDTO(),
      accessToken,
      refreshToken
    };
  }
}
```

#### 2.2 認証サービスの実装

```typescript
// application/services/TokenService.ts
import jwt from 'jsonwebtoken';
import { User } from '../../domain/entities/User';
import { Token } from '../../domain/value-objects/Token';

export class TokenService {
  constructor(
    private readonly jwtSecret: string,
    private readonly accessTokenExpiresIn: string = '1h',
    private readonly refreshTokenExpiresIn: string = '7d',
    private readonly resetTokenExpiresIn: string = '1h',
    private readonly verifyTokenExpiresIn: string = '24h'
  ) {}

  generateAccessToken(user: User): Token {
    const payload = {
      sub: user.id,
      email: user.email.value,
      role: user.role.value
    };
    
    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiresIn
    });
    
    const decoded = jwt.decode(token) as { exp: number };
    const expiresAt = new Date(decoded.exp * 1000);
    
    return new Token(token, expiresAt, 'access');
  }

  generateRefreshToken(user: User): Token {
    const payload = {
      sub: user.id,
      type: 'refresh'
    };
    
    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiresIn
    });
    
    const decoded = jwt.decode(token) as { exp: number };
    const expiresAt = new Date(decoded.exp * 1000);
    
    return new Token(token, expiresAt, 'refresh');
  }

  generateResetToken(user: User): Token {
    const payload = {
      sub: user.id,
      type: 'reset',
      timestamp: Date.now()
    };
    
    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.resetTokenExpiresIn
    });
    
    const decoded = jwt.decode(token) as { exp: number };
    const expiresAt = new Date(decoded.exp * 1000);
    
    return new Token(token, expiresAt, 'reset');
  }

  generateVerificationToken(user: User): Token {
    const payload = {
      sub: user.id,
      type: 'verify',
      email: user.email.value
    };
    
    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.verifyTokenExpiresIn
    });
    
    const decoded = jwt.decode(token) as { exp: number };
    const expiresAt = new Date(decoded.exp * 1000);
    
    return new Token(token, expiresAt, 'verify');
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      return null;
    }
  }
}
```

```typescript
// application/services/AuthService.ts
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ITokenRepository } from '../../domain/repositories/ITokenRepository';
import { TokenService } from './TokenService';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { UserRole } from '../../domain/value-objects/UserRole';
import { User } from '../../domain/entities/User';
import { Token } from '../../domain/value-objects/Token';
import { AuthenticationError, NotFoundError } from '../errors/ApplicationError';
import { EventPublisher } from '../events/EventPublisher';
import { UserPasswordChanged } from '../../domain/events/UserEvents';

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private tokenRepository: ITokenRepository,
    private tokenService: TokenService,
    private eventPublisher: EventPublisher
  ) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('ユーザーが見つかりません');
    }
    return user;
  }

  async refreshToken(refreshTokenValue: string): Promise<{ accessToken: Token, refreshToken: Token }> {
    // リフレッシュトークンの検証
    const tokenData = await this.tokenRepository.findByValue(refreshTokenValue, 'refresh');
    if (!tokenData || tokenData.token.isExpired()) {
      throw new AuthenticationError('無効なリフレッシュトークンです');
    }
    
    // ユーザーの検証
    const user = await this.userRepository.findById(tokenData.userId);
    if (!user || !user.isActive) {
      throw new AuthenticationError('ユーザーが見つからないか無効です');
    }
    
    // 古いトークンを無効化
    await this.tokenRepository.invalidateByValue(refreshTokenValue);
    
    // 新しいトークンを生成
    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);
    
    // 新しいリフレッシュトークンを保存
    await this.tokenRepository.save(user.id, refreshToken);
    
    return { accessToken, refreshToken };
  }

  async logout(userId: string, refreshTokenValue: string): Promise<void> {
    await this.tokenRepository.invalidateByValue(refreshTokenValue);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('ユーザーが見つかりません');
    }
    
    // 現在のパスワードを検証
    const isPasswordValid = await user.verifyPassword(currentPassword);
    if (!isPasswordValid) {
      throw new AuthenticationError('現在のパスワードが正しくありません');
    }
    
    // 新しいパスワードのハッシュ化
    const newPasswordHash = await Password.fromPlainText(newPassword);
    
    // ユーザー更新
    const updatedUser = user.updatePassword(newPasswordHash);
    await this.userRepository.save(updatedUser);
    
    // 全てのリフレッシュトークンを無効化
    await this.tokenRepository.invalidateByUserIdAndType(userId, 'refresh');
    
    // ドメインイベント発行
    this.eventPublisher.publish(new UserPasswordChanged(userId));
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const emailObj = new Email(email);
    const user = await this.userRepository.findByEmail(emailObj);
    
    // ユーザーが存在しない場合も成功を返す（セキュリティ上の理由）
    if (!user) {
      return;
    }
    
    // 既存のリセットトークンを無効化
    await this.tokenRepository.invalidateByUserIdAndType(user.id, 'reset');
    
    // 新しいリセットトークンを生成
    const resetToken = this.tokenService.generateResetToken(user);
    
    // トークンを保存
    await this.tokenRepository.save(user.id, resetToken);
    
    // パスワードリセットメールの送信ロジック（外部サービス連携）
    // メール送信サービスの呼び出しを想定
    console.log(`リセットメール送信: ${email}, トークン: ${resetToken.value}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // トークンの検証
    const tokenData = await this.tokenRepository.findByValue(token, 'reset');
    if (!tokenData || tokenData.token.isExpired()) {
      throw new AuthenticationError('無効または期限切れのトークンです');
    }
    
    // トークンを無効化
    await this.tokenRepository.invalidateByValue(token);
    
    // ユーザーの取得
    const user = await this.userRepository.findById(tokenData.userId);
    if (!user) {
      throw new NotFoundError('ユーザーが見つかりません');
    }
    
    // 新しいパスワードのハッシュ化
    const newPasswordHash = await Password.fromPlainText(newPassword);
    
    // ユーザー更新
    const updatedUser = user.updatePassword(newPasswordHash);
    await this.userRepository.save(updatedUser);
    
    // 全てのリフレッシュトークンを無効化
    await this.tokenRepository.invalidateByUserIdAndType(user.id, 'refresh');
    
    // ドメインイベント発行
    this.eventPublisher.publish(new UserPasswordChanged(user.id));
  }
}
```

#### 2.3 DTOとマッパー

```typescript
// application/dtos/UserDto.ts
export interface UserDto {
  id: string;
  email: string;
  name: string;
  birthDate: string;
  role: string;
  elementalProfile: {
    mainElement: string;
    secondaryElement?: string;
    yinYang: string;
  };
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// application/dtos/AuthResponseDto.ts
export interface AuthResponseDto {
  user: UserDto;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}
```

### 3. インフラストラクチャ層の実装

#### 3.1 リポジトリ実装

```typescript
// infrastructure/repositories/MongoUserRepository.ts
import mongoose, { Model } from 'mongoose';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { UserMapper } from '../mappers/UserMapper';

export class MongoUserRepository implements IUserRepository {
  private userModel: Model<any>;
  private userMapper: UserMapper;

  constructor(userModel: Model<any>) {
    this.userModel = userModel;
    this.userMapper = new UserMapper();
  }

  async findById(id: string): Promise<User | null> {
    const userDoc = await this.userModel.findById(id).exec();
    if (!userDoc) {
      return null;
    }
    return this.userMapper.toDomain(userDoc);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const userDoc = await this.userModel.findOne({ email: email.value }).exec();
    if (!userDoc) {
      return null;
    }
    return this.userMapper.toDomain(userDoc);
  }

  async save(user: User): Promise<User> {
    const userDoc = this.userMapper.toPersistence(user);
    const savedDoc = await this.userModel.findByIdAndUpdate(
      user.id,
      userDoc,
      { new: true, upsert: true }
    ).exec();
    
    return this.userMapper.toDomain(savedDoc);
  }

  async findAll(limit = 10, offset = 0): Promise<User[]> {
    const userDocs = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
    
    return userDocs.map(doc => this.userMapper.toDomain(doc));
  }

  async findByIds(ids: string[]): Promise<User[]> {
    const userDocs = await this.userModel
      .find({ _id: { $in: ids } })
      .exec();
    
    return userDocs.map(doc => this.userMapper.toDomain(doc));
  }

  async count(query: any = {}): Promise<number> {
    return this.userModel.countDocuments(query).exec();
  }
}
```

```typescript
// infrastructure/repositories/MongoTokenRepository.ts
import mongoose, { Model } from 'mongoose';
import { ITokenRepository } from '../../domain/repositories/ITokenRepository';
import { Token } from '../../domain/value-objects/Token';

export class MongoTokenRepository implements ITokenRepository {
  private tokenModel: Model<any>;

  constructor(tokenModel: Model<any>) {
    this.tokenModel = tokenModel;
  }

  async save(userId: string, token: Token): Promise<void> {
    await this.tokenModel.create({
      userId,
      token: token.value,
      type: token.type,
      expiresAt: token.expiresAt,
      isRevoked: false
    });
  }

  async findByValue(tokenValue: string, type: string): Promise<{ userId: string, token: Token } | null> {
    const tokenDoc = await this.tokenModel.findOne({
      token: tokenValue,
      type,
      isRevoked: false
    }).exec();
    
    if (!tokenDoc) {
      return null;
    }
    
    return {
      userId: tokenDoc.userId.toString(),
      token: new Token(tokenDoc.token, new Date(tokenDoc.expiresAt), tokenDoc.type)
    };
  }

  async findByUserIdAndType(userId: string, type: string): Promise<{ userId: string, token: Token }[]> {
    const tokenDocs = await this.tokenModel.find({
      userId,
      type,
      isRevoked: false
    }).exec();
    
    return tokenDocs.map(doc => ({
      userId: doc.userId.toString(),
      token: new Token(doc.token, new Date(doc.expiresAt), doc.type)
    }));
  }

  async invalidateByUserIdAndType(userId: string, type: string): Promise<void> {
    await this.tokenModel.updateMany(
      { userId, type, isRevoked: false },
      { isRevoked: true }
    ).exec();
  }

  async invalidateByValue(tokenValue: string): Promise<void> {
    await this.tokenModel.findOneAndUpdate(
      { token: tokenValue, isRevoked: false },
      { isRevoked: true }
    ).exec();
  }

  async deleteExpired(): Promise<number> {
    const result = await this.tokenModel.deleteMany({
      expiresAt: { $lt: new Date() }
    }).exec();
    
    return result.deletedCount;
  }
}
```

#### 3.2 マッパー

```typescript
// infrastructure/mappers/UserMapper.ts
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { UserRole, UserRoleEnum } from '../../domain/value-objects/UserRole';
import { ElementalProfile } from '../../domain/value-objects/ElementalProfile';

export class UserMapper {
  toDomain(persistenceModel: any): User {
    // MongoDB DocumentからJSオブジェクトへ変換
    const userDoc = persistenceModel.toObject ? persistenceModel.toObject() : persistenceModel;
    
    // 値オブジェクトの復元
    const email = new Email(userDoc.email);
    const password = new Password(userDoc.password, true);
    const role = UserRole.fromString(userDoc.role);
    
    // 五行プロファイルの復元
    const elementalProfile = ElementalProfile.fromObject(userDoc.elementalType);
    
    // ユーザーエンティティの復元
    return new User(
      email,
      userDoc.name,
      password,
      new Date(userDoc.birthDate),
      role,
      elementalProfile,
      userDoc.isActive,
      userDoc.lastLoginAt ? new Date(userDoc.lastLoginAt) : undefined,
      userDoc._id.toString()
    );
  }

  toPersistence(domainModel: User): any {
    // エンティティからデータベース構造へのマッピング
    return {
      _id: domainModel.id,
      email: domainModel.email.value,
      name: domainModel.name,
      password: domainModel.getPasswordHash(),
      birthDate: domainModel.birthDate,
      role: domainModel.role.value,
      elementalType: {
        mainElement: domainModel.elementalProfile.mainElement,
        secondaryElement: domainModel.elementalProfile.secondaryElement,
        yinYang: domainModel.elementalProfile.yinYang
      },
      isActive: domainModel.isActive,
      lastLoginAt: domainModel.lastLoginAt,
      // その他フィールド
    };
  }
}
```

### 4. インターフェース層の実装

#### 4.1 コントローラー

```typescript
// interfaces/http/controllers/AuthController.ts
import { Request, Response, NextFunction } from 'express';
import { RegisterUserCommand, RegisterUserHandler } from '../../../application/commands/RegisterUserCommand';
import { LoginUserCommand, LoginUserHandler } from '../../../application/commands/LoginUserCommand';
import { AuthService } from '../../../application/services/AuthService';
import { TokenService } from '../../../application/services/TokenService';

export class AuthController {
  constructor(
    private registerUserHandler: RegisterUserHandler,
    private loginUserHandler: LoginUserHandler,
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name, birthDate, role } = req.body;
      
      const command = new RegisterUserCommand(
        email,
        password,
        name,
        birthDate,
        role
      );
      
      const user = await this.registerUserHandler.execute(command);
      
      res.status(201).json({
        success: true,
        message: 'ユーザーが正常に登録されました',
        data: user.toDTO()
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      
      const command = new LoginUserCommand(email, password);
      const result = await this.loginUserHandler.execute(command);
      
      // クッキー設定
      res.cookie('accessToken', result.accessToken.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: result.accessToken.getRemainingTime() * 1000
      });
      
      res.cookie('refreshToken', result.refreshToken.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: result.refreshToken.getRemainingTime() * 1000
      });
      
      res.status(200).json({
        success: true,
        message: 'ログインに成功しました',
        data: {
          user: result.user,
          token: result.accessToken.value // クライアント側の保存用
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'リフレッシュトークンが見つかりません'
        });
        return;
      }
      
      const result = await this.authService.refreshToken(refreshToken);
      
      // 新しいアクセストークンをクッキーに設定
      res.cookie('accessToken', result.accessToken.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: result.accessToken.getRemainingTime() * 1000
      });
      
      res.status(200).json({
        success: true,
        message: 'トークンが正常に更新されました',
        data: {
          token: result.accessToken.value
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const userId = req.user?.id;
      
      if (refreshToken && userId) {
        await this.authService.logout(userId, refreshToken);
      }
      
      // クッキーをクリア
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      
      res.status(200).json({
        success: true,
        message: 'ログアウトに成功しました'
      });
    } catch (error) {
      next(error);
    }
  }

  // その他のコントローラーメソッド（パスワードリセット、メール検証等）
}
```

#### 4.2 ミドルウェア

```typescript
// interfaces/http/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../../../application/services/TokenService';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export class AuthMiddleware {
  constructor(
    private tokenService: TokenService,
    private userRepository: IUserRepository
  ) {}

  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // デバッグモードのチェック
      if (req.headers['x-debug-mode'] === 'true' && process.env.NODE_ENV === 'development') {
        req.user = {
          id: 'debug-user-id',
          email: 'debug@example.com',
          role: 'admin'
        };
        return next();
      }
      
      // トークンの取得
      let token: string | undefined;
      
      // Authorizationヘッダーからの取得
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
      
      // クッキーからの取得
      if (!token && req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
      }
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: '認証トークンがありません'
        });
      }
      
      // トークンの検証
      const decoded = this.tokenService.verifyToken(token);
      if (!decoded || !decoded.sub) {
        return res.status(401).json({
          success: false,
          message: '無効な認証トークンです'
        });
      }
      
      // ユーザーの取得
      const user = await this.userRepository.findById(decoded.sub);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'ユーザーが見つからないか無効です'
        });
      }
      
      // リクエストオブジェクトにユーザー情報を追加
      req.user = {
        id: user.id,
        email: user.email.value,
        role: user.role.value,
        elementalProfile: user.elementalProfile
      };
      
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: '認証に失敗しました'
      });
    }
  };

  requireRole = (requiredRoles: string | string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '認証されていません'
        });
        return;
      }
      
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      
      // ロールヒエラルキー
      const roleHierarchy: Record<string, number> = {
        'employee': 0,
        'manager': 1,
        'admin': 2,
        'superadmin': 3
      };
      
      const userRoleLevel = roleHierarchy[req.user.role];
      const hasRequiredRole = roles.some(r => userRoleLevel >= roleHierarchy[r]);
      
      if (!hasRequiredRole) {
        res.status(403).json({
          success: false,
          message: 'この操作を行う権限がありません'
        });
        return;
      }
      
      next();
    };
  };
}
```

#### 4.3 ルート定義

```typescript
// interfaces/http/routes/auth.routes.ts
import express, { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { ValidationMiddleware } from '../middlewares/validation.middleware';

export const authRouter = (
  authController: AuthController,
  authMiddleware: AuthMiddleware,
  validationMiddleware: ValidationMiddleware
): Router => {
  const router = express.Router();

  /**
   * @route POST /api/v1/auth/register
   * @desc ユーザー登録（管理者のみ可能）
   * @access Private/Admin
   */
  router.post(
    '/register',
    authMiddleware.authenticate,
    authMiddleware.requireRole('admin'),
    validationMiddleware.validateRegister,
    authController.register.bind(authController)
  );

  /**
   * @route POST /api/v1/auth/login
   * @desc ユーザーログイン
   * @access Public
   */
  router.post(
    '/login',
    validationMiddleware.validateLogin,
    authController.login.bind(authController)
  );

  /**
   * @route POST /api/v1/auth/refresh-token
   * @desc アクセストークンのリフレッシュ
   * @access Public
   */
  router.post(
    '/refresh-token',
    authController.refreshToken.bind(authController)
  );

  /**
   * @route POST /api/v1/auth/logout
   * @desc ユーザーログアウト
   * @access Private
   */
  router.post(
    '/logout',
    authMiddleware.authenticate,
    authController.logout.bind(authController)
  );

  // 他のルート定義（パスワードリセット、メール検証等）

  return router;
};
```

### 5. 依存性注入の設定

```typescript
// infrastructure/di/container.ts
import { Container } from 'tsyringe';
import mongoose from 'mongoose';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ITokenRepository } from '../../domain/repositories/ITokenRepository';
import { MongoUserRepository } from '../repositories/MongoUserRepository';
import { MongoTokenRepository } from '../repositories/MongoTokenRepository';
import { TokenService } from '../../application/services/TokenService';
import { AuthService } from '../../application/services/AuthService';
import { EventPublisher } from '../../application/events/EventPublisher';
import { RegisterUserHandler } from '../../application/commands/RegisterUserCommand';
import { LoginUserHandler } from '../../application/commands/LoginUserCommand';
import { AuthController } from '../../interfaces/http/controllers/AuthController';
import { AuthMiddleware } from '../../interfaces/http/middlewares/auth.middleware';
import { ValidationMiddleware } from '../../interfaces/http/middlewares/validation.middleware';

// モデルスキーマ定義
import { userSchema } from '../schemas/userSchema';
import { tokenSchema } from '../schemas/tokenSchema';

export const setupContainer = (): Container => {
  const container = new Container();

  // モデル登録
  const UserModel = mongoose.model('User', userSchema);
  const TokenModel = mongoose.model('Token', tokenSchema);
  
  container.registerInstance('UserModel', UserModel);
  container.registerInstance('TokenModel', TokenModel);
  
  // リポジトリ登録
  container.registerSingleton<IUserRepository>('IUserRepository', MongoUserRepository);
  container.registerSingleton<ITokenRepository>('ITokenRepository', MongoTokenRepository);
  
  // サービス登録
  container.register<TokenService>('TokenService', {
    useFactory: () => new TokenService(
      process.env.JWT_SECRET || 'your-secret-key',
      process.env.ACCESS_TOKEN_EXPIRES_IN || '1h',
      process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
      process.env.RESET_TOKEN_EXPIRES_IN || '1h',
      process.env.VERIFY_TOKEN_EXPIRES_IN || '24h'
    )
  });
  
  container.registerSingleton<EventPublisher>('EventPublisher', EventPublisher);
  container.registerSingleton<AuthService>('AuthService', AuthService);
  
  // コマンドハンドラー登録
  container.registerSingleton<RegisterUserHandler>('RegisterUserHandler', RegisterUserHandler);
  container.registerSingleton<LoginUserHandler>('LoginUserHandler', LoginUserHandler);
  
  // コントローラー・ミドルウェア登録
  container.registerSingleton<AuthController>('AuthController', AuthController);
  container.registerSingleton<AuthMiddleware>('AuthMiddleware', AuthMiddleware);
  container.registerSingleton<ValidationMiddleware>('ValidationMiddleware', ValidationMiddleware);
  
  return container;
};
```

## 段階的移行戦略

### 1. 準備段階
- 共通のデータ型とインターフェースの定義
- 既存コードとの互換性を確保するアダプターの作成
- 単体テストの整備

### 2. ドメイン層の実装
- Userエンティティとリポジトリインターフェース
- 値オブジェクト（Email, Password, Token等）
- ドメインイベント定義

### 3. インフラストラクチャ層の実装
- MongoUserRepositoryの実装
- MongoTokenRepositoryの実装
- マッパーの実装

### 4. アプリケーション層の実装
- ユースケース/コマンドハンドラーの実装
- AuthServiceとTokenServiceの実装
- イベントハンドラーの実装

### 5. インターフェース層の修正
- コントローラーのリファクタリング
- ミドルウェアの適応
- ルーティングの更新

### 6. 移行テスト
- 単体テスト・統合テストの実行
- エンドツーエンドテストの実施
- パフォーマンス検証

### 7. 段階的デプロイ
- 一部の機能から順次移行
- 既存コードと新コードの並行運用
- 完全移行後の旧コード削除

## テスト戦略

1. **ドメインロジックの単体テスト**
   - 各エンティティとバリューオブジェクトのテスト
   - ビジネスルールの検証テスト

2. **アプリケーションサービスのテスト**
   - コマンドハンドラーのテスト
   - モックリポジトリを使用したサービステスト

3. **インフラストラクチャのテスト**
   - リポジトリ実装のテスト
   - データマッピングのテスト

4. **エンドツーエンドテスト**
   - API全体の統合テスト
   - 認証フローの検証テスト

## 課題と解決策

1. **既存のセッション管理との互換性**
   - 移行期間中は両方のトークン形式をサポート
   - アダプターパターンで旧形式と新形式を橋渡し

2. **データ移行の課題**
   - 既存データの変換スクリプトの作成
   - 必要に応じた段階的なデータ移行戦略

3. **パフォーマンス懸念**
   - 初期段階からのパフォーマンスモニタリング
   - ボトルネック特定と最適化の反復実施

## まとめ

クリーンアーキテクチャへの移行により、以下のメリットが得られます：

1. **ビジネスロジックの明確な分離**
   - ドメインロジックが中心に位置し、フレームワークやインフラから独立

2. **テスト容易性の向上**
   - 各層が独立しているため、モックやスタブを使用した単体テストが容易

3. **拡張性と変更容易性**
   - 新機能追加や変更が特定の層に限定され、他の層への影響が最小限

4. **責任の明確な分離**
   - 各層とコンポーネントの責任が明確になり、コードの理解と保守が容易
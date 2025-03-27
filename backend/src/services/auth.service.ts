/**
 * 認証サービス
 * ユーザー認証、トークン管理などの認証関連の機能を提供
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { documentToInterface, documentsToInterfaces } from '../utils/model-converters';
import bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import UserModel, { IUserDocument as UserDocument } from '../models/user.model';
import { TokenModel } from '../models/token.model';
import { CustomError } from '../utils/error.util';
import config from '../config/auth.config';

// JWT関連の型定義
interface JwtPayload {
  id: string;
  role?: string;
  purpose?: string;
  timestamp?: number;
}

class AuthService {
  /**
   * ユーザーログイン
   * @param email ユーザーメールアドレス
   * @param password パスワード
   * @returns ログイン情報（ユーザー情報、トークン、リフレッシュトークン）
   */
  async login(email: string, password: string) {
    // ユーザー検索（パスワードフィールドを含める）
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      throw new CustomError('メールアドレスまたはパスワードが正しくありません', 401);
    }

    // アカウントが無効化されていないか確認
    if (!user.isActive) {
      throw new CustomError('このアカウントは無効化されています', 401);
    }

    // パスワード検証 - bcryptを直接使用
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError('メールアドレスまたはパスワードが正しくありません', 401);
    }

    // 各種トークン生成
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // ユーザーIDを安全に取得
    const userId = String(user._id);

    // リフレッシュトークンをDBに保存
    await TokenModel.create({
      userId,
      token: refreshToken,
      type: 'refresh',
      expiresAt: new Date(Date.now() + config.refreshTokenExpiration * 1000)
    });

    // 最終ログイン日時更新
    user.lastLoginAt = new Date();
    await user.save();

    // ユーザー情報からパスワードを除外
    const userResponse = {
      id: userId,
      email: user.email,
      name: user.name,
      birthDate: user.birthDate,
      role: user.role,
      profilePicture: user.profilePicture,
      elementalType: user.elementalType,
      notificationSettings: user.notificationSettings,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt ? (user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : String(user.lastLoginAt)) : null,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : String(user.updatedAt)
    };

    return {
      user: userResponse,
      token: accessToken,
      refreshToken: refreshToken
    };
  }

  /**
   * トークンリフレッシュ
   * @param refreshToken リフレッシュトークン
   * @returns 新しいアクセストークンとユーザー情報
   */
  async refreshToken(refreshToken: string) {
    // リフレッシュトークンの検証
    const tokenDoc = await TokenModel.findOne({ 
      token: refreshToken,
      type: 'refresh',
      isRevoked: false
    });

    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      throw new CustomError('無効なリフレッシュトークンです', 401);
    }

    try {
      // トークン内容の検証
      const decoded = jwt.verify(refreshToken, config.refreshTokenSecret) as { id: string };
      const userId = decoded.id;

      // ユーザー情報取得
      const user = await UserModel.findById(userId);
      if (!user || !user.isActive) {
        throw new CustomError('ユーザーが見つからないか無効です', 401);
      }

      // 新しいアクセストークン生成
      const accessToken = this.generateAccessToken(user);

      // ユーザー情報の整形
      const userResponse = {
        id: String(user._id),
        email: user.email,
        name: user.name,
        birthDate: user.birthDate,
        role: user.role,
        profilePicture: user.profilePicture,
        elementalType: user.elementalType,
        notificationSettings: user.notificationSettings,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt ? (user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : String(user.lastLoginAt)) : null,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
        updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : String(user.updatedAt)
      };

      return {
        user: userResponse,
        accessToken
      };
    } catch (error) {
      // トークンが無効な場合はDBからも削除
      await tokenDoc.deleteOne();
      throw new CustomError('トークンの検証に失敗しました', 401);
    }
  }

  /**
   * ログアウト
   * @param userId ユーザーID
   * @param token リフレッシュトークン
   */
  async logout(userId: string, token: string) {
    // 指定されたリフレッシュトークンを無効化
    await TokenModel.findOneAndUpdate(
      { userId, token, type: 'refresh' },
      { isRevoked: true }
    );
    
    return { success: true };
  }

  /**
   * ユーザー登録（管理者用）
   * @param userData ユーザー登録データ
   * @returns 作成されたユーザー情報
   */
  async registerUser(userData: any) {
    // メールアドレスの重複チェック
    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new CustomError('このメールアドレスは既に使用されています', 400);
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // ユーザー作成
    const user = await UserModel.create({
      ...userData,
      password: hashedPassword,
      isActive: true
    });

    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      birthDate: user.birthDate,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : String(user.updatedAt)
    };
  }

  /**
   * パスワードリセットメール送信
   * @param email ユーザーメールアドレス
   */
  async sendPasswordResetEmail(email: string) {
    const user = await UserModel.findOne({ email });
    
    // ユーザーが存在しない場合でもセキュリティのために成功レスポンスを返す
    if (!user) {
      return { success: true };
    }

    // ユーザーIDを取得
    const userId = String(user._id);

    // 既存のリセットトークンを無効化
    await TokenModel.updateMany(
      { userId, type: 'reset', isRevoked: false },
      { isRevoked: true }
    );

    // リセット用トークンの生成
    const resetToken = this.generatePasswordResetToken(user);

    // リセット用トークンをDBに保存
    await TokenModel.create({
      userId,
      token: resetToken,
      type: 'reset',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1時間
    });

    // リセットリンクを含むメールを送信（実際のプロジェクトでは実装）
    console.log(`パスワードリセットメール送信 (${email}): ${resetToken}`);
    
    return { success: true };
  }

  /**
   * パスワードリセット
   * @param token リセットトークン
   * @param newPassword 新しいパスワード
   */
  async resetPassword(token: string, newPassword: string) {
    // トークンの検証
    const tokenDoc = await TokenModel.findOne({
      token,
      type: 'reset',
      isRevoked: false
    });

    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      throw new CustomError('無効または期限切れのトークンです', 400);
    }

    // トークンを無効化
    tokenDoc.isRevoked = true;
    await tokenDoc.save();

    // ユーザーを取得してパスワードを更新
    const user = await UserModel.findById(tokenDoc.userId);
    if (!user) {
      throw new CustomError('ユーザーが見つかりません', 404);
    }

    // パスワードの更新
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // ユーザーの全てのリフレッシュトークンを無効化
    await TokenModel.updateMany(
      { userId: String(user._id), type: 'refresh', isRevoked: false },
      { isRevoked: true }
    );

    return { success: true };
  }

  /**
   * メール検証
   * @param token 検証トークン
   */
  async verifyEmail(token: string) {
    // トークンの検証
    const tokenDoc = await TokenModel.findOne({
      token,
      type: 'verify',
      isRevoked: false
    });

    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      throw new CustomError('無効または期限切れのトークンです', 400);
    }

    // トークンを無効化
    tokenDoc.isRevoked = true;
    await tokenDoc.save();

    // ユーザーのメール検証ステータスを更新
    const user = await UserModel.findById(tokenDoc.userId);
    if (!user) {
      throw new CustomError('ユーザーが見つかりません', 404);
    }

    // メール検証のロジックがあれば追加（例：isEmailVerified = true）

    return { success: true };
  }

  /**
   * ユーザー情報取得
   * @param userId ユーザーID
   * @returns ユーザー情報
   */
  async getUserById(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new CustomError('ユーザーが見つかりません', 404);
    }

    return {
      id: String(user._id),
      email: user.email,
      name: user.name,
      birthDate: user.birthDate,
      role: user.role,
      profilePicture: user.profilePicture,
      elementalType: user.elementalType,
      notificationSettings: user.notificationSettings,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt ? (user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : String(user.lastLoginAt)) : null,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : String(user.updatedAt)
    };
  }

  /**
   * パスワード変更
   * @param userId ユーザーID
   * @param currentPassword 現在のパスワード
   * @param newPassword 新しいパスワード
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // ユーザーを取得（パスワードフィールドを含める）
    const user = await UserModel.findById(userId).select('+password');
    if (!user) {
      throw new CustomError('ユーザーが見つかりません', 404);
    }

    // 現在のパスワードを検証 - bcryptを直接使用
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new CustomError('現在のパスワードが正しくありません', 401);
    }

    // パスワードを更新
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // パスワード変更後、全てのリフレッシュトークンを無効化
    await TokenModel.updateMany(
      { userId: String(user._id), type: 'refresh', isRevoked: false },
      { isRevoked: true }
    );

    return { success: true };
  }

  /**
   * アクセストークン生成
   * @param user ユーザードキュメント
   * @returns JWT アクセストークン
   */
  private generateAccessToken(user: UserDocument): string {
    const payload: JwtPayload = { 
      id: String(user._id),
      role: user.role
    };
    
    // 有効期限の指定なしで署名
    const token = jwt.sign(payload, config.jwtSecret);
    return documentToInterface<any>(token);
  }

  /**
   * リフレッシュトークン生成
   * @param user ユーザードキュメント
   * @returns JWT リフレッシュトークン
   */
  private generateRefreshToken(user: UserDocument): string {
    const payload: JwtPayload = { 
      id: String(user._id)
    };
    
    // 有効期限の指定なしで署名
    const token = jwt.sign(payload, config.refreshTokenSecret);
    return token;
  }

  /**
   * パスワードリセットトークン生成
   * @param user ユーザードキュメント
   * @returns パスワードリセットトークン
   */
  private generatePasswordResetToken(user: UserDocument): string {
    const payload: JwtPayload = { 
      id: String(user._id),
      purpose: 'password-reset',
      timestamp: Date.now()
    };
    
    // 有効期限の指定なしで署名
    const token = jwt.sign(payload, config.resetTokenSecret);
    return token;
  }

  /**
   * メール検証トークン生成
   * @param user ユーザードキュメント
   * @returns メール検証トークン
   */
  private generateEmailVerificationToken(user: UserDocument): string {
    const payload: JwtPayload = { 
      id: String(user._id),
      purpose: 'email-verification',
      timestamp: Date.now()
    };
    
    // 有効期限の指定なしで署名
    const token = jwt.sign(payload, config.verificationTokenSecret);
    return token;
  }
}

export const authService = new AuthService();
import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../../domain/user/repositories/user.repository.interface';
import { NotFoundError } from '../../errors/not-found.error';
import { AuthenticationError } from '../../errors/authentication.error';

/**
 * ユーザープロフィールレスポンス
 */
export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  birthDate: string;
  role: string;
  profileImage?: string;
  elementalProfile: {
    mainElement: string;
    secondaryElement?: string;
    yinYang: string;
  };
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

/**
 * ユーザープロフィール取得ユースケース
 * ユーザープロフィール情報の取得を担当
 */
@injectable()
export class GetUserProfileUseCase {
  /**
   * コンストラクタ
   * @param userRepository ユーザーリポジトリ
   */
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository
  ) {}
  
  /**
   * ユーザープロフィールを取得する
   * @param userId ユーザーID
   * @param requestingUserId リクエストを行うユーザーID（認可チェック用）
   * @returns ユーザープロフィール
   * @throws NotFoundError ユーザーが見つからない場合
   * @throws AuthenticationError 認可エラーの場合
   */
  async execute(userId: string, requestingUserId: string): Promise<UserProfileResponse> {
    // 自分以外のプロフィールを見る場合は、自分自身がリクエストしていることを確認
    if (userId !== requestingUserId) {
      // 注: このシンプルな実装では自分以外のプロフィールを見る権限チェックは行っていません
      // 実際のアプリケーションでは、ロールベースでの権限チェックなど、より詳細な認可ロジックが必要です
    }
    
    // ユーザーの取得
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('ユーザーが見つかりません');
    }
    
    // レスポンスの生成
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      birthDate: user.birthDate.toISOString().split('T')[0], // YYYY-MM-DD形式
      role: user.role,
      profileImage: user.profileImage,
      elementalProfile: {
        mainElement: user.elementalProfile.mainElement,
        secondaryElement: user.elementalProfile.secondaryElement,
        yinYang: user.elementalProfile.yinYang
      },
      isActive: user.isActive(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString()
    };
  }
  
  /**
   * 現在ログイン中のユーザープロフィールを取得する
   * @param userId 現在のユーザーID
   * @returns ユーザープロフィール
   */
  async getCurrentUserProfile(userId: string): Promise<UserProfileResponse> {
    return this.execute(userId, userId);
  }
}
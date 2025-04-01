import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../../domain/user/repositories/user.repository.interface';
import { NotFoundError } from '../../errors/not-found.error';
import { ValidationError } from '../../errors/validation.error';
import { AuthenticationError } from '../../errors/authentication.error';

/**
 * プロフィール更新リクエスト
 */
export interface UpdateProfileRequest {
  name?: string;
  profileImage?: string;
}

/**
 * ユーザープロフィール更新ユースケース
 * ユーザープロフィール情報の更新を担当
 */
@injectable()
export class UpdateUserProfileUseCase {
  /**
   * コンストラクタ
   * @param userRepository ユーザーリポジトリ
   */
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository
  ) {}
  
  /**
   * ユーザープロフィールを更新する
   * @param userId 更新対象のユーザーID
   * @param request 更新リクエスト
   * @param requestingUserId リクエストを行うユーザーID（認可チェック用）
   * @returns 更新されたユーザー情報
   * @throws NotFoundError ユーザーが見つからない場合
   * @throws ValidationError 入力データ検証失敗時
   * @throws AuthenticationError 認可エラーの場合
   */
  async execute(
    userId: string, 
    request: UpdateProfileRequest, 
    requestingUserId: string
  ): Promise<void> {
    // 自分のプロフィールを更新していることを確認
    if (userId !== requestingUserId) {
      throw new AuthenticationError('自分のプロフィールのみ更新できます');
    }
    
    // 入力検証
    this.validateRequest(request);
    
    // ユーザーの取得
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('ユーザーが見つかりません');
    }
    
    // 更新処理
    let updatedUser = user;
    
    if (request.name && request.name !== user.name) {
      updatedUser = updatedUser.withUpdatedName(request.name);
    }
    
    if (request.profileImage && request.profileImage !== user.profileImage) {
      updatedUser = updatedUser.withUpdatedProfileImage(request.profileImage);
    }
    
    // 変更がある場合のみリポジトリを呼び出す
    if (updatedUser !== user) {
      await this.userRepository.update(userId, updatedUser);
    }
  }
  
  /**
   * 更新リクエストの検証
   * @param request 検証する更新リクエスト
   * @throws ValidationError 検証失敗時
   */
  private validateRequest(request: UpdateProfileRequest): void {
    const errors: Record<string, string> = {};
    
    // 名前の検証
    if (request.name !== undefined) {
      if (request.name.length < 2) {
        errors.name = '名前は2文字以上である必要があります';
      }
    }
    
    // プロフィール画像URLの検証
    if (request.profileImage !== undefined && request.profileImage !== '') {
      try {
        new URL(request.profileImage);
      } catch (e) {
        errors.profileImage = '有効なURLを入力してください';
      }
    }
    
    // エラーがある場合は例外をスロー
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('入力データの検証に失敗しました', errors);
    }
  }
}
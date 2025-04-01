import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../../domain/user/repositories/user.repository.interface';
import { Password } from '../../../domain/user/value-objects/password';
import { NotFoundError } from '../../errors/not-found.error';
import { ValidationError } from '../../errors/validation.error';
import { AuthenticationError } from '../../errors/authentication.error';

/**
 * パスワード更新リクエスト
 */
export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * ユーザーパスワード更新ユースケース
 * ユーザーパスワードの更新を担当
 */
@injectable()
export class UpdateUserPasswordUseCase {
  /**
   * コンストラクタ
   * @param userRepository ユーザーリポジトリ
   */
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository
  ) {}
  
  /**
   * ユーザーパスワードを更新する
   * @param userId 更新対象のユーザーID
   * @param request パスワード更新リクエスト
   * @param requestingUserId リクエストを行うユーザーID（認可チェック用）
   * @throws NotFoundError ユーザーが見つからない場合
   * @throws ValidationError 入力データ検証失敗時
   * @throws AuthenticationError 認可エラーまたはパスワード検証失敗の場合
   */
  async execute(
    userId: string,
    request: UpdatePasswordRequest,
    requestingUserId: string
  ): Promise<void> {
    // 自分のパスワードを更新していることを確認
    if (userId !== requestingUserId) {
      throw new AuthenticationError('自分のパスワードのみ更新できます');
    }
    
    // 入力検証
    await this.validateRequest(request);
    
    // ユーザーの取得
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('ユーザーが見つかりません');
    }
    
    // 現在のパスワード検証
    const isPasswordValid = await user.verifyPassword(request.currentPassword);
    if (!isPasswordValid) {
      throw new AuthenticationError('現在のパスワードが正しくありません');
    }
    
    // 新しいパスワードのハッシュ化
    const newPasswordHash = await Password.create(request.newPassword);
    
    // パスワードの更新
    await this.userRepository.updatePassword(userId, newPasswordHash.hash);
  }
  
  /**
   * パスワード更新リクエストの検証
   * @param request 検証するリクエスト
   * @throws ValidationError 検証失敗時
   */
  private async validateRequest(request: UpdatePasswordRequest): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = request;
    const errors: Record<string, string> = {};
    
    // 現在のパスワードの検証
    if (!currentPassword) {
      errors.currentPassword = '現在のパスワードは必須です';
    }
    
    // 新しいパスワードの検証
    if (!newPassword) {
      errors.newPassword = '新しいパスワードは必須です';
    } else if (newPassword.length < Password.MIN_LENGTH) {
      errors.newPassword = `パスワードは${Password.MIN_LENGTH}文字以上である必要があります`;
    }
    
    // パスワード確認の検証
    if (!confirmPassword) {
      errors.confirmPassword = 'パスワード確認は必須です';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'パスワードとパスワード確認が一致しません';
    }
    
    // 新しいパスワードが現在のパスワードと同じでないことを確認
    if (currentPassword === newPassword) {
      errors.newPassword = '新しいパスワードは現在のパスワードと異なる必要があります';
    }
    
    // 新しいパスワードの強度検証
    try {
      if (newPassword) {
        await Password.create(newPassword);
      }
    } catch (error) {
      errors.newPassword = (error as Error).message;
    }
    
    // エラーがある場合は例外をスロー
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('入力データの検証に失敗しました', errors);
    }
  }
}
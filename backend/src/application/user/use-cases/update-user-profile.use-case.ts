import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../../domain/user/repositories/user.repository.interface';
import { NotFoundError } from '../../errors/not-found.error';
import { ValidationError } from '../../errors/validation.error';
import { AuthenticationError } from '../../errors/authentication.error';
import { ElementalProfile } from '../../../domain/user/value-objects/elemental-profile';
import { SajuCalculatorService } from '../../services/saju-calculator.service';

/**
 * プロフィール更新リクエスト
 */
export interface UpdateProfileRequest {
  name?: string;
  profileImage?: string;
  birthDate?: string;
  birthHour?: number | null;
  birthLocation?: string;
  elementalType?: {
    mainElement: '木' | '火' | '土' | '金' | '水';
    secondaryElement?: '木' | '火' | '土' | '金' | '水';
    yinYang: '陰' | '陽';
  };
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
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('SajuCalculatorService') private sajuCalculatorService: SajuCalculatorService
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
    
    // 生年月日の更新
    if (request.birthDate) {
      const newBirthDate = new Date(request.birthDate);
      // 日付文字列を直接比較するとタイムゾーン問題があるので、getTime()を使用
      if (newBirthDate.getTime() !== user.birthDate.getTime()) {
        updatedUser = updatedUser.withUpdatedBirthDate(newBirthDate);
      }
    }
    
    // 出生時間の更新
    if (request.birthHour !== undefined) {
      // nullの場合も含めてチェック
      if (request.birthHour !== user.birthHour) {
        if (request.birthHour === null) {
          // 出生時間が未設定の場合
          updatedUser = updatedUser.withUpdatedBirthHour(null);
        } else {
          // 出生時間が設定されている場合
          updatedUser = updatedUser.withUpdatedBirthHour(request.birthHour);
        }
      }
    }
    
    // 出生地の更新
    if (request.birthLocation !== undefined && request.birthLocation !== user.birthLocation) {
      updatedUser = updatedUser.withUpdatedBirthLocation(request.birthLocation);
    }
    
    // 五行属性の更新
    if (request.elementalType) {
      const currentElemental = user.elementalProfile.toPlain();
      const newElemental = request.elementalType;
      
      // 変更があるかチェック
      if (
        currentElemental.mainElement !== newElemental.mainElement ||
        currentElemental.yinYang !== newElemental.yinYang ||
        currentElemental.secondaryElement !== newElemental.secondaryElement
      ) {
        // 新しいElementalProfile値オブジェクトを作成
        const newProfile = new ElementalProfile(
          newElemental.mainElement,
          newElemental.yinYang,
          newElemental.secondaryElement
        );
        
        updatedUser = updatedUser.withUpdatedElementalProfile(newProfile);
      }
    }
    
    // 変更があるか、特に生年月日、出生時間、出生地の変更がある場合
    const birthInfoChanged = 
      request.birthDate !== undefined || 
      request.birthHour !== undefined ||
      request.birthLocation !== undefined;
    
    // 変更がある場合のみリポジトリを呼び出す
    if (updatedUser !== user) {
      // まずユーザー情報を更新
      await this.userRepository.update(userId, updatedUser);
      
      // 生年月日関連の情報が更新された場合は、四柱推命プロファイルも計算し直す
      if (birthInfoChanged && updatedUser.birthDate) {
        try {
          // 四柱推命プロファイルを計算
          const sajuProfile = await this.sajuCalculatorService.calculateSajuProfile(
            new Date(updatedUser.birthDate),
            updatedUser.birthHour,
            updatedUser.birthLocation
          );
          
          // 四柱推命プロファイルを更新
          if (sajuProfile) {
            const userWithSaju = updatedUser.withUpdatedSajuProfile(sajuProfile);
            await this.userRepository.update(userId, userWithSaju);
          }
        } catch (error) {
          console.error('四柱推命プロファイル更新エラー:', error);
          // 四柱推命プロファイルの更新に失敗してもユーザー情報の更新は継続する
        }
      }
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
    
    // 生年月日の検証
    if (request.birthDate !== undefined) {
      // YYYY-MM-DD形式のバリデーション
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(request.birthDate)) {
        errors.birthDate = '生年月日はYYYY-MM-DD形式で入力してください';
      } else {
        const date = new Date(request.birthDate);
        // 有効な日付かつ1900年以降のみ許可
        if (isNaN(date.getTime()) || date.getFullYear() < 1900 || date > new Date()) {
          errors.birthDate = '有効な生年月日を入力してください';
        }
      }
    }
    
    // 出生時間の検証
    if (request.birthHour !== undefined && request.birthHour !== null) {
      if (request.birthHour < 0 || request.birthHour > 23 || !Number.isInteger(request.birthHour)) {
        errors.birthHour = '出生時間は0から23の整数で入力してください';
      }
    }
    
    // 出生地の検証
    if (request.birthLocation !== undefined && request.birthLocation.length > 100) {
      errors.birthLocation = '出生地は100文字以内で入力してください';
    }
    
    // 五行属性の検証
    if (request.elementalType !== undefined) {
      const validElements = ['木', '火', '土', '金', '水'];
      const validYinYang = ['陰', '陽'];
      
      if (!validElements.includes(request.elementalType.mainElement)) {
        errors.mainElement = '有効な五行要素を選択してください';
      }
      
      if (request.elementalType.secondaryElement && 
          !validElements.includes(request.elementalType.secondaryElement)) {
        errors.secondaryElement = '有効な五行要素を選択してください';
      }
      
      if (!validYinYang.includes(request.elementalType.yinYang)) {
        errors.yinYang = '陰または陽を選択してください';
      }
      
      // 主要素と副要素が同じ場合は警告するが、エラーにはしない
      // 注：同じ要素の強化という考え方もあるため、このルールは削除
      // 副要素はオプションなので、元の実装では同じ場合はnullにすることが一般的
    }
    
    // エラーがある場合は例外をスロー
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('入力データの検証に失敗しました', errors);
    }
  }
}
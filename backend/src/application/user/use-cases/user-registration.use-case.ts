import { inject, injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from '../../../domain/user/repositories/user.repository.interface';
import { User } from '../../../domain/user/entities/user.entity';
import { Password } from '../../../domain/user/value-objects/password';
import { UserRole } from '../../../domain/user/value-objects/user-role';
import { UserStatus } from '../../../domain/user/value-objects/user-status';
import { ValidationError } from '../../errors/validation.error';
import { ApplicationError } from '../../errors/application.error';
import { ElementalProfile } from '../../../domain/user/value-objects/elemental-profile';
import { ElementalCalculatorService } from '../../services/elemental-calculator.service';
import { SajuCalculatorService } from '../../services/saju-calculator.service';

/**
 * ユーザー登録リクエスト
 */
export interface RegistrationRequest {
  email: string;
  password: string;
  name: string;
  birthDate: string;
  birthHour?: number;
  birthLocation?: string;
  role?: UserRole;
}

/**
 * ユーザー登録レスポンス
 */
export interface RegistrationResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  elementalProfile: {
    mainElement: string;
    secondaryElement?: string;
    yinYang: string;
  };
}

/**
 * ユーザー登録ユースケース
 * 新規ユーザーの登録処理を担当
 */
@injectable()
export class UserRegistrationUseCase {
  /**
   * コンストラクタ
   * @param userRepository ユーザーリポジトリ
   * @param elementalCalculator 陰陽五行計算サービス
   * @param sajuCalculatorService 四柱推命計算サービス
   */
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject(ElementalCalculatorService) private elementalCalculator: ElementalCalculatorService,
    @inject('SajuCalculatorService') private sajuCalculatorService: SajuCalculatorService
  ) {}
  
  /**
   * ユーザー登録処理
   * @param request 登録リクエスト
   * @returns 登録されたユーザー情報
   * @throws ValidationError 入力データ検証失敗時
   * @throws ApplicationError 登録処理失敗時
   */
  async register(request: RegistrationRequest): Promise<RegistrationResponse> {
    const { email, password, name, birthDate, birthHour, birthLocation, role = UserRole.EMPLOYEE } = request;
    
    // 入力検証
    await this.validateRegistrationRequest(request);
    
    // メールアドレスの重複チェック
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('このメールアドレスは既に使用されています');
    }
    
    // パスワードハッシュの生成
    const passwordHash = await Password.create(password);
    
    // 生年月日からの陰陽五行プロファイル計算
    const birthDateObj = new Date(birthDate);
    const elementalProfile = this.elementalCalculator.calculateElementalProfileFromBirthDate(birthDateObj);
    
    // 新規ユーザーの作成
    const newUser = new User(
      uuidv4(), // 新規ID生成
      email.toLowerCase(),
      name,
      passwordHash,
      birthDateObj,
      role,
      UserStatus.ACTIVE, // デフォルトでアクティブに設定
      elementalProfile,
      undefined, // sajuProfile（後で計算して更新）
      birthHour,
      birthLocation
    );
    
    // ユーザーの保存
    try {
      const savedUser = await this.userRepository.create(newUser);
      
      // 四柱推命プロファイルの計算（生年月日と出生時間があれば）
      if (birthHour !== undefined || birthLocation) {
        try {
          console.log(`四柱推命プロファイル計算開始: ${savedUser.id}`);
          const sajuProfile = await this.sajuCalculatorService.calculateSajuProfile(
            birthDateObj,
            birthHour,
            birthLocation
          );
          
          if (sajuProfile) {
            console.log(`四柱推命プロファイル計算成功: ${savedUser.id}`);
            // 四柱推命プロファイルを更新
            const userWithSaju = savedUser.withUpdatedSajuProfile(sajuProfile);
            await this.userRepository.update(savedUser.id, userWithSaju);
          }
        } catch (error) {
          console.error('四柱推命プロファイル計算エラー:', error);
          // 四柱推命プロファイルの計算に失敗してもユーザー登録は継続
        }
      }
      
      // レスポンス生成
      return {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
        elementalProfile: {
          mainElement: savedUser.elementalProfile.mainElement,
          secondaryElement: savedUser.elementalProfile.secondaryElement,
          yinYang: savedUser.elementalProfile.yinYang
        }
      };
    } catch (error) {
      throw new ApplicationError(
        'ユーザー登録中にエラーが発生しました',
        'REGISTRATION_ERROR',
        500,
        { error }
      );
    }
  }
  
  /**
   * 登録リクエストの検証
   * @param request 検証する登録リクエスト
   * @throws ValidationError 検証失敗時
   */
  private async validateRegistrationRequest(request: RegistrationRequest): Promise<void> {
    const { email, password, name, birthDate, birthHour, birthLocation } = request;
    const errors: Record<string, string> = {};
    
    // メールアドレスの検証
    if (!email) {
      errors.email = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    // パスワードの検証
    if (!password) {
      errors.password = 'パスワードは必須です';
    } else if (password.length < Password.MIN_LENGTH) {
      errors.password = `パスワードは${Password.MIN_LENGTH}文字以上である必要があります`;
    }
    
    // 名前の検証
    if (!name) {
      errors.name = '名前は必須です';
    } else if (name.length < 2) {
      errors.name = '名前は2文字以上である必要があります';
    }
    
    // 生年月日の検証
    if (!birthDate) {
      errors.birthDate = '生年月日は必須です';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      errors.birthDate = '生年月日はYYYY-MM-DD形式で入力してください';
    } else {
      const date = new Date(birthDate);
      if (isNaN(date.getTime())) {
        errors.birthDate = '無効な日付です';
      } else if (date > new Date()) {
        errors.birthDate = '生年月日は未来の日付にできません';
      }
    }
    
    // 出生時間の検証（任意）
    if (birthHour !== undefined) {
      if (birthHour < 0 || birthHour > 23 || !Number.isInteger(birthHour)) {
        errors.birthHour = '出生時間は0から23の整数で入力してください';
      }
    }
    
    // 出生地の検証（任意）
    if (birthLocation !== undefined && birthLocation.length > 100) {
      errors.birthLocation = '出生地は100文字以内で入力してください';
    }
    
    // エラーがある場合は例外をスロー
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('入力データの検証に失敗しました', errors);
    }
  }
}
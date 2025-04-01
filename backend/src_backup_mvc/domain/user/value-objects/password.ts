import bcrypt from 'bcrypt';

/**
 * パスワード値オブジェクト
 * ユーザーのパスワードを安全に管理するための値オブジェクト
 */
export class Password {
  /**
   * パスワードハッシュ化の際のソルトラウンド
   * セキュリティと処理速度のバランスを考慮した値
   */
  private static readonly SALT_ROUNDS = 10;
  
  /**
   * パスワードの最小長
   */
  public static readonly MIN_LENGTH = 8;
  
  /**
   * コンストラクタ
   * @param hash ハッシュ化されたパスワード
   */
  private constructor(public readonly hash: string) {}
  
  /**
   * 平文パスワードからPasswordオブジェクトを生成する
   * @param plainPassword 平文パスワード
   * @returns Passwordオブジェクト
   * @throws Error パスワードが条件を満たさない場合
   */
  static async create(plainPassword: string): Promise<Password> {
    this.validate(plainPassword);
    const hash = await bcrypt.hash(plainPassword, this.SALT_ROUNDS);
    return new Password(hash);
  }
  
  /**
   * 既存のハッシュからPasswordオブジェクトを生成する
   * @param hash ハッシュ化されたパスワード
   * @returns Passwordオブジェクト
   */
  static fromHash(hash: string): Password {
    if (!hash) {
      throw new Error('パスワードハッシュが無効です');
    }
    return new Password(hash);
  }
  
  /**
   * パスワードが一致するか検証する
   * @param plainPassword 検証する平文パスワード
   * @returns 一致する場合はtrue
   */
  async verify(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.hash);
  }
  
  /**
   * パスワードが条件を満たすか検証する
   * @param plainPassword 検証する平文パスワード
   * @throws Error パスワードが条件を満たさない場合
   */
  private static validate(plainPassword: string): void {
    if (!plainPassword || plainPassword.length < this.MIN_LENGTH) {
      throw new Error(`パスワードは${this.MIN_LENGTH}文字以上である必要があります`);
    }
    
    // 基本的なパスワード強度チェック（拡張可能）
    if (!/\d/.test(plainPassword)) {
      throw new Error('パスワードは少なくとも1つの数字を含む必要があります');
    }
    
    if (!/[a-zA-Z]/.test(plainPassword)) {
      throw new Error('パスワードは少なくとも1つのアルファベットを含む必要があります');
    }
  }
}
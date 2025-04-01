/**
 * 基本エンティティクラス
 * すべてのドメインエンティティの基底クラス
 */
export abstract class Entity<T> {
  /**
   * コンストラクタ
   * @param id エンティティのID
   * @param createdAt 作成日時（オプション、なければ現在時刻）
   * @param updatedAt 更新日時（オプション、なければ現在時刻）
   */
  constructor(
    public readonly id: T,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}
  
  /**
   * 2つのエンティティが同一かどうかを比較する
   * @param other 比較対象のエンティティ
   * @returns 同一ならtrue、そうでなければfalse
   */
  equals(other?: Entity<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (!(other instanceof Entity)) {
      return false;
    }
    return this.id === other.id;
  }
  
  /**
   * 更新日時を新しくした新しいエンティティを返す
   * エンティティは不変なので、新しいインスタンスを作成する
   * @returns 更新日時を更新した新しいエンティティ
   */
  withUpdatedTimestamp(): this {
    const constructor = this.constructor as new (...args: any[]) => this;
    const clone = Object.create(constructor.prototype);
    
    // プロパティをコピー
    for (const prop in this) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        clone[prop] = this[prop];
      }
    }
    
    // 更新日時だけ新しくする
    clone.updatedAt = new Date();
    
    return clone;
  }
}
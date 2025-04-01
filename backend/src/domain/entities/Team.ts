/**
 * チームエンティティ
 * 
 * チームの構成、メンバー、目標などを管理する
 * 
 * 変更履歴:
 * - 2025/04/02: 初期実装 (Claude)
 */
import { randomUUID } from 'crypto';

/**
 * チームメンバー型
 */
interface TeamMember {
  userId: string;
  role: string;
  joinedAt: Date;
}

/**
 * チームエンティティ基底クラス
 */
export class Entity {
  id: string;
  createdAt: Date;
  updatedAt?: Date;

  constructor(id: string, createdAt?: Date) {
    this.id = id;
    this.createdAt = createdAt || new Date();
  }
}

/**
 * チームエンティティ
 */
export class Team extends Entity {
  /**
   * チームコンストラクタ
   * @param id チームID
   * @param name チーム名
   * @param description チームの説明
   * @param ownerId チームオーナーのユーザーID
   * @param isActive チームのアクティブ状態
   * @param admins 管理者権限を持つユーザーIDの配列
   * @param members チームメンバーの配列
   * @param goal チームの目標
   * @param createdAt 作成日時
   */
  constructor(
    id: string,
    public name: string,
    public description: string,
    public ownerId: string,
    public isActive: boolean = true,
    public admins: string[] = [],
    public members: TeamMember[] = [],
    public goal: string = '',
    createdAt?: Date
  ) {
    super(id, createdAt);
  }

  /**
   * 新しいチームの作成
   * @param name チーム名
   * @param description チームの説明
   * @param ownerId チームオーナーのユーザーID
   * @param goal チームの目標
   * @returns 新しいチームインスタンス
   */
  static create(
    name: string,
    description: string,
    ownerId: string,
    goal: string = ''
  ): Team {
    let id = '';
    try {
      id = randomUUID();
    } catch (e) {
      // randomUUID が利用できない場合はランダムな文字列を生成
      id = 'team-' + Math.random().toString(36).substring(2, 11);
    }
    const now = new Date();
    
    return new Team(
      id,
      name,
      description,
      ownerId,
      true, // デフォルトではアクティブ
      [], // 初期管理者なし
      [], // 初期メンバーなし
      goal,
      now
    );
  }

  /**
   * 管理者を追加
   * @param userId 管理者として追加するユーザーID
   */
  addAdmin(userId: string): void {
    if (!this.admins.includes(userId)) {
      this.admins.push(userId);
      this.updatedAt = new Date();
    }
  }

  /**
   * 管理者を削除
   * @param userId 削除する管理者のユーザーID
   */
  removeAdmin(userId: string): void {
    // オーナーは削除できない
    if (userId === this.ownerId) {
      throw new Error('Cannot remove the owner from admin role');
    }

    const index = this.admins.indexOf(userId);
    if (index !== -1) {
      this.admins.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  /**
   * メンバーを追加
   * @param userId 追加するメンバーのユーザーID
   * @param role メンバーの役割
   */
  addMember(userId: string, role: string): void {
    // 既存メンバーのチェック
    if (this.members.some(member => member.userId === userId)) {
      throw new Error('User is already a team member');
    }

    this.members.push({
      userId,
      role,
      joinedAt: new Date()
    });
    this.updatedAt = new Date();
  }

  /**
   * メンバーを削除
   * @param userId 削除するメンバーのユーザーID
   */
  removeMember(userId: string): void {
    // オーナーは削除できない
    if (userId === this.ownerId) {
      throw new Error('Cannot remove the owner from the team');
    }

    const initialLength = this.members.length;
    this.members = this.members.filter(member => member.userId !== userId);

    // 管理者リストからも削除
    this.removeAdmin(userId);

    if (this.members.length !== initialLength) {
      this.updatedAt = new Date();
    }
  }

  /**
   * メンバーの役割を更新
   * @param userId メンバーのユーザーID
   * @param newRole 新しい役割
   */
  updateMemberRole(userId: string, newRole: string): void {
    const member = this.members.find(m => m.userId === userId);
    if (member) {
      member.role = newRole;
      this.updatedAt = new Date();
    } else {
      throw new Error('Member not found');
    }
  }

  /**
   * チーム目標を更新
   * @param goal 新しいチーム目標
   */
  updateGoal(goal: string): void {
    this.goal = goal;
    this.updatedAt = new Date();
  }

  /**
   * チームのアクティブ状態を切り替える
   * @param isActive 新しいアクティブ状態
   */
  setActive(isActive: boolean): void {
    this.isActive = isActive;
    this.updatedAt = new Date();
  }

  /**
   * 指定されたユーザーがチームオーナーかを確認
   * @param userId ユーザーID
   * @returns ユーザーがチームオーナーの場合はtrue
   */
  isOwner(userId: string): boolean {
    return this.ownerId === userId;
  }

  /**
   * 指定されたユーザーが管理者かを確認
   * @param userId ユーザーID
   * @returns ユーザーが管理者の場合はtrue
   */
  isAdmin(userId: string): boolean {
    return this.isOwner(userId) || this.admins.includes(userId);
  }

  /**
   * 指定されたユーザーがメンバーかを確認
   * @param userId ユーザーID
   * @returns ユーザーがメンバーの場合はtrue
   */
  isMember(userId: string): boolean {
    return this.isOwner(userId) || 
      this.admins.includes(userId) || 
      this.members.some(member => member.userId === userId);
  }

  /**
   * メンバーの役割を取得
   * @param userId メンバーのユーザーID
   * @returns メンバーの役割（存在しない場合はundefined）
   */
  getMemberRole(userId: string): string | undefined {
    if (this.isOwner(userId)) {
      return 'owner';
    }
    if (this.isAdmin(userId)) {
      return 'admin';
    }
    const member = this.members.find(m => m.userId === userId);
    return member?.role;
  }

  /**
   * チームの最大メンバー数を取得
   * （実際にはサブスクリプションプランに依存）
   * @returns デフォルトの最大メンバー数
   */
  getMaxMembers(): number {
    return 10; // デフォルト値、実際にはサブスクリプションサービスから取得
  }

  /**
   * チームがメンバー追加可能かチェック
   * @returns メンバー追加可能な場合はtrue
   */
  canAddMoreMembers(): boolean {
    return this.members.length < this.getMaxMembers();
  }
}
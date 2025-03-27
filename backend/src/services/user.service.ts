import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser, UserUpdateRequest, NotificationSettingsType } from '@shared';
import User from '../models/user.model';
import { userDocumentToInterface, documentsToInterfaces, documentToInterface } from '../utils/model-converters';

/**
 * ユーザーサービス
 * ユーザー関連の業務ロジックを実装
 */
class UserService {
  /**
   * IDによるユーザー取得
   */
  async getUserById(userId: string): Promise<IUser | null> {
    try {
      const user = await User.findById(userId);
      return userDocumentToInterface(user);
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
      return documentToInterface<IUser>(null);
    }
  }

  /**
   * 全ユーザー取得
   */
  async getAllUsers(): Promise<IUser[]> {
    try {
      const users = await User.find({});
      return documentsToInterfaces<IUser>(users);
    } catch (error) {
      console.error('全ユーザー取得エラー:', error);
      return [];
    }
  }

  /**
   * ユーザー情報更新
   */
  async updateUser(userId: string, updateData: UserUpdateRequest): Promise<IUser | null> {
    try {
      // 更新対象のユーザーが存在するか確認
      const existingUser = await User.findById(userId);
      
      if (!existingUser) {
        return documentToInterface<IUser>(null);
      }
      
      // 陰陽五行属性の更新がある場合、生年月日から適切な属性を計算
      if (updateData.birthDate && !updateData.elementalType) {
        updateData.elementalType = this.calculateElementalType(updateData.birthDate);
      }
      
      // ユーザー情報を更新して返す
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      );
      
      return userDocumentToInterface(updatedUser);
    } catch (error) {
      console.error('ユーザー更新エラー:', error);
      return null;
    }
  }

  /**
   * パスワード更新
   */
  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      // ユーザーを取得
      const user = await User.findById(userId);
      
      if (!user) {
        return false;
      }
      
      // 現在のパスワードが正しいか確認
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return false;
      }
      
      // 新しいパスワードをハッシュ化
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // パスワードを更新
      await User.findByIdAndUpdate(userId, { password: hashedPassword });
      
      return true;
    } catch (error) {
      console.error('パスワード更新エラー:', error);
      return false;
    }
  }

  /**
   * 通知設定更新
   */
  async updateNotificationSettings(userId: string, notificationSettings: NotificationSettingsType): Promise<IUser | null> {
    try {
      // 更新対象のユーザーが存在するか確認
      const existingUser = await User.findById(userId);
      
      if (!existingUser) {
        return null;
      }
      
      // 通知設定を更新して返す
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { notificationSettings } },
        { new: true }
      );
      
      return userDocumentToInterface(updatedUser);
    } catch (error) {
      console.error('通知設定更新エラー:', error);
      return null;
    }
  }

  /**
   * ユーザー削除
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(userId);
      return !!result;
    } catch (error) {
      console.error('ユーザー削除エラー:', error);
      return false;
    }
  }

  /**
   * 生年月日から陰陽五行属性を計算するユーティリティ関数
   * 注：実際の五行計算ロジックはより複雑になるため、ここでは簡易版を実装
   */
  private calculateElementalType(birthDate: string): IUser['elementalType'] {
    const date = new Date(birthDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 簡易的な計算例：生年月日の合計を5で割った余りで属性を決定
    const sum = year + month + day;
    const remainder = sum % 5;
    
    let mainElement: '木' | '火' | '土' | '金' | '水';
    
    // 余りによって主属性を決定
    switch (remainder) {
      case 0:
        mainElement = '木';
        break;
      case 1:
        mainElement = '火';
        break;
      case 2:
        mainElement = '土';
        break;
      case 3:
        mainElement = '金';
        break;
      case 4:
        mainElement = '水';
        break;
      default:
        mainElement = '木';
    }
    
    // 偶数年生まれは陽、奇数年生まれは陰
    const yinYang: '陰' | '陽' = year % 2 !== 0 ? '陰' : '陽';
    
    // 月によって副属性を決定（例：春は木、夏は火、など）
    let secondaryElement: '木' | '火' | '土' | '金' | '水' | undefined;
    
    if (month >= 3 && month <= 4) {
      secondaryElement = '木';  // 春
    } else if (month >= 5 && month <= 6) {
      secondaryElement = '火';  // 夏
    } else if (month >= 7 && month <= 8) {
      secondaryElement = '土';  // 晩夏
    } else if (month >= 9 && month <= 10) {
      secondaryElement = '金';  // 秋
    } else {
      secondaryElement = '水';  // 冬
    }
    
    return {
      mainElement,
      secondaryElement,
      yinYang
    };
  }
}

export const userService = new UserService();
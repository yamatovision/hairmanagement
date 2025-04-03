import { getApiUrl } from '../api/apiConfig';
import { SUBSCRIPTION } from '../types/paths';
import { PlanType, SubscriptionStatus, ISubscription } from '../types/models';

/**
 * サブスクリプションサービス
 * サブスクリプション管理用のAPIと通信
 */
class SubscriptionService {
  /**
   * チームのサブスクリプション情報を取得
   * @param teamId チームID
   */
  async getTeamSubscription(teamId: string): Promise<ISubscription> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(getApiUrl(SUBSCRIPTION.GET_TEAM_SUBSCRIPTION(teamId)), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'サブスクリプション情報の取得に失敗しました');
    }
    
    const data = await response.json();
    return data.data;
  }
  
  /**
   * 新しいサブスクリプションを作成
   * @param teamId チームID
   * @param planType プランタイプ
   */
  async createSubscription(teamId: string, planType: PlanType): Promise<ISubscription> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(getApiUrl(SUBSCRIPTION.CREATE), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ teamId, planType }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'サブスクリプションの作成に失敗しました');
    }
    
    const data = await response.json();
    return data.data;
  }
  
  /**
   * サブスクリプションプランを変更
   * @param teamId チームID
   * @param planType 新しいプランタイプ
   */
  async changePlan(teamId: string, planType: PlanType): Promise<ISubscription> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(getApiUrl(SUBSCRIPTION.CHANGE_PLAN(teamId)), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ planType }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'プラン変更に失敗しました');
    }
    
    const data = await response.json();
    return data.data;
  }
  
  /**
   * サブスクリプションステータスを更新
   * @param teamId チームID
   * @param status 新しいステータス
   */
  async updateStatus(teamId: string, status: SubscriptionStatus): Promise<ISubscription> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(getApiUrl(SUBSCRIPTION.UPDATE_STATUS(teamId)), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'ステータス更新に失敗しました');
    }
    
    const data = await response.json();
    return data.data;
  }
  
  /**
   * ユーザーのサブスクリプションを更新
   * @param userId ユーザーID
   * @param planType プランタイプ
   */
  async updateUserSubscription(userId: string, planType: PlanType): Promise<ISubscription> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(getApiUrl(SUBSCRIPTION.UPDATE_USER_SUBSCRIPTION(userId)), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ planType }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'ユーザーサブスクリプションの更新に失敗しました');
    }
    
    const data = await response.json();
    return data.data;
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;
# TypeScriptエラー修正: フロントエンド連携と最終検証 (AI-4)

**スコープID**: scope-typescript-error-fix-ai4
**説明**: フロントエンド側のTypeScript連携と全体検証
**担当**: AI-4

## 担当範囲

フロントエンド側でのTypeScript設定とshared型定義の利用方法改善、および全体のビルド検証を担当します。

主な作業内容：
- フロントエンド側のTypeScript設定修正
- 共有型定義へのアクセス方法の改善
- API層での型安全性確保
- 全体の修正が完了した後の検証

## 現状の問題

1. フロントエンドビルドエラー
   ```
   Module not found: Error: You attempted to import ../../../shared/index which falls outside of the project src/ directory. Relative imports outside of src/ are not supported.
   ```

2. 共有型定義へのアクセス方法が統一されていない
   - 相対パスによる参照が多用されている
   - src外のファイルを参照できない制限がある

3. APIレスポンスとシェアード型定義の整合性が取れていない

## 修正計画

### 1. フロントエンド用共有型定義アクセスの改善

新しいファイル `/frontend/src/types/shared.d.ts` を作成し、型定義をブリッジします：

```typescript
/**
 * 共有型定義へのアクセスを提供する型定義ファイル
 * フロントエンドのsrc内からアクセス可能な形で提供
 */

// 共有型定義をすべてreエクスポート
import {
  // 基本型
  ElementType,
  YinYangType,
  FortuneCategory,
  CompatibilityLevel,
  
  // データモデル型
  BaseModelType,
  IUser,
  ElementalType,
  NotificationSettingsType,
  IFortune,
  IConversation,
  IMessage,
  IGoal,
  IMilestone,
  ITeamContribution,
  IMentorship,
  
  // API型
  UserRegistrationRequest,
  UserLoginRequest,
  UserLoginResponse,
  UserUpdateRequest,
  FortuneQueryRequest,
  SendMessageRequest,
  GeneratePromptQuestionRequest,
  GoalCreateRequest,
  GoalUpdateRequest,
  
  // APIパス
  API_BASE_PATH,
  AUTH,
  USER,
  FORTUNE,
  CONVERSATION,
  GOAL,
  TEAM,
  ANALYTICS
} from '../../../shared';

// 型をすべてreエクスポート
export {
  // 基本型
  ElementType,
  YinYangType,
  FortuneCategory,
  CompatibilityLevel,
  
  // データモデル型
  BaseModelType,
  IUser,
  ElementalType,
  NotificationSettingsType,
  IFortune,
  IConversation,
  IMessage,
  IGoal,
  IMilestone,
  ITeamContribution,
  IMentorship,
  
  // API型
  UserRegistrationRequest,
  UserLoginRequest,
  UserLoginResponse,
  UserUpdateRequest,
  FortuneQueryRequest,
  SendMessageRequest,
  GeneratePromptQuestionRequest,
  GoalCreateRequest,
  GoalUpdateRequest,
  
  // APIパス
  API_BASE_PATH,
  AUTH,
  USER,
  FORTUNE,
  CONVERSATION,
  GOAL,
  TEAM,
  ANALYTICS
};
```

### 2. API層での型安全性向上

新しいファイル `/frontend/src/api/apiTypes.ts` を作成し、APIとの通信における型安全性を確保します：

```typescript
/**
 * API通信の型安全性を確保するためのユーティリティ
 */
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SharedTypes from '../types/shared';

// API応答の標準形式
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

// 型付きApiクライアント
export const apiClient = {
  // GETリクエスト
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios.get(url, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError<T>(error as AxiosError);
    }
  },

  // POSTリクエスト
  async post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios.post(url, data, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError<T>(error as AxiosError);
    }
  },

  // PUTリクエスト
  async put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios.put(url, data, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError<T>(error as AxiosError);
    }
  },

  // DELETEリクエスト
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios.delete(url, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError<T>(error as AxiosError);
    }
  }
};

// レスポンス処理
function handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
  const { data } = response;
  
  if (!data.success || !data.data) {
    throw new Error(data.error?.message || '不明なエラーが発生しました。');
  }
  
  return data.data;
}

// エラー処理
function handleError<T>(error: AxiosError): never {
  if (error.response) {
    const errorData = error.response.data as ApiResponse<T>;
    throw new Error(errorData.error?.message || `HTTPエラー: ${error.response.status}`);
  } else if (error.request) {
    throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
  } else {
    throw new Error(error.message || '不明なエラーが発生しました。');
  }
}

// APIサービス実装例（auth, user, fortuneなど）
export const authApi = {
  login: async (credentials: SharedTypes.UserLoginRequest): Promise<SharedTypes.UserLoginResponse> => {
    return apiClient.post<SharedTypes.UserLoginResponse>(SharedTypes.AUTH.LOGIN, credentials);
  },
  // 他のメソッド...
};
```

### 3. フロントエンドでの型参照修正

既存のコンポーネントとサービスの型参照を修正します。例：

```typescript
// 修正前
import { IUser, UserLoginRequest } from '../../../shared';

// 修正後
import { IUser, UserLoginRequest } from '../types/shared';
```

### 4. 全体の検証

他のAIチームの修正が完了した後、以下を検証します：

- バックエンドのビルド: `cd backend && npm run build`
- フロントエンドのビルド: `cd frontend && npm run build`
- バックエンドの型チェック: `cd backend && npm run typecheck`（設定されている場合）
- 統合テスト: 主要機能のテスト実行

## 実装手順

1. 他のAIチームの修正を待ちながら、フロントエンド側の修正計画を具体化
2. `/frontend/src/types/shared.d.ts` の作成
3. `/frontend/src/api/apiTypes.ts` の作成
4. 既存コンポーネントの型参照を更新
5. 全体ビルドの検証

## 依存関係

- AI-1チームによるshared型定義とtsconfig修正の完了
- AI-2チームによるモデル層の修正
- AI-3チームによるサービス層の修正

## 注意点

- Reactアプリケーションの特性を考慮した実装を行うこと
- Create React Appの制限（src外からのインポート禁止など）に対応すること
- ビルド環境とランタイム環境の両方で動作することを確認
- 型安全性を損なわずに既存のコードと互換性を保つこと
- APIクライアントが型安全かつ使いやすい設計になっていること
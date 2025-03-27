# TypeScriptエラー修正: バックエンドサービス (AI-3)

**スコープID**: scope-typescript-error-fix-ai3
**説明**: バックエンドのサービス層TypeScriptエラー修正
**担当**: AI-3

## 担当範囲

バックエンドのサービス層とコントローラーにおけるTypeScriptエラーの修正を担当します。特に以下のファイルに焦点を当てます：

- user.service.ts
- fortune.service.ts
- analytics.service.ts 
- claude.service.ts
- conversation.service.ts
- 関連するコントローラーファイル

## 現状の問題

1. 型変換エラー
   ```
   Type 'Document<unknown, {}, IUserDocument> & IUserDocument & Required<{ _id: unknown; }> & { __v: number; }' is not assignable to type 'IUser'.
   Property 'id' is optional in type 'Document<unknown, {}, IUserDocument> & IUserDocument & Required<{ _id: unknown; }> & { __v: number; }' but required in type 'IUser'.
   ```

2. メソッド呼び出しエラー
   ```
   Property 'markAsViewed' does not exist on type 'Document<unknown, {}, IFortuneDocument> & IFortuneDocument & Required<{ _id: unknown; }> & { __v: number; }'.
   ```

3. インポート問題
   ```
   '"../models/user.model"' has no exported member named 'UserModel'. Did you mean 'IUserModel'?
   ```

4. ファイル拡張子の問題
   ```
   An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.
   ```

## 修正計画

### 1. モデル変換ユーティリティの作成

新しいファイル `/backend/src/utils/model-converters.ts` を作成し、MongooseドキュメントとTypeScriptインターフェースの変換を簡素化します：

```typescript
/**
 * Mongooseドキュメントを共有インターフェースに変換するユーティリティ関数
 */
import { Document } from 'mongoose';
import { IUser, IFortune, IConversation, IEngagementAnalytics, ITeamAnalytics } from '@shared';

// 共通変換ヘルパー
export function documentToInterface<T>(doc: Document | null): T | null {
  if (!doc) return null;
  
  // toJSONメソッドがある場合はそれを使用
  if (typeof doc.toJSON === 'function') {
    const obj = doc.toJSON();
    return obj as T;
  }
  
  // トランスフォーム関数を自前で実装（必要に応じて）
  const obj = doc.toObject();
  const result = {
    ...obj,
    id: obj._id.toString(),
  };
  
  delete result._id;
  delete result.__v;
  
  return result as T;
}

// リスト変換ヘルパー
export function documentsToInterfaces<T>(docs: Document[]): T[] {
  return docs.map(doc => documentToInterface<T>(doc));
}

// 型別の特殊変換関数（必要に応じて）
export function userDocumentToInterface(doc: Document | null): IUser | null {
  return documentToInterface<IUser>(doc);
}

export function fortuneDocumentToInterface(doc: Document | null): IFortune | null {
  return documentToInterface<IFortune>(doc);
}

// その他必要な変換関数
```

### 2. サービスファイルの修正

各サービスファイルは以下のパターンで修正します：

```typescript
// user.service.ts 修正例
import User from '../models/user.model';
import { IUser, UserUpdateRequest } from '@shared';
import { userDocumentToInterface, documentsToInterfaces } from '../utils/model-converters';

class UserService {
  // モデル→インターフェース変換を追加
  async getUserById(userId: string): Promise<IUser | null> {
    try {
      const userDoc = await User.findById(userId);
      return userDocumentToInterface(userDoc);
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
      return null;
    }
  }

  // リスト変換の例
  async getAllUsers(): Promise<IUser[]> {
    try {
      const userDocs = await User.find({});
      return documentsToInterfaces<IUser>(userDocs);
    } catch (error) {
      console.error('全ユーザー取得エラー:', error);
      return [];
    }
  }

  // 以下同様の修正を他のメソッドにも適用
  // ...
}
```

### 3. ファイル拡張子とインポートの修正

`.ts`拡張子を含むインポートを修正し、正しいエクスポート名を参照するように修正します：

```typescript
// 修正前
import Fortune, { IFortuneDocument } from '../models/fortune.model.ts';

// 修正後
import Fortune, { IFortuneDocument } from '../models/fortune.model';
```

### 4. メソッド呼び出しの修正

不足しているメソッドや型不一致の問題を修正します：

```typescript
// 修正前
fortune.markAsViewed();

// 修正後（メソッドが定義されていない場合）
await Fortune.findByIdAndUpdate(fortune._id, { viewedAt: new Date() });

// または、型を明示的に指定
const fortuneDoc = fortune as IFortuneDocument;
await fortuneDoc.markAsViewed();
```

## 実装手順

1. `/backend/src/utils/model-converters.ts` の作成
2. サービスファイルごとの修正：
   - user.service.ts
   - fortune.service.ts
   - analytics.service.ts
   - claude.service.ts
   - conversation.service.ts
3. 関連するコントローラーの修正（必要に応じて）
4. インポートパスと拡張子の問題を修正

## 依存関係

- AI-1チームによるshared型定義の修正
- AI-2チームによるモデル層の修正

## 注意点

- 型定義の変更はビジネスロジックに影響を与えないこと
- 既存のサービスの動作が維持されること
- エラーハンドリングが適切に実装されていること
- 新しいユーティリティ関数がシンプルで再利用可能であること
- 非同期処理（Promise、async/await）が正しく型付けされていること
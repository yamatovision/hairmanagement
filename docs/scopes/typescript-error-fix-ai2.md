# TypeScriptエラー修正: バックエンドモデル (AI-2)

**スコープID**: scope-typescript-error-fix-ai2
**説明**: バックエンドのMongooseモデル修正
**担当**: AI-2

## 担当範囲

バックエンドのMongooseモデル定義とそれに関連する型定義の修正を担当します。主に以下のファイルに焦点を当てます：

- user.model.ts
- fortune.model.ts
- analytics.model.ts
- conversation.model.ts
- その他関連するモデルファイル

## 現状の問題

1. モデルのインターフェース型とDocument型の不一致
   ```
   Interface 'EngagementAnalyticsDocument' cannot simultaneously extend types 'IEngagementAnalytics' and 'Document<unknown, any, any>'.
   Named property 'id' of types 'IEngagementAnalytics' and 'Document<unknown, any, any>' are not identical.
   ```

2. インポートの問題
   ```
   src/services/claude.service.ts(2,10): error TS2724: '"../models/user.model"' has no exported member named 'UserModel'. Did you mean 'IUserModel'?
   ```

3. ファイル拡張子の問題
   ```
   src/services/fortune.service.ts(10,43): error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.
   ```

4. メソッド不足エラー
   ```
   Property 'markAsViewed' does not exist on type 'Document<unknown, {}, IFortuneDocument> & IFortuneDocument & Required<{ _id: unknown; }> & { __v: number; }'.
   ```

## 修正計画

### 1. Mongoose型定義拡張ファイルの作成

新しいファイル `/backend/src/types/mongoose-extensions.d.ts` を作成し、MongooseとTypeScriptの型定義をより良く統合します。

```typescript
import { Document, Model } from 'mongoose';
import { IUser, IFortune, IEngagementAnalytics, ITeamAnalytics } from '@shared';

// _idとidの互換性を解決するためのヘルパー型
export type WithId<T> = Omit<T, 'id'> & { _id: string };

// ドキュメント型のヘルパー
export type MongooseDocument<T> = Document & WithId<T>;

// モデル型のヘルパー
export type MongooseModel<T, TMethods = {}> = Model<MongooseDocument<T>> & TMethods;

// 変換ヘルパー
export interface DocumentToInterface {
  toInterface<T>(): T;
}
```

### 2. モデルファイルの修正パターン

各モデルファイルは以下のパターンに従って修正します：

```typescript
// user.model.ts修正例
import { IUser } from '@shared';
import { MongooseDocument, MongooseModel, DocumentToInterface } from '../types/mongoose-extensions';

// ドキュメントインターフェース
export interface IUserDocument extends MongooseDocument<IUser>, DocumentToInterface {
  // ドキュメント固有のメソッド
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// モデルインターフェース
export interface IUserModel extends MongooseModel<IUser> {
  findByEmail(email: string): Promise<IUserDocument | null>;
}

// スキーマ定義
const userSchema = new Schema({...});

// トランスフォーム設定
userSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// インターフェース変換メソッド
userSchema.methods.toInterface = function(): IUser {
  const json = this.toJSON();
  return json as IUser;
};

// エクスポート
export default mongoose.model<IUserDocument, IUserModel>('User', userSchema);
```

### 3. 他のモデルファイル修正

同様のパターンで以下のファイルを修正します：

- fortune.model.ts（markAsViewedメソッドの問題を修正）
- analytics.model.ts（インターフェース拡張の問題を修正）
- conversation.model.ts
- その他関連するモデルファイル

### 4. インポートパスの修正

.ts拡張子を含むインポートを修正します：

```typescript
// 修正前
import Fortune, { IFortuneDocument } from '../models/fortune.model.ts';

// 修正後
import Fortune, { IFortuneDocument } from '../models/fortune.model';
```

## 実装手順

1. `/backend/src/types/mongoose-extensions.d.ts` の作成
2. AI-1チームのshared型定義修正を待って、各モデルファイルの修正
   - user.model.ts
   - fortune.model.ts
   - analytics.model.ts
   - conversation.model.ts
3. すべてのファイルでインポートパスの問題を修正
4. モデルファイルのエクスポート方法を統一

## 依存関係

- AI-1チームによる共有型定義とtsconfig修正の完了
- AI-3チームが参照するモデルの修正を提供

## 注意点

- モデルのインターフェースを変更する際は、既存のコードとの互換性を確保
- MongooseのDocumentとInterface間の一貫したマッピング方法を確立
- スキーマ定義自体は変更せず、型定義のみを修正
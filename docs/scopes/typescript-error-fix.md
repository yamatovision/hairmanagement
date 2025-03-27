# TypeScriptエラー修正スコープ

**スコープID**: scope-typescript-error-fix
**説明**: プロジェクト全体のTypeScriptエラーを修正し、ビルドを成功させる
**重要度**: 高
**担当者**: AI チーム（4名）

## 背景

現在、プロジェクトには以下のTypeScriptエラーが存在します：

1. バックエンド側のエラー（`npm run build`実行時）：
   - shared/index.tsが`rootDir`外にあるエラー
   - Document型とIUser/IEngagementAnalyticsなどのInterface型の不一致
   - モデルのimport問題（UserModelなど）
   - .ts拡張子を含むimportに関するエラー
   - メソッド不足エラー（markAsViewedなど）
   - 型変換エラー（DocumentからIUserへの変換など）

2. フロントエンド側のエラー（`npm run build`実行時）：
   - src外からのimportエラー（shared/index）

## 解決アプローチ

4つのAIを使用して並列に作業し、効率的にエラーを解消します。

### AI-1: 共有型定義の修正（shared/index.ts）

- 責任範囲: 
  - shared/index.tsの正しい構造への修正
  - tsconfig.jsonの設定調整
  - 共有型定義のIUserやIEngagementAnalyticsなどのDocument型との互換性向上

### AI-2: バックエンドモデルの修正

- 責任範囲:
  - モデル定義（User, Fortune, Analytics）の修正
  - Mongoose DocumentとInterface間の型変換関数実装
  - importパスの修正

### AI-3: バックエンドサービスの修正

- 責任範囲:
  - サービス実装（UserService, FortuneService, AnalyticsService）の修正
  - Mongooseモデルと共有インターフェースの橋渡しコード実装
  - 型変換関連のユーティリティ関数実装

### AI-4: フロントエンド連携と最終検証

- 責任範囲:
  - フロントエンドのTypeScript設定修正
  - 共有型定義へのアクセス方法改善
  - 最終的なプロジェクト全体のビルド確認

## 実装順序

1. 最初のフェーズ (基盤整備)
   - shared/index.tsをTypeScript標準に準拠するよう修正
   - tsconfig.jsonの設定を修正（paths, includeなど）
   - ビルド設定の調整

2. 第二フェーズ (モデル修正)
   - Mongooseモデルの型定義を修正
   - 共有インターフェースとの変換関数を実装
   - 共通ユーティリティの実装

3. 第三フェーズ (サービス修正)
   - サービス層の型エラー修正
   - importパスの修正
   - メソッド呼び出しの整合性確保

4. 最終フェーズ (検証と統合)
   - すべての変更の統合
   - ビルド検証
   - テスト実行による機能確認

## 具体的な修正計画

### 1. shared/index.ts修正 (AI-1)

```typescript
// 修正ポイント
// 1. Mongoose Documentインターフェースとの互換性向上
// 2. id vs _id の対応
// 3. 日付型の一貫性（Date vs string）
```

### 2. tsconfig.json 修正 (AI-1)

```json
// バックエンド側の修正
{
  "compilerOptions": {
    // shared以外のパスマッピング調整
    // rootDirの適切な設定
  }
}

// フロントエンド側の修正
{
  "compilerOptions": {
    // shared参照のためのpath設定追加
  }
}
```

### 3. モデル修正例 (AI-2)

```typescript
// ユーザーモデル修正例
interface IUserDocument extends Omit<IUser, 'id'>, Document {
  // Documentとの互換性を確保
}

// 変換ユーティリティの実装
function documentToIUser(doc: IUserDocument): IUser {
  // 変換ロジック
}
```

### 4. サービス修正例 (AI-3)

```typescript
// サービス修正例
async getUserById(userId: string): Promise<IUser | null> {
  const userDoc = await User.findById(userId);
  return userDoc ? documentToIUser(userDoc) : null;
}
```

### 5. フロントエンド修正 (AI-4)

```typescript
// フロントエンド側の修正
// 適切なimportパスの設定
```

## 成功基準

- バックエンド：`npm run build`および`npm run typecheck`が成功すること
- フロントエンド：`npm run build`が成功すること
- 既存の機能が正常に動作すること（テスト通過）
- 型定義が明確で一貫していること
- 将来的な拡張がしやすい柔軟な構造になっていること

## 実装ファイル一覧

### AI-1担当
- [ ] /shared/index.ts
- [ ] /backend/tsconfig.json
- [ ] /frontend/tsconfig.json
- [ ] /shared/utils/typeHelpers.ts（新規）

### AI-2担当
- [ ] /backend/src/models/user.model.ts
- [ ] /backend/src/models/fortune.model.ts
- [ ] /backend/src/models/analytics.model.ts
- [ ] /backend/src/types/mongoose-extensions.d.ts（新規）

### AI-3担当
- [ ] /backend/src/services/user.service.ts
- [ ] /backend/src/services/fortune.service.ts
- [ ] /backend/src/services/analytics.service.ts
- [ ] /backend/src/utils/model-converters.ts（新規）

### AI-4担当
- [ ] /frontend/src/types/shared.d.ts（新規）
- [ ] /frontend/src/api/apiTypes.ts（新規）
- [ ] テスト実行と最終確認

## 注意事項

- 既存機能を損なわないよう、型の互換性を慎重に維持すること
- コメントを適切に残し、型変換ロジックを明確にすること
- チーム間でTypeScriptのバージョン互換性を確認すること
- 将来の拡張性を考慮した設計を心がけること
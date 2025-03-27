# TypeScriptエラー修正: 共有型定義 (AI-1)

**スコープID**: scope-typescript-error-fix-ai1
**説明**: 共有型定義とTypeScript設定の修正
**担当**: AI-1

## 担当範囲

共有型定義（shared/index.ts）の修正と、TSConfigの調整による型定義基盤の改善を担当します。

## 現状の問題

1. `shared/index.ts`が`rootDir`外にあるエラー
   - バックエンド側で`shared/index.ts`を参照する際、rootDirの範囲外というエラーが発生
   - フロントエンド側で`shared/index.ts`をsrc外から参照できないエラーが発生

2. 型定義の不一致
   - MongooseのDocument型とIUser/IEngagementAnalyticsなどのInterfaceの不一致
   - id vs _id の問題
   - Date型とstring型の混在

## 修正計画

### 1. shared/index.tsの修正

以下の変更を行います：

- MongooseのDocument型との互換性を考慮した型定義の調整
- IDフィールドの扱い方を明確化（_idとidの互換性）
- 日付型の一貫した扱い方（Date | string）
- 型変換ユーティリティの追加

```typescript
/**
 * 修正例：BaseModelType定義
 */
export type BaseModelType = {
  id: string;
  _id?: string; // Mongoose互換性のため
  createdAt: string | Date;
  updatedAt: string | Date;
};

// 型変換ヘルパー定義を追加
```

### 2. 型変換ヘルパーの作成（新規）

新しいファイル`/shared/utils/typeHelpers.ts`を作成し、以下の機能を実装します：

- MongooseドキュメントからInterfaceへの変換関数
- Interface形式からMongoose形式への変換関数
- 日付型の変換ヘルパー

```typescript
/**
 * Mongooseドキュメントとインターフェースの変換ヘルパー
 */
export function documentToInterface<T extends BaseModelType>(doc: any): T {
  // 実装
}

export function interfaceToDocument<T extends BaseModelType>(data: T): any {
  // 実装
}
```

### 3. バックエンドtsconfig.jsonの修正

バックエンドのTypeScript設定を調整して、共有ディレクトリを正しく参照できるようにします：

```json
{
  "compilerOptions": {
    "rootDir": "..",  // 上位ディレクトリを含むよう調整
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../shared/*"],
      "@shared": ["../shared"]
    }
  },
  "include": ["src/**/*", "../shared/**/*"]
}
```

### 4. フロントエンドtsconfig.jsonの修正

フロントエンドのTypeScript設定を調整して、src外からも安全に型定義を参照できるようにします：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../shared/*"],
      "@shared": ["../shared"]
    }
  },
  "include": [
    "src",
    "../shared"  // 共有ディレクトリを追加
  ]
}
```

## 実装手順

1. バックエンドとフロントエンドのtsconfig.jsonを確認・修正
2. shared/utils/typeHelpers.tsを作成
3. shared/index.tsを修正
    - BaseModelTypeの修正
    - インターフェースの調整
    - 新しい型ヘルパーの追加
4. 変更をテストし、型エラーが解消されることを確認

## 依存関係

- 他のAIのタスクはこのタスクの完了に依存
- 特に、モデル修正（AI-2）の前にこのタスクが完了していることが重要

## 注意点

- 既存のコードとの完全な互換性を維持すること
- フロントエンドとバックエンドの両方で動作することを確認すること
- 冗長なコードは避け、効率的で再利用可能なヘルパー関数を作成すること
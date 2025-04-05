# TypeScript エラー修正ガイド

## 概要

このドキュメントは、プロジェクトのTypeScriptエラーを修正するためのガイドラインを提供します。型安全性を向上させ、コードの品質を高めるための統一的なアプローチを説明します。

作成日: 2025/04/05
更新日: 2025/04/05 - 主要なエラー修正パターンを追加

## 目次

1. [主要なエラーパターン](#主要なエラーパターン)
2. [SajuProfile関連のエラー](#sajuprofile関連のエラー)
3. [インデックスアクセスエラー](#インデックスアクセスエラー)
4. [型変換エラー](#型変換エラー)
5. [Result型の使用パターン](#result型の使用パターン)
6. [標準化パターン](#標準化パターン)

## 主要なエラーパターン

プロジェクト内で最も頻繁に発生するTypeScriptエラーのパターンと修正方法を示します。

### 1. 文字列を特定の型として扱うエラー

```typescript
// エラー例: Argument of type 'string' is not assignable to parameter of type 'ElementType'

// 修正方法: 型アサーションを使用
mainElement: userMainElement as ElementType
```

### 2. オブジェクトのインデックスアクセスエラー

```typescript
// エラー例: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type...

// 修正方法1: キーに型アサーションを追加
const value = obj[key as KeyType];

// 修正方法2: 存在チェックを追加
if (Object.hasOwn(obj, key)) {
  const value = obj[key as KeyType];
}
```

### 3. クラスメソッドが不足するエラー

```typescript
// エラー例: Type '{ ... }' is missing the following properties from type 'SajuProfile': getSimpleExpression, toPlain

// 修正方法: ファクトリ関数を使用
import { createSajuProfile } from '../domain/user/factories/saju-profile.factory';
const profile = createSajuProfile(data);
```

## SajuProfile関連のエラー

SajuProfileクラスは値オブジェクトとして実装されており、getSimpleExpressionとtoPlainメソッドを持ちます。プレーンオブジェクトをSajuProfile型として扱う場合、これらのメソッドがないためエラーが発生します。

### 修正方法1: ファクトリ関数を使用

```typescript
import { createSajuProfile } from '../../domain/user/factories/saju-profile.factory';

// ユーザープロファイル情報を修正
if (user.sajuProfile) {
  const updatedProfile = createSajuProfile({
    ...user.sajuProfile,
    branchTenGods: calculatedBranchTenGods
  });
  
  user = {
    ...user,
    sajuProfile: updatedProfile
  };
}
```

### 修正方法2: 型アサーションを分離

SajuProfile型を扱う箇所と、実データの操作を分離します。

```typescript
// プレーンオブジェクトとして扱う
function processSajuData(data: any) {
  // データ処理...
  data.branchTenGods = calculatedBranchTenGods;
  return data;
}

// SajuProfileとして扱う必要がある場合のみ変換
function getSajuProfile(data: any): SajuProfile {
  return createSajuProfile(data);
}
```

## インデックスアクセスエラー

オブジェクトのプロパティに文字列をキーとしてアクセスすると、TypeScriptはその文字列が有効なキーであるかどうかを検証できないため、エラーが発生します。

### 安全なインデックスアクセス方法

```typescript
// 1. 型アサーション
const key = "someKey";
const value = obj[key as KeyType];

// 2. 型ガードを使用
const validKeys = ["key1", "key2", "key3"] as const;
type ValidKey = typeof validKeys[number];

if (validKeys.includes(key as any)) {
  const value = obj[key as ValidKey];
}

// 3. Recordタイプを使用
const typedObj: Record<string, ValueType> = obj;
const value = typedObj[key];
```

## 型変換エラー

特に文字列を特定の型エイリアス（ElementType, CelestialStem, YinYangTypeなど）として扱う場合に発生します。

### 安全な型変換方法

```typescript
// 1. バリデーション後の型アサーション
const validElements = ['木', '火', '土', '金', '水'] as const;
type ElementType = typeof validElements[number];

if (validElements.includes(element as any)) {
  // 安全に型アサーションを使用できる
  const typedElement = element as ElementType;
}

// 2. 型ガードを使用
function isElementType(value: any): value is ElementType {
  return validElements.includes(value);
}

if (isElementType(element)) {
  // elementはElementType型として扱われる
}
```

## 共通型定義の使用

### 型定義の場所

すべての共通型定義は `/backend/src/shared/types` ディレクトリに集約されています。

```
shared/
├── types/
│   ├── index.ts        # エクスポート集約点
│   ├── base.ts         # 基本型定義
│   └── saju/           # 四柱推命関連の型定義
│       ├── index.ts    # 四柱推命型のエクスポート
│       ├── core.ts     # 核となる型定義（天干地支など）
│       ├── pillars.ts  # 四柱関連の型定義
│       └── fortune.ts  # 運勢関連の型定義
```

### 型定義のインポート方法

型定義は以下のように一括でインポートすることを推奨します：

```typescript
// 特定のモジュールからすべての型をインポート
import * as SajuTypes from '../../../shared/types/saju';

// または必要な型のみを個別にインポート
import { 
  CelestialStem, 
  TerrestrialBranch, 
  Pillar,
  FourPillars
} from '../../../shared/types/saju';
```

## Result型の使用パターン

### 基本的な使用方法

`Result<T, E>` 型は、操作の成功または失敗を表現するために使用します。主に以下のパターンで使用します：

```typescript
// 成功時
return success(data);  // Result<T, never>を返す

// 失敗時
return failure(new Error('エラーメッセージ'));  // Result<never, E>を返す

// 値の取得
if (result.isSuccess) {
  const value = result.getValue();  // 安全にT型の値を取得
  // valueを使った処理
} else {
  const error = result.getError();  // E型のエラーを取得
  // エラー処理
}
```

### メソッドチェーンパターン

Result型のメソッドチェーンを使用して、エレガントな連鎖処理を実現できます：

```typescript
return getSajuData(userId)
  .map(sajuData => calculateCompatibility(sajuData, targetData))
  .flatMap(compatibility => saveResult(compatibility))
  .match(
    result => ({ success: true, data: result }),
    error => ({ success: false, error: error.message })
  );
```

### Result型を使う場所

以下の場所での Result型 の使用を推奨します：

1. リポジトリメソッド - データアクセス操作の結果を返す
2. サービスメソッド - 複雑なビジネスロジックの結果を返す
3. 外部APIとの統合 - 外部サービスとのやり取りの結果を返す
4. バリデーション - 入力検証の結果を返す

### 注意点

1. コントローラーでは Result型 を解決し、HTTPレスポンスに変換する
2. 常に `isSuccess` プロパティをチェックしてから `getValue()` メソッドを呼び出す
3. エラー情報は `getError()` メソッドで取得する
4. エラーメッセージには `getErrorMessage()` を使用する

## 具体的な修正例

### system-message-builder.service.ts の修正例

```typescript
// エラー行: branchTenGods = this.sajuDataTransformer.extractBranchTenGods(user.sajuProfile);

// 修正手順:
import { createSajuProfile } from '../../domain/user/factories/saju-profile.factory';

// 1. 抽出したデータを受け取る
const branchTenGods = this.sajuDataTransformer.extractBranchTenGods(user.sajuProfile);

// 2. SajuProfileインスタンスを適切に生成
if (branchTenGods) {
  const enhancedSajuProfile = createSajuProfile({
    ...user.sajuProfile,
    branchTenGods
  });
  
  // 3. オブジェクト内でコピーとして扱う
  user = {
    ...user,
    sajuProfile: enhancedSajuProfile
  };
}
```

### saju-data-transformer.service.ts の修正例

```typescript
// エラー行: tenGod = this.calculateTenGodRelation(userDayMaster, dayStem);

// 修正:
tenGod = this.calculateTenGodRelation(
  userDayMaster as CelestialStem,
  dayStem as CelestialStem
);

// エラー行: mainElement: userMainElement

// 修正:
mainElement: userMainElement as ElementType,

// エラー行: const result: SajuData = { /* properties */ };

// 修正: SajuDataインターフェースを更新して、実装と一致させる
```

## 標準化パターン

### API応答型の標準化

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 使用例
function handleGetUser(req: Request, res: Response): Promise<void> {
  const result = await userService.getUser(req.params.id);
  
  const response: ApiResponse<UserDto> = result.isSuccess
    ? { success: true, data: result.getValue() }
    : { success: false, error: result.getErrorMessage() };
  
  res.json(response);
}
```

### エラー処理の標準化

```typescript
export async function executeOperation<T>(
  operation: () => Promise<T>,
  errorHandler: (error: unknown) => Response
): Promise<Response> {
  try {
    const result = await operation();
    return Response.json({ success: true, data: result });
  } catch (error) {
    return errorHandler(error);
  }
}
```

## 補足

- 型アサーションは慎重に使用してください。可能であれば、アサーション前に値の検証を行いましょう。
- 複雑なオブジェクト構造を扱う場合は、ファクトリ関数やビルダーパターンを検討してください。
- 修正作業は大規模な変更よりも、小さな単位で段階的に行うことをお勧めします。
- 型安全性を高めるために、`any`型の使用を避け、具体的な型を指定するようにしましょう。
- TypeScriptコンパイラの厳格なチェックを有効にすることで、より多くの潜在的な問題を早期に発見できます。
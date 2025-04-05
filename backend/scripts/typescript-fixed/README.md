# TypeScript エラー修正ツールキット

このディレクトリには、プロジェクト内のTypeScriptエラーを系統的に解決するためのスクリプトが含まれています。

## 概要

プロジェクトには約411個のTypeScriptエラーが存在しており、これらは主に以下の3つのパターンに分類されます：

1. **モジュール解決エラー (TS2307)**
   - 例: `Cannot find module '../../utils/logger.util' or its corresponding type declarations.`
   - ファイル: `src/application/services/archive/conversation.service.ts` など

2. **unknown型のエラー処理 (TS18046)**
   - 例: `'error' is of type 'unknown'.`
   - ファイル: `src/application/services/daily-calendar-info.service.ts` など

3. **暗黙的any型の使用 (TS7006)**
   - 例: `Parameter '...' implicitly has an 'any' type.`
   - ファイル: 多数のファイルで発生

## 使用方法

各スクリプトは対象となるエラーを検出し、修正方法を提案します。以下の順序で実行することをお勧めします：

1. モジュール解決エラーの修正:
   ```
   npx ts-node scripts/typescript-fixed/fix-module-resolution.ts
   ```

2. unknown型エラー処理の修正:
   ```
   npx ts-node scripts/typescript-fixed/fix-unknown-errors.ts
   ```

3. 暗黙的any型の修正:
   ```
   npx ts-node scripts/typescript-fixed/fix-implicit-any.ts
   ```

各スクリプトは実行後、問題のあるファイルとその修正方法を出力します。提案された修正を手動で適用してください。

## 共通解決策

### 1. モジュール解決エラー

- **パスエイリアスの使用**: `../../utils/logger.util` → `@utils/logger.util`
- **tsconfig.jsonの設定**:
  ```json
  {
    "compilerOptions": {
      "baseUrl": "src",
      "paths": {
        "@utils/*": ["utils/*"],
        "@domain/*": ["domain/*"]
        // 他のエイリアス
      }
    }
  }
  ```

### 2. unknown型のエラー処理

- **型ガードの使用**:
  ```typescript
  try {
    // 処理
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('Unknown error:', error);
    }
  }
  ```

- **Result型の使用** (推奨):
  ```typescript
  try {
    const result = await someOperation();
    return Result.success(result);
  } catch (error) {
    if (error instanceof Error) {
      return Result.failure(error);
    }
    return Result.failure(new Error(`Unknown error: ${String(error)}`));
  }
  ```

### 3. 暗黙的any型

- **適切な型アノテーションの追加**:
  ```typescript
  // 修正前
  function process(data) {
    // ...
  }
  
  // 修正後
  function process(data: Record<string, unknown>): void {
    // ...
  }
  ```

## 注意事項

- スクリプトは修正提案のみを行い、実際のファイル変更は行いません
- 修正後は必ず `npm run typecheck` を実行して、エラーが解消されたことを確認してください
- ビジネスロジックを変更しないよう注意しながら修正を行ってください

## 想定される成果

これらのスクリプトを使用して系統的に修正を行うことで、411個のエラーを150-200個程度まで削減できることが期待されます。残りのエラーは、より特殊なケースとして個別に対応する必要があります。

---

最終更新日: 2025/04/05
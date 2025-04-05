# TypeScriptエラー修正ガイド

全部で 4 個のエラーが見つかりました。

## 型の不一致: 引数の型を確認し、適切な型に変換してください。 (1件)

- ../src/infrastructure/repositories/MongoTeamRepository.ts:51 - Argument of type 'string | undefined' is not assignable to parameter of type 'string'.

## 型の不一致: 型の変換またはキャストを検討してください。 (3件)

- ../src/utils/error-handler.util.ts:137 - Type 'ErrorContext' is not assignable to type 'undefined'.
- ../src/utils/error-handler.util.ts:145 - Type 'any[]' is not assignable to type 'undefined'.
- ../src/utils/saju/refactored/lunarConverter.ts:253 - Type 'null' is not assignable to type 'string | undefined'.


詳細な修正方法については docs/typescript-error-fix.md を参照してください。
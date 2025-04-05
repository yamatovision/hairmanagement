# TypeScriptエラー修正ガイド

全部で 268 個のエラーが見つかりました。

## 型の不一致: 引数の型を確認し、適切な型に変換してください。 (5件)

- src/application/services/saju-calculator.service.ts:88 - Argument of type 'string' is not assignable to parameter of type 'ElementType'.
- src/application/user/use-cases/update-user-profile.use-case.ts:95 - Argument of type 'undefined' is not assignable to parameter of type 'number'.
- src/direct-chat.ts:182 - Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
- src/direct-chat.ts:210 - Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
- src/infrastructure/repositories/MongoTeamRepository.ts:48 - Argument of type 'string | undefined' is not assignable to parameter of type 'string'.

## インデックスアクセス問題: オブジェクトのキーが正しい型であることを確認するか、型アサーション (as KeyType) を使用してください。 (95件)

- src/application/services/system-message-builder.service.ts:403 - Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ 木: number; 火: number; 土: number; 金: number; 水: number; }'.
- src/utils/saju/refactored/koreanMonthPillarCalculator.ts:139 - Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ 甲: number; 乙: number; 丙: number; 丁: number; 戊: number; 己: number; 庚: number; 辛: number; 壬: number; 癸: number; }'.
- src/utils/saju/refactored/koreanMonthPillarCalculator.ts:176 - Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ 1: number; 2: number; 3: number; 4: number; 5: number; 6: number; 7: number; 8: number; 9: number; 10: number; 11: number; 12: number; }'.
- src/utils/saju/refactored/koreanMonthPillarCalculator.ts:254 - Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ "2023-06-19": string; "2023-08-07": string; }'.
- src/utils/saju/refactored/koreanMonthPillarCalculator.ts:255 - Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ "2023-06-19": string; "2023-08-07": string; }'.
  ... 他 90 件

## SajuProfileクラス不一致: SajuProfileクラスのインスタンス化には、getSimpleExpression()とtoPlain()メソッドが必要です。ファクトリメソッドまたはコンストラクタを使用してください。 (3件)

- src/application/services/system-message-builder.service.ts:606 - Type '{ branchTenGods: Record<PillarType, TenGodType>; fourPillars: FourPillars; mainElement: ElementType; yinYang: YinYangType; ... 5 more ...; dayMaster?: CelestialStem | undefined; }' is missing the following properties from type 'SajuProfile': getSimpleExpression, toPlain
- src/application/services/system-message-builder.service.ts:627 - Type '{ branchTenGods: Record<PillarType, TenGodType>; fourPillars: FourPillars; mainElement: ElementType; yinYang: YinYangType; ... 5 more ...; dayMaster?: CelestialStem | undefined; }' is missing the following properties from type 'SajuProfile': getSimpleExpression, toPlain
- src/application/services/system-message-builder.service.ts:682 - Type '{ branchTenGods: Record<PillarType, TenGodType>; fourPillars: FourPillars; mainElement: ElementType; yinYang: YinYangType; ... 5 more ...; dayMaster?: CelestialStem | undefined; }' is missing the following properties from type 'SajuProfile': getSimpleExpression, toPlain

## 型の不一致: 型の変換またはキャストを検討してください。 (9件)

- src/infrastructure/repositories/MongoConversationRepository.ts:44 - Type 'null' is not assignable to type 'Conversation'.
- src/infrastructure/repositories/MongoFortuneRepository.ts:202 - Type 'AiGeneratedAdvice | undefined' is not assignable to type '{ advice: string; luckyPoints?: { color: string; items: string[]; number: number; action: string; } | undefined; } | undefined'.
- src/infrastructure/repositories/MongoSubscriptionRepository.ts:20 - Type 'Model<any, unknown, unknown, unknown, any, any>' is not assignable to type 'Model<ISubscriptionDocument, {}, {}, {}, Document<unknown, {}, ISubscriptionDocument> & ISubscriptionDocument & { ...; }, any>'.
- src/infrastructure/repositories/MongoSubscriptionRepository.ts:24 - Type 'Model<any, unknown, unknown, unknown, any, any>' is not assignable to type 'Model<ISubscriptionDocument, {}, {}, {}, Document<unknown, {}, ISubscriptionDocument> & ISubscriptionDocument & { ...; }, any>'.
- src/shared/utils/typeHelpers.ts:16 - Type 'null' is not assignable to type 'T'.
  ... 他 4 件

## その他のエラー (156件)

- src/application/services/saju-data-transformer.service.ts:236 - Object literal may only specify known properties, and 'mainElement' does not exist in type 'SajuData'.
- src/application/services/saju-data-transformer.service.ts:242 - Property 'mainElement' does not exist on type 'SajuData'.
- src/application/services/system-message-builder.service.ts:698 - Property 'sajuProfile' does not exist on type 'TeamMember'.
- src/application/services/system-message-builder.service.ts:699 - Property 'sajuProfile' does not exist on type 'TeamMember'.
- src/application/services/system-message-builder.service.ts:699 - Property 'sajuProfile' does not exist on type 'TeamMember'.
  ... 他 151 件

詳細な修正方法については docs/typescript-error-fix.md を参照してください。
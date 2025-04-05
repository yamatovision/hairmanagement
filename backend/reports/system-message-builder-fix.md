# system-message-builder.service.ts 修正ガイド

## 主なエラー内容と修正方針

1. **オブジェクトインデックスの型安全性**
   - エラー例: `Element implicitly has an 'any' type because expression of type 'any' can't be used to index type...`
   - 原因: 文字列キーを使ってオブジェクトにアクセスする際に型の安全性が確保されていません
   - 修正方法: キーに型アサーションを追加する

   ```typescript
   // 修正前
   elementalDistribution[element]++;
   
   // 修正後
   elementalDistribution[element as ElementType]++;
   ```

2. **SajuProfile型の不足プロパティ**
   - エラー例: `Type '{ ... }' is missing the following properties from type 'SajuProfile': getSimpleExpression, toPlain`
   - 原因: 生のオブジェクトをSajuProfile型として扱っていますが、必要なメソッドが不足しています
   - 修正方法: SajuProfileクラスのインスタンスを適切に生成する

   ```typescript
   // 修正前
   user = {
     ...user,
     sajuProfile: {
       ...user.sajuProfile,
       branchTenGods
     }
   };
   
   // 修正後 - ファクトリ関数を使用
   import { createSajuProfile } from '../../domain/user/factories/saju-profile.factory';
   
   const enhancedSajuProfile = createSajuProfile({
     ...user.sajuProfile,
     branchTenGods
   });
   
   user = {
     ...user,
     sajuProfile: enhancedSajuProfile
   };
   ```

3. **型アサーションの追加**
   - 文字列パラメータをElementType, YinYangType, CelestialStemなどの特定の型として扱う場合

   ```typescript
   // 修正前
   mainElement: userMainElement,
   
   // 修正後
   mainElement: userMainElement as ElementType,
   ```

## ファクトリ関数のサンプル実装

```typescript
// domain/user/factories/saju-profile.factory.ts

import { SajuProfile } from '../value-objects/saju-profile';
import { 
  CelestialStem, 
  ElementType,
  YinYangType,
  FourPillars,
  TenGodMap,
  PillarType,
  TenGodType 
} from '../../../shared/types/saju';

/**
 * SajuProfileのファクトリ関数
 * プレーンオブジェクトからSajuProfileインスタンスを生成
 */
export function createSajuProfile(data: any): SajuProfile {
  return new SajuProfile(
    data.fourPillars,
    data.mainElement as ElementType,
    data.yinYang as YinYangType,
    data.tenGods || {} as Record<PillarType, TenGodType>,
    data.branchTenGods || {} as Record<PillarType, TenGodType>,
    data.secondaryElement as ElementType | undefined,
    data.twelveFortunes,
    data.hiddenStems,
    data.twelveSpiritKillers,
    data.dayMaster as CelestialStem | undefined
  );
}
```


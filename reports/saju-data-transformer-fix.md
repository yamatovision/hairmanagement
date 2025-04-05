# saju-data-transformer.service.ts 修正ガイド

## 主なエラー内容と修正方針

1. **型パラメータのミスマッチ**
   - エラー例: `Argument of type 'string' is not assignable to parameter of type 'ElementType'.`
   - 原因: 文字列をElementType等の特定の型パラメータに渡そうとしています
   - 修正方法: 型アサーションを追加する

   ```typescript
   // 修正前
   mainElement: userMainElement,
   
   // 修正後
   mainElement: userMainElement as ElementType,
   ```

2. **SajuDataインターフェースプロパティの不整合**
   - エラー例: `Object literal may only specify known properties, and 'mainElement' does not exist in type 'SajuData'.`
   - 原因: SajuDataインターフェースに定義されていないプロパティを設定しようとしています
   - 修正方法: 実装とインターフェース定義を一致させる

   ```typescript
   // interfaces/saju/fortune.ts内のSajuDataインターフェースを更新
   export interface SajuData {
     // 既存のプロパティ
     dayMaster: string;
     dayElement: ElementType;
     tenGod: TenGodType;
     branchTenGod: TenGodType;
     compatibility: number;
     
     // 追加するプロパティ
     mainElement: ElementType;  // <-- 追加
     yinYang: YinYangType;      // <-- 追加
     rating?: string;           // <-- 追加
     // その他必要なプロパティ
   }
   ```

3. **型アサーションの追加**
   - 文字列を特定の型として扱う場合

   ```typescript
   // 修正前
   tenGod = this.calculateTenGodRelation(userDayMaster, dayStem);
   
   // 修正後
   tenGod = this.calculateTenGodRelation(userDayMaster as CelestialStem, dayStem as CelestialStem);
   ```

## 型アサーションを使用する際の注意点

型アサーションは、TypeScriptのコンパイラに「このデータは確実にこの型である」と伝えるものです。実行時にチェックされないため、間違った型アサーションを行うとランタイムエラーが発生する可能性があります。

可能であれば、型アサーションの前に値の検証を行うことをお勧めします：

```typescript
// 安全な型アサーションの例
const validElements = ['木', '火', '土', '金', '水'];
if (validElements.includes(element)) {
  // この時点でelementはElementTypeの候補値のいずれかであることが確認できている
  const typedElement = element as ElementType;
  // typedElementを使用する処理
}
```


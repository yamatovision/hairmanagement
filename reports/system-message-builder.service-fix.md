# system-message-builder.service.ts エラー修正ガイド

## 概要
- ファイル: src/application/services/system-message-builder.service.ts
- エラー数: 14

## エラー一覧と修正方法

### 行 403: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ 木: number; 火: number; 土: number; 金: number; 水: number; }'.

**修正方法**: オブジェクトのキーアクセス時に型を明示してください。

```typescript
// 修正例
const value = obj[key as KeyType];

// または、アクセス前に存在確認
if (Object.hasOwn(obj, key)) {
  const value = obj[key as KeyType];
}
```

### 行 606: Type '{ branchTenGods: Record<PillarType, TenGodType>; fourPillars: FourPillars; mainElement: ElementType; yinYang: YinYangType; ... 5 more ...; dayMaster?: CelestialStem | undefined; }' is missing the following properties from type 'SajuProfile': getSimpleExpression, toPlain

**修正方法**: SajuProfileクラスを直接インスタンス化せず、ファクトリメソッドを使用するか、クラスのインスタンスを適切に生成してください。

```typescript
// 修正例 - 新しいSajuProfileインスタンスを作成
import { SajuProfile } from '../domain/user/value-objects/saju-profile';
const profile = new SajuProfile(
  data.fourPillars,
  data.mainElement as ElementType,
  data.yinYang as YinYangType,
  data.tenGods,
  data.branchTenGods
);
```

### 行 627: Type '{ branchTenGods: Record<PillarType, TenGodType>; fourPillars: FourPillars; mainElement: ElementType; yinYang: YinYangType; ... 5 more ...; dayMaster?: CelestialStem | undefined; }' is missing the following properties from type 'SajuProfile': getSimpleExpression, toPlain

**修正方法**: SajuProfileクラスを直接インスタンス化せず、ファクトリメソッドを使用するか、クラスのインスタンスを適切に生成してください。

```typescript
// 修正例 - 新しいSajuProfileインスタンスを作成
import { SajuProfile } from '../domain/user/value-objects/saju-profile';
const profile = new SajuProfile(
  data.fourPillars,
  data.mainElement as ElementType,
  data.yinYang as YinYangType,
  data.tenGods,
  data.branchTenGods
);
```

### 行 682: Type '{ branchTenGods: Record<PillarType, TenGodType>; fourPillars: FourPillars; mainElement: ElementType; yinYang: YinYangType; ... 5 more ...; dayMaster?: CelestialStem | undefined; }' is missing the following properties from type 'SajuProfile': getSimpleExpression, toPlain

**修正方法**: SajuProfileクラスを直接インスタンス化せず、ファクトリメソッドを使用するか、クラスのインスタンスを適切に生成してください。

```typescript
// 修正例 - 新しいSajuProfileインスタンスを作成
import { SajuProfile } from '../domain/user/value-objects/saju-profile';
const profile = new SajuProfile(
  data.fourPillars,
  data.mainElement as ElementType,
  data.yinYang as YinYangType,
  data.tenGods,
  data.branchTenGods
);
```

### 行 698: Property 'sajuProfile' does not exist on type 'TeamMember'.

**修正方法**: 対象オブジェクトの型を確認し、プロパティへのアクセス前に型ガードを使用してください。

```typescript
// 修正例
if (obj && 'property' in obj) {
  // obj.property にアクセス
}
```

### 行 699: Property 'sajuProfile' does not exist on type 'TeamMember'.

**修正方法**: 対象オブジェクトの型を確認し、プロパティへのアクセス前に型ガードを使用してください。

```typescript
// 修正例
if (obj && 'property' in obj) {
  // obj.property にアクセス
}
```

### 行 699: Property 'sajuProfile' does not exist on type 'TeamMember'.

**修正方法**: 対象オブジェクトの型を確認し、プロパティへのアクセス前に型ガードを使用してください。

```typescript
// 修正例
if (obj && 'property' in obj) {
  // obj.property にアクセス
}
```

### 行 705: Property 'sajuProfile' does not exist on type 'TeamMember'.

**修正方法**: 対象オブジェクトの型を確認し、プロパティへのアクセス前に型ガードを使用してください。

```typescript
// 修正例
if (obj && 'property' in obj) {
  // obj.property にアクセス
}
```

### 行 707: Property 'name' does not exist on type 'TeamMember'.

**修正方法**: 対象オブジェクトの型を確認し、プロパティへのアクセス前に型ガードを使用してください。

```typescript
// 修正例
if (obj && 'property' in obj) {
  // obj.property にアクセス
}
```

### 行 707: Property '_id' does not exist on type 'TeamMember'.

**修正方法**: 対象オブジェクトの型を確認し、プロパティへのアクセス前に型ガードを使用してください。

```typescript
// 修正例
if (obj && 'property' in obj) {
  // obj.property にアクセス
}
```

### 行 711: Property 'sajuProfile' does not exist on type 'TeamMember'.

**修正方法**: 対象オブジェクトの型を確認し、プロパティへのアクセス前に型ガードを使用してください。

```typescript
// 修正例
if (obj && 'property' in obj) {
  // obj.property にアクセス
}
```

### 行 717: Property 'name' does not exist on type 'TeamMember'.

**修正方法**: 対象オブジェクトの型を確認し、プロパティへのアクセス前に型ガードを使用してください。

```typescript
// 修正例
if (obj && 'property' in obj) {
  // obj.property にアクセス
}
```

### 行 717: Property '_id' does not exist on type 'TeamMember'.

**修正方法**: 対象オブジェクトの型を確認し、プロパティへのアクセス前に型ガードを使用してください。

```typescript
// 修正例
if (obj && 'property' in obj) {
  // obj.property にアクセス
}
```

### 行 725: Type '{ members: (TeamMember | { sajuProfile: any; userId: string; role: string; joinedAt: Date; })[]; name: string; description: string; ownerId: string; isActive: boolean; admins: string[]; goal: string; id: string; createdAt: Date; updatedAt?: Date | undefined; }' is missing the following properties from type 'Team': addAdmin, removeAdmin, addMember, removeMember, and 9 more.

**修正方法**: コードの型を確認し、必要に応じて型アノテーションまたはアサーションを追加してください。

## 一般的な修正パターン

1. **型アサーション**:
   文字列やany型を特定の型として扱いたい場合に使用します。
   `const typedValue = value as SpecificType;`

2. **型ガード**:
   条件分岐前に型を確認することで、TypeScriptに型を理解させます。
   `if (typeof value === 'string') { /* valueは文字列として扱われる */ }`

3. **オプショナルチェイニング**:
   null/undefinedの可能性があるプロパティにアクセスする場合に使用します。
   `const value = obj?.property;`


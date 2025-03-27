import { CompatibilityLevel, ElementType } from "./models";

// 五行の相生関係 (相互に育む関係)
export const ELEMENT_GENERATING_RELATIONS: Record<ElementType, ElementType> = {
  '木': '火', // 木は火を生む
  '火': '土', // 火は土を生む
  '土': '金', // 土は金を生む
  '金': '水', // 金は水を生む
  '水': '木'  // 水は木を生む
};

// 五行の相剋関係 (相互に抑制する関係)
export const ELEMENT_CONTROLLING_RELATIONS: Record<ElementType, ElementType> = {
  '木': '土', // 木は土を剋する
  '土': '水', // 土は水を剋する
  '水': '火', // 水は火を剋する
  '火': '金', // 火は金を剋する
  '金': '木'  // 金は木を剋する
};

// 相生の説明文
export const GENERATING_DESCRIPTIONS: Record<string, string> = {
  '木→火': '木は燃えて火を育みます',
  '火→土': '火の灰は土を豊かにします',
  '土→金': '土の中から金属が産出されます',
  '金→水': '金属が冷えると水滴が生じます',
  '水→木': '水は木の成長を助けます'
};

// 相剋の説明文
export const CONTROLLING_DESCRIPTIONS: Record<string, string> = {
  '木→土': '木の根は土を抑えます',
  '土→水': '土は水を堰き止めます',
  '水→火': '水は火を消します',
  '火→金': '火は金属を溶かします',
  '金→木': '金属の刃物は木を切ります'
};

// 相性レベルの説明と数値評価
export const COMPATIBILITY_RATINGS: Record<CompatibilityLevel, { value: number, description: string }> = {
  [CompatibilityLevel.EXCELLENT]: {
    value: 5,
    description: '非常に良い相性。お互いを高め合う関係です。'
  },
  [CompatibilityLevel.GOOD]: {
    value: 4,
    description: '良い相性。協力することで成果を上げられます。'
  },
  [CompatibilityLevel.NEUTRAL]: {
    value: 3,
    description: '普通の相性。特に問題はありませんが、特別な強みもありません。'
  },
  [CompatibilityLevel.CHALLENGING]: {
    value: 2,
    description: '挑戦的な相性。お互いの理解が必要です。'
  },
  [CompatibilityLevel.DIFFICULT]: {
    value: 1,
    description: '難しい相性。意識的な調和が必要です。'
  }
};
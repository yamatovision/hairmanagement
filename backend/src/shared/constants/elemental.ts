/**
 * 陰陽五行関連の定数と定義
 * 
 * 作成日: 2025/04/05
 */

// 五行の型定義
import { ElementType, YinYangType } from '../types/saju/core';

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

// 運勢に関連するカテゴリ
export enum FortuneCategory {
  CAREER = 'career',       // キャリア運
  RELATIONSHIP = 'relationship', // 人間関係運
  CREATIVITY = 'creativity',   // 創造力運
  HEALTH = 'health',       // 健康運
  WEALTH = 'wealth'        // 金運
}

// 五行要素ごとの色とキーワード
export const ELEMENT_PROPERTIES: Record<ElementType, {
  color: string,
  textColor: string,
  keywords: string[],
  season: string,
  direction: string,
  strengths: string[],
  weaknesses: string[]
}> = {
  '木': {
    color: '#a5d6a7',          // 緑
    textColor: '#1b5e20',
    keywords: ['成長', '発展', '柔軟性', '創造性', '決断力'],
    season: '春',
    direction: '東',
    strengths: ['適応力', '計画性', '直感力', '優しさ', '寛容さ'],
    weaknesses: ['怒りっぽさ', '頑固さ', '焦り', '自己中心的', '批判的']
  },
  '火': {
    color: '#ffab91',          // 赤
    textColor: '#bf360c',
    keywords: ['情熱', '変化', '行動力', '表現力', '拡大'],
    season: '夏',
    direction: '南',
    strengths: ['情熱', 'リーダーシップ', '社交性', '魅力', '直感'],
    weaknesses: ['衝動的', '短気', '支配的', '自己顕示欲', '落ち着きのなさ']
  },
  '土': {
    color: '#d7ccc8',          // 黄土色
    textColor: '#4e342e',
    keywords: ['安定', '中心', '思考力', '調和', '信頼'],
    season: '季節の変わり目',
    direction: '中央',
    strengths: ['信頼性', '実用性', '堅実さ', '思慮深さ', '安定感'],
    weaknesses: ['心配性', '保守的', '優柔不断', '固執', '頑固さ']
  },
  '金': {
    color: '#e0e0e0',          // 銀/白
    textColor: '#424242',
    keywords: ['収穫', '確実性', '正確さ', '決断力', '潔癖'],
    season: '秋',
    direction: '西',
    strengths: ['効率性', '几帳面さ', '正確さ', '分析力', '完璧主義'],
    weaknesses: ['批判的', '冷淡', '独断的', '融通が利かない', '強迫観念']
  },
  '水': {
    color: '#81d4fa',          // 青
    textColor: '#01579b',
    keywords: ['知恵', '柔軟性', '持久力', '深み', '静けさ'],
    season: '冬',
    direction: '北',
    strengths: ['知性', '洞察力', '直感', '柔軟性', '忍耐力'],
    weaknesses: ['恐れ', '優柔不断', '意志薄弱', '冷たさ', '無関心']
  }
};

// 陰陽の特性
export const YIN_YANG_PROPERTIES: Record<YinYangType, {
  nature: string[],
  traits: string[],
  energy: string
}> = {
  '陰': {
    nature: ['静', '暗', '寒', '内向', '物質的'],
    traits: ['内省的', '受動的', '秩序を好む', '落ち着いている', '協調的'],
    energy: '収縮するエネルギー'
  },
  '陽': {
    nature: ['動', '明', '熱', '外向', '精神的'],
    traits: ['活動的', '能動的', '冒険好き', 'エネルギッシュ', '独立心が強い'],
    energy: '拡張するエネルギー'
  }
};

// 日ごとの陰陽五行の組み合わせを生成するための干支マッピング
// 専門的な実装には易学や九星気学に基づいた複雑な計算を要するため
// ここでは単純化したモデルを使用する
export const SIMPLIFIED_DAY_CALCULATION = {
  // 日付から五行を単純計算（月+日を5で割った余り）
  dayElementMap: [
    '木', // 余り0
    '火', // 余り1
    '土', // 余り2
    '金', // 余り3
    '水'  // 余り4
  ] as ElementType[],
  // 日付から陰陽を計算（奇数=陽、偶数=陰）
  dayYinYangMap: {
    odd: '陽',
    even: '陰'
  } as Record<string, YinYangType>
};

// 相性評価レベル
export enum CompatibilityLevel {
  EXCELLENT = 'excellent', // 相生で強い相性
  GOOD = 'good',       // 相生
  NEUTRAL = 'neutral',   // 中立
  CHALLENGING = 'challenging', // 相剋があるが成長の可能性
  DIFFICULT = 'difficult'   // 相剋で困難な相性
}

// 相性レベルの説明と数値評価
export const COMPATIBILITY_RATINGS: Record<CompatibilityLevel, {
  value: number,
  description: string
}> = {
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
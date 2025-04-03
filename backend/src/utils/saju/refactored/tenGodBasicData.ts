/**
 * 地支の十神関係計算のための基本データ
 */

// 天干の基本データ
export const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支の基本データ
export const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 五行の属性
export const fiveElements = {
  木: { name: '木', yinYang: null },
  火: { name: '火', yinYang: null },
  土: { name: '土', yinYang: null },
  金: { name: '金', yinYang: null },
  水: { name: '水', yinYang: null }
};

// 天干の五行属性
export const stemElements = {
  '甲': '木',
  '乙': '木',
  '丙': '火',
  '丁': '火',
  '戊': '土',
  '己': '土',
  '庚': '金',
  '辛': '金',
  '壬': '水',
  '癸': '水'
};

// 天干の陰陽属性
export const stemYinYang = {
  '甲': 'yang', // 陽
  '乙': 'yin',  // 陰
  '丙': 'yang', // 陽
  '丁': 'yin',  // 陰
  '戊': 'yang', // 陽
  '己': 'yin',  // 陰
  '庚': 'yang', // 陽
  '辛': 'yin',  // 陰
  '壬': 'yang', // 陽
  '癸': 'yin'   // 陰
};

// 地支の五行属性
export const branchElements = {
  '子': '水',
  '丑': '土',
  '寅': '木',
  '卯': '木',
  '辰': '土',
  '巳': '火',
  '午': '火',
  '未': '土',
  '申': '金',
  '酉': '金',
  '戌': '土',
  '亥': '水'
};

// 地支の陰陽属性
export const branchYinYang = {
  '子': 'yang', // 陽
  '丑': 'yin',  // 陰
  '寅': 'yang', // 陽
  '卯': 'yin',  // 陰
  '辰': 'yang', // 陽
  '巳': 'yin',  // 陰
  '午': 'yang', // 陽
  '未': 'yin',  // 陰
  '申': 'yang', // 陽
  '酉': 'yin',  // 陰
  '戌': 'yang', // 陽
  '亥': 'yin'   // 陰
};

// 地支の蔵干（地支に隠れた天干）
export const hiddenStems = {
  '子': ['癸'],
  '丑': ['己', '辛', '癸'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己', '丙'],
  '未': ['己', '乙', '丁'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '丁', '辛'],
  '亥': ['壬', '甲', '戊']
};

// 十神の定義
export const tenGods = {
  比肩: '比肩', // 比肩: 日主と同じ天干・同じ陰陽
  劫財: '劫財', // 劫財: 日主と同じ五行・異なる陰陽
  食神: '食神', // 食神: 日主が生じる五行・日主と同じ陰陽
  傷官: '傷官', // 傷官: 日主が生じる五行・日主と異なる陰陽
  偏財: '偏財', // 偏財: 日主が克する五行・日主と同じ陰陽
  正財: '正財', // 正財: 日主が克する五行・日主と異なる陰陽
  偏官: '偏官', // 偏官: 日主を克する五行・日主と同じ陰陽
  正官: '正官', // 正官: 日主を克する五行・日主と異なる陰陽
  偏印: '偏印', // 偏印: 日主を生じる五行・日主と同じ陰陽
  正印: '正印'  // 正印: 日主を生じる五行・日主と異なる陰陽
};

// 五行の相生関係（生じる関係）: 木→火→土→金→水→木
export const generatesRelation = {
  '木': '火',
  '火': '土',
  '土': '金',
  '金': '水',
  '水': '木'
};

// 五行の相剋関係（克する関係）: 木→土→水→火→金→木
export const controlsRelation = {
  '木': '土',
  '土': '水',
  '水': '火',
  '火': '金',
  '金': '木'
};

// 生まれる関係（被生）: 被生とは自分を生じる五行との関係
export const generatedByRelation = {
  '木': '水',
  '火': '木',
  '土': '火',
  '金': '土',
  '水': '金'
};

// 克される関係（被剋）: 被剋とは自分を克する五行との関係
export const controlledByRelation = {
  '木': '金',
  '火': '水',
  '土': '木',
  '金': '火',
  '水': '土'
};

/**
 * 十神関係を決定する汎用関数の基本形
 * 
 * @param dayStemElement 日干の五行
 * @param targetElement 対象の五行
 * @param dayStemYin 日干が陰かどうか
 * @param targetYin 対象が陰かどうか
 * @returns 十神関係
 */
export function determineTenGodRelation(
  dayStemElement: string, 
  targetElement: string, 
  dayStemYin: boolean, 
  targetYin: boolean
): string {
  
  // 同じ五行
  if (dayStemElement === targetElement) {
    return dayStemYin === targetYin ? '比肩' : '劫財';
  }
  
  // 日干が生じる五行（食神・傷官）
  if (generatesRelation[dayStemElement] === targetElement) {
    return dayStemYin === targetYin ? '食神' : '傷官';
  }
  
  // 日干が克する五行（偏財・正財）
  if (controlsRelation[dayStemElement] === targetElement) {
    return dayStemYin === targetYin ? '偏財' : '正財';
  }
  
  // 日干を克する五行（偏官・正官）
  if (controlledByRelation[dayStemElement] === targetElement) {
    return dayStemYin === targetYin ? '偏官' : '正官';
  }
  
  // 日干を生じる五行（偏印・正印）
  if (generatedByRelation[dayStemElement] === targetElement) {
    return dayStemYin === targetYin ? '偏印' : '正印';
  }
  
  return '未知'; // エラー状態
}
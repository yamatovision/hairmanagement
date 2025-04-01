"use strict";
/**
 * 陰陽五行に関する型定義
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIMPLIFIED_DAY_CALCULATION = exports.YIN_YANG_PROPERTIES = exports.ELEMENT_PROPERTIES = exports.FortuneCategory = void 0;
// 運勢カテゴリの型
var FortuneCategory;
(function (FortuneCategory) {
    FortuneCategory["CAREER"] = "career";
    FortuneCategory["RELATIONSHIP"] = "relationship";
    FortuneCategory["CREATIVITY"] = "creativity";
    FortuneCategory["HEALTH"] = "health";
    FortuneCategory["WEALTH"] = "wealth";
})(FortuneCategory || (exports.FortuneCategory = FortuneCategory = {}));
// 五行要素の特性
exports.ELEMENT_PROPERTIES = {
    '木': {
        nature: '成長、柔軟性、拡張',
        season: '春',
        direction: '東',
        color: ['緑', '青緑', 'ターコイズ'],
        traits: ['創造性', '適応性', '寛容', '成長志向'],
        strengths: ['変化への適応力', '新しいアイデアの創造', '柔軟な思考'],
        weaknesses: ['優柔不断', '集中力不足', '衝動的'],
        keywords: ['成長', '拡張', '創造', '柔軟', '適応', '革新', '発展', '前進']
    },
    '火': {
        nature: '変換、熱情、活力',
        season: '夏',
        direction: '南',
        color: ['赤', 'オレンジ', 'ピンク'],
        traits: ['情熱', 'エネルギッシュ', '表現力豊か', '活発'],
        strengths: ['リーダーシップ', '熱意の伝達', '人を鼓舞する力'],
        weaknesses: ['焦り', '短気', 'バーンアウト'],
        keywords: ['情熱', '変換', '活力', '表現', '喜び', '輝き', '行動', '熱意']
    },
    '土': {
        nature: '安定、信頼性、中心',
        season: '季節の変わり目',
        direction: '中央',
        color: ['黄色', '茶色', 'ベージュ'],
        traits: ['安定', '信頼性', '現実的', '堅実'],
        strengths: ['実用性', '忍耐力', '信頼の構築'],
        weaknesses: ['頑固', '変化への抵抗', '保守的すぎる'],
        keywords: ['安定', '調和', '中心', '実用', '堅実', '信頼', '基盤', '秩序']
    },
    '金': {
        nature: '収穫、精度、明晰さ',
        season: '秋',
        direction: '西',
        color: ['白', '銀', 'ゴールド'],
        traits: ['精密', '完璧主義', '決断力', '効率的'],
        strengths: ['細部への注意', '実行力', '整理整頓の能力'],
        weaknesses: ['批判的', '冷淡', '融通が利かない'],
        keywords: ['精度', '明晰', '決断', '規律', '効率', '完成', '浄化', '整理']
    },
    '水': {
        nature: '流動性、知恵、適応',
        season: '冬',
        direction: '北',
        color: ['青', '紺', '黒'],
        traits: ['知的', '直感的', '内省的', '柔軟'],
        strengths: ['深い洞察力', '適応力', '知識の蓄積'],
        weaknesses: ['恐れ', '優柔不断', '不安'],
        keywords: ['流動', '知恵', '深み', '静寂', '潜在', '感受性', '直感', '冷静']
    }
};
// 陰陽の特性
exports.YIN_YANG_PROPERTIES = {
    '陰': {
        nature: ['内向的', '受容的', '静的', '冷たい', '暗い'],
        traits: ['静けさ', '内省', '受容性', '直感', '保守的'],
        energy: '凝縮するエネルギー'
    },
    '陽': {
        nature: ['外向的', '活動的', '動的', '温かい', '明るい'],
        traits: ['活発さ', '表現力', '積極性', '論理的', '拡張的'],
        energy: '拡散するエネルギー'
    }
};
// 簡略化した日の五行計算
exports.SIMPLIFIED_DAY_CALCULATION = {
    dayElementMap: {
        0: '木',
        1: '火',
        2: '土',
        3: '金',
        4: '水'
    },
    dayYinYangMap: {
        odd: '陽', // 奇数日は陽
        even: '陰' // 偶数日は陰
    }
};

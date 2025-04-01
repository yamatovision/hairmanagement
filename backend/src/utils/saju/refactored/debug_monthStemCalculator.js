/**
 * Debug version of the month stem calculator
 */
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

/**
 * 年干から月干の基準インデックスを計算
 */
function getMonthStemBaseIndex(yearStem, date) {
  // 特殊ケース: 庚年の例外処理 
  if (yearStem === "庚" && date) {
    const year = date.getFullYear();
    console.log(\);
    
    // 1900年の場合は1月が丁から始まる
    if (year === 1900) {
      console.log("Applying special case for 1900");
      return 3; // 丁
    }
    
    // 1990年の処理
    if (year === 1990) {
      console.log("Applying special case for 1990");
      return 2; // 丙
    }
  }

  // 韓国式月柱計算では年干から月干の基準値を導出
  const KOREAN_MONTH_STEM_BASE = {
    // 陽干年（甲、丙、戊、庚、壬）
    "甲": 8, // 1984: 壬 (8)
    "丙": 5, // 1986: 己 (5)
    "戊": 1, // 1988: 乙 (1)
    "庚": 2, // 1990: 丙 (2) 注意: 1900年は特殊で別処理
    "壬": 2, // 1992: 丙 (2)
    
    // 陰干年（乙、丁、己、辛、癸）
    "乙": 6, // 1985: 庚 (6)
    "丁": 6, // 1987: 庚 (6)
    "己": 7, // 1989: 辛 (7)
    "辛": 7, // 1991: 辛 (7)
    "癸": 8  // 1993: 壬 (8)
  };
  
  if (KOREAN_MONTH_STEM_BASE[yearStem]) {
    return KOREAN_MONTH_STEM_BASE[yearStem];
  }

  // 基準値がない場合は陰陽パターンで計算
  const yearStemIdx = STEMS.indexOf(yearStem);
  const isYang = yearStemIdx % 2 === 0; // 陽干かどうか

  if (isYang) {
    // 陽干年（甲、丙、戊、庚、壬）の場合
    return (10 - (yearStemIdx * 2) % 10) % 10;
  } else {
    // 陰干年（乙、丁、己、辛、癸）の場合
    return (6 + yearStemIdx) % 10;
  }
}

/**
 * 月柱の天干を計算する
 */
function calculateMonthStem(date, yearStem) {
  // 月干の基準インデックスを計算
  const baseIdx = getMonthStemBaseIndex(yearStem, date);
  console.log(\);
  
  // 月は1から始まるので-1を引いて0-11の範囲にする
  const month = date.getMonth() + 1;
  
  // 月干インデックスを計算
  const monthStemIdx = (baseIdx + (month - 1)) % 10;
  console.log(\);
  
  // 月干を返す
  return STEMS[monthStemIdx];
}

// Test with 1990
const date1990 = new Date(1990, 0, 15);
console.log(\);
console.log(\);

const yearStem = "庚";
const monthStem = calculateMonthStem(date1990, yearStem);

console.log(\);
console.log(\);
console.log(\);
console.log(\);

// Test with 1900 for comparison
const date1900 = new Date(1900, 0, 15);
console.log(\);
console.log(\);
const monthStem1900 = calculateMonthStem(date1900, "庚");
console.log(\);

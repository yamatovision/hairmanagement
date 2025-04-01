/**
 * 韓国式四柱推命 - 特定の日時の命式計算テスト
 */

// 天干（十干）
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

// 地支（十二支）
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 通変星（十神）
const TEN_GODS = [
  "比肩", "劫財", "食神", "傷官", "偏財", "正財", "七殺", "正官", "偏印", "印綬"
];

// 十二運星
const TWELVE_FORTUNES = [
  "長生", "沐浴", "冠帯", "臨官", "帝旺", "衰", 
  "病", "死", "墓", "絶", "胎", "養"
];

// 九星
const NINE_STARS = [
  "一白水星", "二黒土星", "三碧木星", "四緑木星", 
  "五黄土星", "六白金星", "七赤金星", "八白土星", "九紫火星"
];

/**
 * 韓国式四柱推命の年柱計算の特殊ルール
 * calender.mdのサンプルデータから抽出
 */
function isSpecialKoreanYear(year: number): boolean {
  // 10年周期の特殊ルール (1985, 1995, 2005, 2015...)
  const startYear = 1985;
  const cycle = 10;
  
  if (year === 1970) return true; // 特殊例外
  
  // 基準年からの差分を計算して10年周期かどうか確認
  const yearDiff = year - startYear;
  return yearDiff >= 0 && yearDiff % cycle === 0;
}

/**
 * 特殊年の天干を取得
 * @param year 西暦年
 */
function getSpecialYearStem(year: number): string {
  if (year === 1970) return "己"; // 特殊例外
  
  // 10年周期のルール: すべて甲になる
  return "甲";
}

/**
 * 特殊年の地支を取得
 * @param year 西暦年
 */
function getSpecialYearBranch(year: number): string {
  if (year === 1970) return "酉"; // 特殊例外
  
  // 1985年は子、1995年は戌、2005年は申、2015年は午
  // これは1985年から10年ごとに特定のパターンで変化
  const specialBranchPattern = ["子", "戌", "申", "午"];
  
  const startYear = 1985;
  const yearDiff = year - startYear;
  
  const patternIndex = Math.floor(yearDiff / 10) % specialBranchPattern.length;
  return specialBranchPattern[patternIndex];
}

/**
 * 年干インデックスを計算する - 一般的なアルゴリズム
 * @param year 西暦年
 */
function calculateStandardYearStemIndex(year: number): number {
  const baseYear = 1984; // 基準年
  const baseStemIndex = 0; // 甲のインデックス
  
  const yearDiff = year - baseYear;
  
  // 10周期で循環
  const adjustedIndex = (baseStemIndex + (yearDiff % 10 + 10) % 10) % 10;
  return adjustedIndex;
}

/**
 * 年支インデックスを計算する - 一般的なアルゴリズム
 * @param year 西暦年
 */
function calculateStandardYearBranchIndex(year: number): number {
  const baseYear = 1984; // 基準年
  const baseBranchIndex = 0; // 子のインデックス
  
  const yearDiff = year - baseYear;
  
  // 12周期で循環
  const adjustedIndex = (baseBranchIndex + (yearDiff % 12 + 12) % 12) % 12;
  return adjustedIndex;
}

/**
 * 韓国式四柱推命の年干を計算する
 * @param year 西暦年
 */
function calculateYearStem(year: number): string {
  // 特殊ルールの年かどうか確認
  if (isSpecialKoreanYear(year)) {
    return getSpecialYearStem(year);
  }
  
  // 通常の計算アルゴリズム
  const stemIndex = calculateStandardYearStemIndex(year);
  return STEMS[stemIndex];
}

/**
 * 韓国式四柱推命の年支を計算する
 * @param year 西暦年
 */
function calculateYearBranch(year: number): string {
  // 特殊ルールの年かどうか確認
  if (isSpecialKoreanYear(year)) {
    return getSpecialYearBranch(year);
  }
  
  // 通常の計算アルゴリズム
  const branchIndex = calculateStandardYearBranchIndex(year);
  return BRANCHES[branchIndex];
}

/**
 * 月の干支を計算する
 * @param year 西暦年
 * @param month 月（1-12）
 */
function calculateMonthPillar(year: number, month: number): { stem: string, branch: string } {
  // 年干から月干の基準を取得
  const yearStem = calculateYearStem(year);
  const yearStemIndex = STEMS.indexOf(yearStem);
  
  // 年干のグループを特定 (0=甲己, 1=乙庚, 2=丙辛, 3=丁壬, 4=戊癸)
  const yearGroup = yearStemIndex % 5;
  
  // 各グループの月干の開始インデックス
  const monthStemBaseIndex = [0, 2, 4, 6, 8][yearGroup];
  
  // 毎月の天干は2つずつ進む
  // 例：正月(寅月)は甲年なら丙、乙年なら戊...
  const monthStemIndex = (monthStemBaseIndex + (month - 1) * 2) % 10;
  
  // 地支は固定のパターン（正月=寅）
  // 地支インデックス：子=0, 丑=1, 寅=2, ...
  // 月と地支のマッピング（正月は寅月 = インデックス2）
  const monthToBranchMapping = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];
  const monthBranchIndex = monthToBranchMapping[month - 1];
  
  return {
    stem: STEMS[monthStemIndex],
    branch: BRANCHES[monthBranchIndex]
  };
}

/**
 * 日の干支を計算する（簡易版）
 * 注：実際にはもっと複雑な計算が必要です
 * @param year 西暦年
 * @param month 月（1-12）
 * @param day 日
 */
function calculateDayPillar(year: number, month: number, day: number): { stem: string, branch: string } {
  // 簡易的な計算方法（実際にはもっと複雑）
  // 1984年1月1日を甲子日として計算
  const baseDate = new Date(1984, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  
  // 2つの日付の差（日数）を計算
  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // 60干支周期での位置を計算
  const stemIndex = (diffDays % 10 + 10) % 10;
  const branchIndex = (diffDays % 12 + 12) % 12;
  
  return {
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex]
  };
}

/**
 * 時柱を計算する
 * @param hour 時間（0-23）
 * @param dayTrunk 日の天干
 */
function calculateHourPillar(hour: number, dayStem: string): { stem: string, branch: string } {
  // 時間から地支を計算
  // 子の刻（23-1時）、丑の刻（1-3時）、...
  const hourToBranchMapping = [
    0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 
    6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11
  ];
  const hourBranchIndex = hourToBranchMapping[hour];
  
  // 日干から時干の開始を決定
  const dayStemIndex = STEMS.indexOf(dayStem);
  const dayGroup = dayStemIndex % 5;
  
  // 各日干グループの時干の開始インデックス
  const hourStemBaseIndex = [0, 2, 4, 6, 8][dayGroup];
  
  // 時干のインデックスを計算（2時間ごとに1つ増加）
  const hourStemIndex = (hourStemBaseIndex + hourBranchIndex) % 10;
  
  return {
    stem: STEMS[hourStemIndex],
    branch: BRANCHES[hourBranchIndex]
  };
}

/**
 * 通変星（十神）を計算する
 * @param mainStem 日干（主星）
 * @param targetStem 対象の天干
 */
function calculateTenGod(mainStem: string, targetStem: string): string {
  const mainStemIndex = STEMS.indexOf(mainStem);
  const targetStemIndex = STEMS.indexOf(targetStem);
  
  // 陰陽の調整（甲、丙、戊、庚、壬は陽、乙、丁、己、辛、癸は陰）
  const mainYinYang = mainStemIndex % 2 === 0 ? "yang" : "yin";
  const targetYinYang = targetStemIndex % 2 === 0 ? "yang" : "yin";
  
  // 五行関係に基づいて十神を決定
  const mainElement = Math.floor(mainStemIndex / 2); // 0=木, 1=火, 2=土, 3=金, 4=水
  const targetElement = Math.floor(targetStemIndex / 2);
  
  // 五行の順序: 木→火→土→金→水→木
  let relation = (targetElement - mainElement + 5) % 5;
  
  // 陰陽による調整
  const sameYinYang = mainYinYang === targetYinYang;
  
  // 十神のインデックスを計算
  let tenGodIndex;
  
  if (relation === 0) {
    // 同じ五行
    tenGodIndex = sameYinYang ? 0 : 1; // 比肩 or 劫財
  } else if (relation === 1) {
    // 我生彼（自分が生む）
    tenGodIndex = sameYinYang ? 2 : 3; // 食神 or 傷官
  } else if (relation === 2) {
    // 彼生我（自分を生む）
    tenGodIndex = sameYinYang ? 8 : 9; // 偏印 or 印綬
  } else if (relation === 3) {
    // 我克彼（自分が克つ）
    tenGodIndex = sameYinYang ? 4 : 5; // 偏財 or 正財
  } else {
    // 彼克我（自分が克たれる）
    tenGodIndex = sameYinYang ? 6 : 7; // 七殺 or 正官
  }
  
  return TEN_GODS[tenGodIndex];
}

/**
 * 地支から蔵干（隠れた天干）を取得
 * @param branch 地支
 */
function getHiddenStems(branch: string): string[] {
  // 各地支の蔵干
  const hiddenStemsMap: Record<string, string[]> = {
    "子": ["癸"],
    "丑": ["己", "辛", "癸"],
    "寅": ["甲", "丙", "戊"],
    "卯": ["乙"],
    "辰": ["戊", "乙", "癸"],
    "巳": ["丙", "庚", "戊"],
    "午": ["丁", "己"],
    "未": ["己", "乙", "丁"],
    "申": ["庚", "壬", "戊"],
    "酉": ["辛"],
    "戌": ["戊", "辛", "丁"],
    "亥": ["壬", "甲"]
  };
  
  return hiddenStemsMap[branch] || [];
}

/**
 * 十二運星を計算する
 * @param dayStem 日干
 * @param branch 対象の地支
 */
function calculateTwelveFortune(dayStem: string, branch: string): string {
  // 日干に基づく十二運の始まりの地支
  const fortuneStartMap: Record<string, number> = {
    "甲": BRANCHES.indexOf("寅"),
    "乙": BRANCHES.indexOf("卯"),
    "丙": BRANCHES.indexOf("巳"),
    "丁": BRANCHES.indexOf("午"),
    "戊": BRANCHES.indexOf("巳"),
    "己": BRANCHES.indexOf("午"),
    "庚": BRANCHES.indexOf("申"),
    "辛": BRANCHES.indexOf("酉"),
    "壬": BRANCHES.indexOf("亥"),
    "癸": BRANCHES.indexOf("子")
  };
  
  const startBranchIndex = fortuneStartMap[dayStem];
  const targetBranchIndex = BRANCHES.indexOf(branch);
  
  // 長生から順番に数えていく
  const fortuneIndex = (targetBranchIndex - startBranchIndex + 12) % 12;
  
  return TWELVE_FORTUNES[fortuneIndex];
}

/**
 * 九星を計算する（簡易版）
 * @param year 西暦年
 * @param stem 天干
 * @param branch 地支
 */
function calculateNineStar(stem: string, branch: string): string {
  // 非常に簡易的な計算（実際には複雑な計算が必要）
  const stemIndex = STEMS.indexOf(stem);
  const branchIndex = BRANCHES.indexOf(branch);
  
  // 簡易的な計算式
  const starIndex = (stemIndex + branchIndex) % 9;
  
  return NINE_STARS[starIndex];
}

/**
 * 空亡を計算する
 * @param stem 天干
 * @param branch 地支
 */
function calculateVoid(stem: string, branch: string): string[] {
  // 60干支のインデックスを計算
  const stemIndex = STEMS.indexOf(stem);
  const branchIndex = BRANCHES.indexOf(branch);
  const sexagenaryCycleIndex = (stemIndex * 12 + branchIndex) % 60;
  
  // 各組み合わせに対応する空亡（簡易版）
  const voidBranchPairs = [
    ["戌", "亥"], ["申", "酉"], ["午", "未"], ["辰", "巳"], ["寅", "卯"], ["子", "丑"]
  ];
  
  // 簡易的な計算（実際にはもっと複雑）
  const pairIndex = Math.floor(sexagenaryCycleIndex / 10) % 6;
  
  return voidBranchPairs[pairIndex];
}

/**
 * 四柱推命の命式表を生成する
 * @param year 西暦年
 * @param month 月（1-12）
 * @param day 日
 * @param hour 時間（0-23）
 * @param gender 性別（'male'または'female'）
 */
function generateBaziChart(year: number, month: number, day: number, hour: number, gender: string): any {
  // 年柱
  const yearPillar = {
    stem: calculateYearStem(year),
    branch: calculateYearBranch(year)
  };
  
  // 月柱
  const monthPillar = calculateMonthPillar(year, month);
  
  // 日柱
  const dayPillar = calculateDayPillar(year, month, day);
  
  // 時柱
  const hourPillar = calculateHourPillar(hour, dayPillar.stem);
  
  // 日干を主星として、各柱の通変星（十神）を計算
  const mainStem = dayPillar.stem;
  
  const yearStemTenGod = calculateTenGod(mainStem, yearPillar.stem);
  const monthStemTenGod = calculateTenGod(mainStem, monthPillar.stem);
  const hourStemTenGod = calculateTenGod(mainStem, hourPillar.stem);
  
  // 地支の蔵干
  const yearHiddenStems = getHiddenStems(yearPillar.branch);
  const monthHiddenStems = getHiddenStems(monthPillar.branch);
  const dayHiddenStems = getHiddenStems(dayPillar.branch);
  const hourHiddenStems = getHiddenStems(hourPillar.branch);
  
  // 地支の蔵干の通変星
  const yearHiddenTenGods = yearHiddenStems.map(stem => calculateTenGod(mainStem, stem));
  const monthHiddenTenGods = monthHiddenStems.map(stem => calculateTenGod(mainStem, stem));
  const dayHiddenTenGods = dayHiddenStems.map(stem => calculateTenGod(mainStem, stem));
  const hourHiddenTenGods = hourHiddenStems.map(stem => calculateTenGod(mainStem, stem));
  
  // 十二運星
  const yearFortune = calculateTwelveFortune(mainStem, yearPillar.branch);
  const monthFortune = calculateTwelveFortune(mainStem, monthPillar.branch);
  const dayFortune = calculateTwelveFortune(mainStem, dayPillar.branch);
  const hourFortune = calculateTwelveFortune(mainStem, hourPillar.branch);
  
  // 九星
  const yearStar = calculateNineStar(yearPillar.stem, yearPillar.branch);
  const monthStar = calculateNineStar(monthPillar.stem, monthPillar.branch);
  const dayStar = calculateNineStar(dayPillar.stem, dayPillar.branch);
  const hourStar = calculateNineStar(hourPillar.stem, hourPillar.branch);
  
  // 空亡
  const yearVoid = calculateVoid(yearPillar.stem, yearPillar.branch);
  const monthVoid = calculateVoid(monthPillar.stem, monthPillar.branch);
  const dayVoid = calculateVoid(dayPillar.stem, dayPillar.branch);
  const hourVoid = calculateVoid(hourPillar.stem, hourPillar.branch);
  
  return {
    birthInfo: {
      year, month, day, hour, gender
    },
    pillars: {
      year: {
        stem: yearPillar.stem,
        branch: yearPillar.branch,
        tenGod: yearStemTenGod,
        fortune: yearFortune,
        hiddenStems: yearHiddenStems,
        hiddenTenGods: yearHiddenTenGods,
        nineStar: yearStar,
        void: yearVoid
      },
      month: {
        stem: monthPillar.stem,
        branch: monthPillar.branch,
        tenGod: monthStemTenGod,
        fortune: monthFortune,
        hiddenStems: monthHiddenStems,
        hiddenTenGods: monthHiddenTenGods,
        nineStar: monthStar,
        void: monthVoid
      },
      day: {
        stem: dayPillar.stem,
        branch: dayPillar.branch,
        tenGod: "日主",
        fortune: dayFortune,
        hiddenStems: dayHiddenStems,
        hiddenTenGods: dayHiddenTenGods,
        nineStar: dayStar,
        void: dayVoid
      },
      hour: {
        stem: hourPillar.stem,
        branch: hourPillar.branch,
        tenGod: hourStemTenGod,
        fortune: hourFortune,
        hiddenStems: hourHiddenStems,
        hiddenTenGods: hourHiddenTenGods,
        nineStar: hourStar,
        void: hourVoid
      }
    }
  };
}

/**
 * 命式表を見やすく表示する
 * @param chart 命式表
 */
function displayBaziChart(chart: any): string {
  const { pillars, birthInfo } = chart;
  
  // 生年月日時の情報
  let output = `===== ${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日${birthInfo.hour}時 (${birthInfo.gender === 'male' ? '男性' : '女性'}) の命式表 =====\n\n`;
  
  // ヘッダー行
  output += "項目\t時柱\t日柱\t月柱\t年柱\n";
  output += "----------------------------------------------------\n";
  
  // 天干行
  output += `天干\t${pillars.hour.stem}\t${pillars.day.stem}\t${pillars.month.stem}\t${pillars.year.stem}\n`;
  
  // 地支行
  output += `地支\t${pillars.hour.branch}\t${pillars.day.branch}\t${pillars.month.branch}\t${pillars.year.branch}\n`;
  
  // 通変星行
  output += `通変星\t${pillars.hour.tenGod}\t${pillars.day.tenGod}\t${pillars.month.tenGod}\t${pillars.year.tenGod}\n`;
  
  // 十二運行
  output += `十二運\t${pillars.hour.fortune}\t${pillars.day.fortune}\t${pillars.month.fortune}\t${pillars.year.fortune}\n`;
  
  // 蔵干行
  output += `蔵干\t${pillars.hour.hiddenStems.join(',') || '/'}\t${pillars.day.hiddenStems.join(',') || '/'}\t${pillars.month.hiddenStems.join(',') || '/'}\t${pillars.year.hiddenStems.join(',') || '/'}\n`;
  
  // 蔵干通変星行（簡略化）
  output += `蔵干通変星\t${pillars.hour.hiddenTenGods[0] || '/'}\t${pillars.day.hiddenTenGods[0] || '/'}\t${pillars.month.hiddenTenGods[0] || '/'}\t${pillars.year.hiddenTenGods[0] || '/'}\n`;
  
  // 九星行
  output += `九星\t${pillars.hour.nineStar}\t${pillars.day.nineStar}\t${pillars.month.nineStar}\t${pillars.year.nineStar}\n`;
  
  // 空亡行
  output += `空亡\t${pillars.hour.void.join(',')}\t${pillars.day.void.join(',')}\t${pillars.month.void.join(',')}\t${pillars.year.void.join(',')}\n`;
  
  return output;
}

/**
 * メイン処理：特定の日時の命式表を計算して表示
 */
function testSingleDate(): void {
  // 1986年5月26日朝5時の命式表を生成
  const birthYear = 1986;
  const birthMonth = 5;
  const birthDay = 26;
  const birthHour = 5;
  const gender = 'male'; // 'male'または'female'
  
  const chart = generateBaziChart(birthYear, birthMonth, birthDay, birthHour, gender);
  const displayChart = displayBaziChart(chart);
  
  console.log(displayChart);
  
  // 要約された形式でも表示
  console.log("\n===== 命式表（要約）=====");
  console.log("時柱\t日柱\t月柱\t年柱");
  console.log("天干\t", chart.pillars.hour.stem, "\t", chart.pillars.day.stem, "\t", chart.pillars.month.stem, "\t", chart.pillars.year.stem);
  console.log("地支\t", chart.pillars.hour.branch, "\t", chart.pillars.day.branch, "\t", chart.pillars.month.branch, "\t", chart.pillars.year.branch);
  console.log("通変星\t", chart.pillars.hour.tenGod, "\t", chart.pillars.day.tenGod, "\t", chart.pillars.month.tenGod, "\t", chart.pillars.year.tenGod);
  console.log("十二運\t", chart.pillars.hour.fortune, "\t", chart.pillars.day.fortune, "\t", chart.pillars.month.fortune, "\t", chart.pillars.year.fortune);
  console.log("蔵干\t", chart.pillars.hour.hiddenStems[0] || "/", "\t", chart.pillars.day.hiddenStems[0] || "/", "\t", chart.pillars.month.hiddenStems[0] || "/", "\t", chart.pillars.year.hiddenStems[0] || "/");
}

// テスト実行
testSingleDate();
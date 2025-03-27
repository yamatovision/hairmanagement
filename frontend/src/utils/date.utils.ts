/**
 * 日付フォーマットユーティリティ関数
 * 
 * 日付の表示形式や操作に関するユーティリティ関数を提供します。
 */

// 日付文字列を YYYY-MM-DD 形式に変換
export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 日付文字列を指定した形式に変換（デフォルト: YYYY/MM/DD）
export const formatDate = (
  dateStr: string | Date,
  format: string = 'YYYY/MM/DD'
): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  // 月・日・時・分・秒を2桁表示にするための関数
  const pad = (num: number): string => String(num).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('YY', String(year).slice(-2))
    .replace('MM', pad(month))
    .replace('M', String(month))
    .replace('DD', pad(day))
    .replace('D', String(day))
    .replace('HH', pad(hours))
    .replace('H', String(hours))
    .replace('mm', pad(minutes))
    .replace('m', String(minutes))
    .replace('ss', pad(seconds))
    .replace('s', String(seconds));
};

// 日本語形式の日付表示（例: 2023年4月1日）
export const formatDateJP = (dateStr: string | Date): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${year}年${month}月${day}日`;
};

// 日本語形式の曜日（例: 月曜日）
export const getDayOfWeekJP = (dateStr: string | Date): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const dayOfWeek = date.getDay();
  const days = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
  
  return days[dayOfWeek];
};

// 短い日本語形式の曜日（例: 月）
export const getShortDayOfWeekJP = (dateStr: string | Date): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const dayOfWeek = date.getDay();
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  
  return days[dayOfWeek];
};

// 相対的な時間表示（例: 3分前, 1時間前, 昨日, 先週）
export const getRelativeTime = (dateStr: string | Date): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // 1分未満
  if (diffInSeconds < 60) {
    return `${diffInSeconds}秒前`;
  }
  
  // 1時間未満
  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分前`;
  }
  
  // 24時間未満
  if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}時間前`;
  }
  
  // 7日未満
  if (diffInSeconds < 604800) {
    return `${Math.floor(diffInSeconds / 86400)}日前`;
  }
  
  // 30日未満
  if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 604800)}週間前`;
  }
  
  // 12ヶ月未満
  if (diffInSeconds < 31536000) {
    return `${Math.floor(diffInSeconds / 2592000)}ヶ月前`;
  }
  
  // それ以上
  return `${Math.floor(diffInSeconds / 31536000)}年前`;
};

// 指定した日数を加算/減算した日付を取得
export const addDays = (dateStr: string | Date, days: number): Date => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : new Date(dateStr.getTime());
  date.setDate(date.getDate() + days);
  return date;
};

// 指定した月数を加算/減算した日付を取得
export const addMonths = (dateStr: string | Date, months: number): Date => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : new Date(dateStr.getTime());
  date.setMonth(date.getMonth() + months);
  return date;
};

// 指定した年数を加算/減算した日付を取得
export const addYears = (dateStr: string | Date, years: number): Date => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : new Date(dateStr.getTime());
  date.setFullYear(date.getFullYear() + years);
  return date;
};

// 2つの日付の差を日数で取得
export const getDaysDifference = (
  dateStr1: string | Date,
  dateStr2: string | Date
): number => {
  const date1 = typeof dateStr1 === 'string' ? new Date(dateStr1) : new Date(dateStr1.getTime());
  const date2 = typeof dateStr2 === 'string' ? new Date(dateStr2) : new Date(dateStr2.getTime());
  
  // 時間部分をリセット
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);
  
  // 差をミリ秒で取得し、日数に変換
  const diffInMs = date2.getTime() - date1.getTime();
  return Math.round(diffInMs / (1000 * 60 * 60 * 24));
};

// 日付が指定した範囲内かどうかをチェック
export const isDateInRange = (
  date: string | Date,
  startDate: string | Date,
  endDate: string | Date
): boolean => {
  const targetDate = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
  const start = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate.getTime());
  const end = typeof endDate === 'string' ? new Date(endDate) : new Date(endDate.getTime());
  
  // 時間部分をリセット
  targetDate.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  return targetDate >= start && targetDate <= end;
};

// 生年月日から年齢を計算
export const calculateAge = (birthDate: string | Date): number => {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : new Date(birthDate.getTime());
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};
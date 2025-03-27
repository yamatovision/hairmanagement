/**
 * フォーマットユーティリティ関数
 * 
 * 文字列、数値、通貨などの表示形式を整えるユーティリティ関数を提供します。
 */

// 数値をカンマ区切りに整形する関数（例: 1000 -> 1,000）
export const formatNumber = (
  value: number | string, 
  options: Intl.NumberFormatOptions = {}
): string => {
  const numberValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numberValue)) {
    return 'Invalid number';
  }
  
  return new Intl.NumberFormat('ja-JP', options).format(numberValue);
};

// 通貨フォーマット（例: 1000 -> ¥1,000）
export const formatCurrency = (
  value: number | string, 
  currency: string = 'JPY',
  options: Intl.NumberFormatOptions = {}
): string => {
  const numberValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numberValue)) {
    return 'Invalid number';
  }
  
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
    ...options
  }).format(numberValue);
};

// パーセント表示（例: 0.8 -> 80%）
export const formatPercent = (
  value: number | string,
  decimalPlaces: number = 0
): string => {
  const numberValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numberValue)) {
    return 'Invalid number';
  }
  
  return new Intl.NumberFormat('ja-JP', {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  }).format(numberValue);
};

// 電話番号フォーマット（例: 09012345678 -> 090-1234-5678）
export const formatPhoneNumber = (value: string): string => {
  if (!value) return '';
  
  // 数字以外を削除
  const cleaned = value.replace(/\D/g, '');
  
  // 日本の電話番号形式に変換
  const match = cleaned.match(/^(\d{1,4})(\d{1,4})(\d{1,4})$/);
  
  if (match) {
    return match.slice(1).join('-');
  }
  
  return cleaned;
};

// 郵便番号フォーマット（例: 1234567 -> 123-4567）
export const formatPostalCode = (value: string): string => {
  if (!value) return '';
  
  // 数字以外を削除
  const cleaned = value.replace(/\D/g, '');
  
  // 郵便番号形式に変換
  const match = cleaned.match(/^(\d{3})(\d{4})$/);
  
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  
  return cleaned;
};

// 文字数制限（長い文字列を省略する）
export const truncateText = (
  text: string, 
  maxLength: number = 50, 
  suffix: string = '...'
): string => {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength).trim() + suffix;
};

// 先頭を大文字にする
export const capitalize = (text: string): string => {
  if (!text) return '';
  
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// 全単語の先頭を大文字にする
export const titleCase = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// カンマ区切りの文字列を配列に変換（例: "apple, banana, orange" -> ["apple", "banana", "orange"]）
export const parseCommaSeparatedValues = (text: string): string[] => {
  if (!text) return [];
  
  return text
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
};

// ケバブケースをキャメルケースに変換（例: user-name -> userName）
export const kebabToCamel = (text: string): string => {
  if (!text) return '';
  
  return text.replace(/-([a-z])/g, match => match[1].toUpperCase());
};

// キャメルケースをケバブケースに変換（例: userName -> user-name）
export const camelToKebab = (text: string): string => {
  if (!text) return '';
  
  return text.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
};

// キャメルケースをスネークケースに変換（例: userName -> user_name）
export const camelToSnake = (text: string): string => {
  if (!text) return '';
  
  return text.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
};

// 文字列がメールアドレス形式かどうかをチェック
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 文字列がURLかどうかをチェック
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// 文字列が安全なパスワードかどうかをチェック（少なくとも8文字、数字、大文字、小文字、特殊文字を含む）
export const isStrongPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};
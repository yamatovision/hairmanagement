/**
 * アーカイブ用の型定義ファイル - このファイルは非推奨です。
 * 
 * 注意: このファイルはアーカイブディレクトリの古いコンポーネントで使用される型定義を含みます。
 * 新しいコードでは src/types/models.ts を使用してください。
 */

// 以下の型定義は、アーカイブコンポーネントのコンパイルエラーを修正するために用意されています。

// 五行の基本要素
export type ElementType = '木' | '火' | '土' | '金' | '水';

// 陰陽
export type YinYangType = '陰' | '陽';

// 陰陽五行の属性情報
export type ElementalType = {
  mainElement: ElementType;
  secondaryElement?: ElementType;
  yinYang: YinYangType;
};

// 運勢情報
export interface IFortune {
  id: string;
  userId: string;
  date: string;
  overallScore: number;
  starRating: number;
  rating: 'excellent' | 'good' | 'neutral' | 'caution' | 'poor';
  categories: {
    work: number;
    teamwork: number;
    health: number;
    communication: number;
  };
  advice: string;
  // 目標関連情報
  personalGoal?: string;
  teamGoal?: string;
  sajuData?: {
    mainElement: string;
    yinYang: string;
    compatibility: number;
    dayMaster?: string;
    tenGod?: string;
    earthBranch?: string;
    todayPillars?: string; // 今日の四柱情報
    dayElement?: string;   // 今日の日の五行属性（木・火・土・金・水）
  };
  viewedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  // エラーハンドリング用の追加フィールド
  error?: boolean;
  message?: string;
}
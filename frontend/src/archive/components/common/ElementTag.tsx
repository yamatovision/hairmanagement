/**
 * アーカイブ用のダミーコンポーネント
 * TypeScriptのコンパイルエラーを防止するためのファイル
 */

import React from 'react';

// 型定義
export type ElementType = '木' | '火' | '土' | '金' | '水';
export type ElementTagSize = 'small' | 'medium' | 'large';

interface ElementTagProps {
  element: ElementType;
  size?: ElementTagSize;
}

// ダミーコンポーネント
const ElementTag: React.FC<ElementTagProps> = ({ element, size = 'medium' }) => {
  return <div>{element}</div>;
};

export default ElementTag;